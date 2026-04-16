"""Load transformed movie data into DynamoDB (LocalStack or AWS).

Converts normalized DataFrames into DynamoDB items following the
single-table design in docs/spec/design.md, then batch writes them.
"""

import logging
import os
from decimal import Decimal

import boto3
from botocore.config import Config

logger = logging.getLogger(__name__)

ENDPOINT_URL = os.getenv("DYNAMODB_ENDPOINT", "http://localhost:4566")
REGION = os.getenv("AWS_REGION", "us-west-2")
TABLE_NAME = "MovieCatalog"
BATCH_SIZE = 25  # DynamoDB max per batch_write_item


def get_table():
    dynamodb = boto3.resource(
        "dynamodb",
        endpoint_url=ENDPOINT_URL,
        region_name=REGION,
        config=Config(retries={"max_attempts": 5, "mode": "adaptive"}),
    )
    return dynamodb.Table(TABLE_NAME)


def clean(val):
    """Convert a value to DynamoDB-safe format. No floats, no empty strings, no NaN."""
    if val is None or (isinstance(val, float) and (val != val)):  # NaN check
        return None
    if isinstance(val, float):
        return Decimal(str(val))
    if isinstance(val, str) and val.strip() == "":
        return None
    return val


def movie_items(row, genres, cast_df, crew_df):
    """Convert one movie row + its relations into a list of DynamoDB items."""
    mid = str(int(row["id"]))
    release_date = str(row["release_date"])[:10] if row.get("release_date") else None
    release_year = release_date[:4] if release_date and release_date != "NaT" else "0000"
    popularity = clean(row.get("popularity", 0)) or Decimal("0")
    vote_avg = clean(row.get("vote_average", 0)) or Decimal("0")

    # GSI-projected fields reused across items
    gsi_fields = {
        "title": clean(row.get("title")),
        "releaseYear": release_year,
        "voteAvg": vote_avg,
        "popularity": popularity,
        "posterUrl": None,  # filled later by TMDB enrichment
    }

    items = []

    # 1. Movie metadata
    meta = {
        "PK": f"MOVIE#{mid}",
        "SK": "#METADATA",
        "overview": clean(row.get("overview")),
        "releaseDate": release_date if release_date != "NaT" else None,
        "budget": clean(row.get("budget")),
        "revenue": clean(row.get("revenue")),
        "runtime": clean(row.get("runtime")),
        "tagline": clean(row.get("tagline")),
        "status": clean(row.get("status")),
        "voteCount": clean(row.get("vote_count")),
        # GSI1: movies by decade
        "GSI1PK": f"DECADE#{release_year[:3]}0s" if release_year != "0000" else None,
        "GSI1SK": f"{popularity}#{mid}",
        # GSI2: top rated
        "GSI2PK": f"STATUS#{row.get('status', 'Released')}",
        "GSI2SK": f"{vote_avg}#{mid}",
        **gsi_fields,
    }
    items.append({k: v for k, v in meta.items() if v is not None})

    # 2. Genre items
    for g in genres:
        gname = g.get("genre_name") or g.get("name", "Unknown")
        gid = g.get("genre_id") or g.get("id")
        item = {
            "PK": f"MOVIE#{mid}",
            "SK": f"GENRE#{gname}",
            "genreId": clean(gid),
            "genreName": gname,
            # GSI1: movies by genre
            "GSI1PK": f"GENRE#{gname}",
            "GSI1SK": f"{release_year}#{mid}",
            **gsi_fields,
        }
        items.append({k: v for k, v in item.items() if v is not None})

    # 3. Cast items
    movie_cast = cast_df[cast_df["movie_id"] == row["id"]]
    for _, c in movie_cast.iterrows():
        pid = str(int(c["person_id"]))
        order = str(int(c["cast_order"])).zfill(3)
        item = {
            "PK": f"MOVIE#{mid}",
            "SK": f"CAST#{order}#{pid}",
            "personName": clean(c.get("name")),
            "character": clean(c.get("character_name")),
            "castOrder": clean(c["cast_order"]),
            # GSI1: person filmography
            "GSI1PK": f"PERSON#{pid}",
            "GSI1SK": f"{release_year}#{mid}",
            **gsi_fields,
        }
        items.append({k: v for k, v in item.items() if v is not None})

    # 4. Crew items
    movie_crew = crew_df[crew_df["movie_id"] == row["id"]]
    for _, c in movie_crew.iterrows():
        pid = str(int(c["person_id"]))
        dept = c.get("department", "Unknown")
        item = {
            "PK": f"MOVIE#{mid}",
            "SK": f"CREW#{dept}#{pid}",
            "personName": clean(c.get("name")),
            "department": clean(dept),
            "job": clean(c.get("job")),
            # GSI1: person filmography
            "GSI1PK": f"PERSON#{pid}",
            "GSI1SK": f"{release_year}#{mid}",
            **gsi_fields,
        }
        items.append({k: v for k, v in item.items() if v is not None})

    return items


def batch_write(table, items):
    """Write items in batches of 25 with deduplication per batch."""
    # Deduplicate: last item wins for same PK+SK
    seen = {}
    for item in items:
        key = (item["PK"], item["SK"])
        seen[key] = item
    items = list(seen.values())

    total = len(items)
    written = 0

    with table.batch_writer(overwrite_by_pkeys=["PK", "SK"]) as writer:
        for item in items:
            writer.put_item(Item=item)
            written += 1
            if written % 10000 == 0:
                logger.info("Progress: %d / %d items (%.0f%%)", written, total, written / total * 100)

    logger.info("Progress: %d / %d items (100%%)", written, total)
    return written


def load_movies(movies_df, genres_data, cast_df, crew_df):
    """Main entry point: convert all movies to DynamoDB items and batch write."""
    table = get_table()

    # Build genre lookup: movie_id -> list of genre dicts
    genre_lookup = {}
    for _, g in genres_data.iterrows():
        mid = g["movie_id"]
        genre_lookup.setdefault(mid, []).append(g.to_dict())

    all_items = []
    for _, row in movies_df.iterrows():
        genres = genre_lookup.get(row["id"], [])
        items = movie_items(row, genres, cast_df, crew_df)
        all_items.extend(items)

    logger.info("Generated %d DynamoDB items from %d movies", len(all_items), len(movies_df))
    written = batch_write(table, all_items)
    logger.info("Loaded %d items into %s", written, TABLE_NAME)
    return written


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")

    from extract import extract_all
    from transform import transform_movies, extract_genres, extract_cast, extract_crew

    logger.info("Starting ETL pipeline → DynamoDB")

    data = extract_all()
    movies_df = transform_movies(data["movies"])
    genres_df, genre_junction = extract_genres(data["movies"])
    persons_df, cast_df = extract_cast(data["credits"])
    persons_df, crew_df = extract_crew(data["credits"], persons_df)

    # Merge genre info for the loader (needs genre_name, not just genre_id)
    genre_data = genre_junction.merge(genres_df, left_on="genre_id", right_on="id", suffixes=("", "_genre"))

    # Merge person names into cast and crew
    cast_df = cast_df.merge(persons_df[["id", "name"]], left_on="person_id", right_on="id", suffixes=("", "_person"))
    crew_df = crew_df.merge(persons_df[["id", "name"]], left_on="person_id", right_on="id", suffixes=("", "_person"))

    load_movies(movies_df, genre_data, cast_df, crew_df)
    logger.info("ETL complete")
