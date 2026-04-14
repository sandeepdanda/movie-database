"""Verify DynamoDB data by testing each access pattern from the design doc."""

import logging
import os

import boto3
from boto3.dynamodb.conditions import Key

logger = logging.getLogger(__name__)

ENDPOINT_URL = os.getenv("DYNAMODB_ENDPOINT", "http://localhost:4566")
REGION = os.getenv("AWS_REGION", "us-west-2")
TABLE_NAME = "MovieCatalog"


def get_table():
    dynamodb = boto3.resource("dynamodb", endpoint_url=ENDPOINT_URL, region_name=REGION)
    return dynamodb.Table(TABLE_NAME)


def verify_all():
    table = get_table()
    passed = 0
    failed = 0

    # AP1: Movie by ID (full) - get movie + all related items
    print("\n--- AP1: Movie by ID ---")
    resp = table.query(KeyConditionExpression=Key("PK").eq("MOVIE#862"))  # Toy Story
    count = resp["Count"]
    print(f"  MOVIE#862 returned {count} items")
    if count > 0:
        meta = [i for i in resp["Items"] if i["SK"] == "#METADATA"]
        if meta:
            print(f"  Title: {meta[0].get('title')}")
        genres = [i for i in resp["Items"] if i["SK"].startswith("GENRE#")]
        print(f"  Genres: {[i.get('genreName') for i in genres]}")
        cast = [i for i in resp["Items"] if i["SK"].startswith("CAST#")]
        print(f"  Cast members: {len(cast)}")
        passed += 1
    else:
        print("  FAILED - no items found")
        failed += 1

    # AP2: Movies by genre (GSI1)
    print("\n--- AP2: Movies by genre ---")
    resp = table.query(
        IndexName="GSI1-EntityLookup",
        KeyConditionExpression=Key("GSI1PK").eq("GENRE#Action"),
        Limit=5,
        ScanIndexForward=False,
    )
    print(f"  Action movies: {resp['Count']} returned (limited to 5)")
    for item in resp["Items"][:3]:
        print(f"    {item.get('title')} ({item.get('releaseYear')})")
    passed += 1 if resp["Count"] > 0 else 0
    failed += 0 if resp["Count"] > 0 else 1

    # AP3: Person filmography (GSI1)
    print("\n--- AP3: Person filmography ---")
    resp = table.query(
        IndexName="GSI1-EntityLookup",
        KeyConditionExpression=Key("GSI1PK").eq("PERSON#31"),  # Tom Hanks
        ScanIndexForward=False,
    )
    print(f"  Person#31 filmography: {resp['Count']} movies")
    for item in resp["Items"][:3]:
        print(f"    {item.get('title')} ({item.get('releaseYear')})")
    passed += 1 if resp["Count"] > 0 else 0
    failed += 0 if resp["Count"] > 0 else 1

    # AP4: Movie cast only (begins_with)
    print("\n--- AP4: Movie cast only ---")
    resp = table.query(
        KeyConditionExpression=Key("PK").eq("MOVIE#862") & Key("SK").begins_with("CAST#"),
    )
    print(f"  MOVIE#862 cast: {resp['Count']} members")
    passed += 1 if resp["Count"] > 0 else 0
    failed += 0 if resp["Count"] > 0 else 1

    # AP5: Movies by decade (GSI1)
    print("\n--- AP5: Movies by decade ---")
    resp = table.query(
        IndexName="GSI1-EntityLookup",
        KeyConditionExpression=Key("GSI1PK").eq("DECADE#1990s"),
        Limit=5,
        ScanIndexForward=False,
    )
    print(f"  1990s movies: {resp['Count']} returned (limited to 5)")
    for item in resp["Items"][:3]:
        print(f"    {item.get('title')} ({item.get('releaseYear')})")
    passed += 1 if resp["Count"] > 0 else 0
    failed += 0 if resp["Count"] > 0 else 1

    # AP - Top rated (GSI2)
    print("\n--- Top rated movies (GSI2) ---")
    resp = table.query(
        IndexName="GSI2-RatingSort",
        KeyConditionExpression=Key("GSI2PK").eq("STATUS#Released"),
        Limit=5,
        ScanIndexForward=False,
    )
    print(f"  Top rated: {resp['Count']} returned (limited to 5)")
    for item in resp["Items"][:3]:
        print(f"    {item.get('title')} - rating: {item.get('voteAvg')}")
    passed += 1 if resp["Count"] > 0 else 0
    failed += 0 if resp["Count"] > 0 else 1

    # Item count
    print("\n--- Total items ---")
    scan = table.scan(Select="COUNT")
    print(f"  Total items in table: {scan['Count']}")

    print(f"\n{'='*40}")
    print(f"Results: {passed} passed, {failed} failed")
    return failed == 0


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    success = verify_all()
    exit(0 if success else 1)
