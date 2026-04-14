"""Generate a small test dataset (10 movies) to verify the ETL pipeline."""

import pandas as pd
from pathlib import Path

DATA_DIR = Path(__file__).parent.parent / "data"


def generate():
    DATA_DIR.mkdir(exist_ok=True)

    # 10 well-known movies with real IDs from TMDB
    movies = pd.DataFrame([
        {"id": 862, "title": "Toy Story", "overview": "A cowboy doll is threatened by a new spaceman figure.", "release_date": "1995-10-30", "budget": 30000000, "revenue": 373554033, "runtime": 81, "status": "Released", "popularity": 21.9, "vote_average": 7.7, "vote_count": 5415, "tagline": "", "genres": "[{'id': 16, 'name': 'Animation'}, {'id': 35, 'name': 'Comedy'}, {'id': 10751, 'name': 'Family'}]"},
        {"id": 550, "title": "Fight Club", "overview": "An insomniac office worker and a soap salesman build a global anarchist organization.", "release_date": "1999-10-15", "budget": 63000000, "revenue": 100853753, "runtime": 139, "status": "Released", "popularity": 61.4, "vote_average": 8.4, "vote_count": 9678, "tagline": "Mischief. Mayhem. Soap.", "genres": "[{'id': 18, 'name': 'Drama'}, {'id': 53, 'name': 'Thriller'}]"},
        {"id": 680, "title": "Pulp Fiction", "overview": "The lives of two mob hitmen, a boxer, and a pair of diner bandits intertwine.", "release_date": "1994-09-10", "budget": 8000000, "revenue": 213928762, "runtime": 154, "status": "Released", "popularity": 61.0, "vote_average": 8.5, "vote_count": 8670, "tagline": "", "genres": "[{'id': 53, 'name': 'Thriller'}, {'id': 80, 'name': 'Crime'}]"},
        {"id": 155, "title": "The Dark Knight", "overview": "Batman raises the stakes in his war on crime.", "release_date": "2008-07-16", "budget": 185000000, "revenue": 1004558444, "runtime": 152, "status": "Released", "popularity": 123.2, "vote_average": 8.5, "vote_count": 12269, "tagline": "Why So Serious?", "genres": "[{'id': 18, 'name': 'Drama'}, {'id': 28, 'name': 'Action'}, {'id': 80, 'name': 'Crime'}, {'id': 53, 'name': 'Thriller'}]"},
        {"id": 27205, "title": "Inception", "overview": "A thief who steals corporate secrets through dream-sharing technology.", "release_date": "2010-07-15", "budget": 160000000, "revenue": 825532764, "runtime": 148, "status": "Released", "popularity": 29.1, "vote_average": 8.3, "vote_count": 14075, "tagline": "Your mind is the scene of the crime.", "genres": "[{'id': 28, 'name': 'Action'}, {'id': 878, 'name': 'Science Fiction'}, {'id': 12, 'name': 'Adventure'}]"},
        {"id": 278, "title": "The Shawshank Redemption", "overview": "Two imprisoned men bond over a number of years.", "release_date": "1994-09-23", "budget": 25000000, "revenue": 58300000, "runtime": 142, "status": "Released", "popularity": 51.6, "vote_average": 8.7, "vote_count": 8040, "tagline": "Fear can hold you prisoner. Hope can set you free.", "genres": "[{'id': 18, 'name': 'Drama'}, {'id': 80, 'name': 'Crime'}]"},
        {"id": 238, "title": "The Godfather", "overview": "The aging patriarch of an organized crime dynasty transfers control to his son.", "release_date": "1972-03-14", "budget": 6000000, "revenue": 245066411, "runtime": 175, "status": "Released", "popularity": 41.1, "vote_average": 8.7, "vote_count": 6024, "tagline": "An offer you can't refuse.", "genres": "[{'id': 18, 'name': 'Drama'}, {'id': 80, 'name': 'Crime'}]"},
        {"id": 157336, "title": "Interstellar", "overview": "A team of explorers travel through a wormhole in space.", "release_date": "2014-11-05", "budget": 165000000, "revenue": 675120017, "runtime": 169, "status": "Released", "popularity": 32.2, "vote_average": 8.3, "vote_count": 11187, "tagline": "Mankind was born on Earth. It was never meant to die here.", "genres": "[{'id': 12, 'name': 'Adventure'}, {'id': 18, 'name': 'Drama'}, {'id': 878, 'name': 'Science Fiction'}]"},
        {"id": 120, "title": "The Lord of the Rings: The Fellowship of the Ring", "overview": "A meek Hobbit sets out on a journey to destroy a powerful ring.", "release_date": "2001-12-18", "budget": 93000000, "revenue": 871368364, "runtime": 178, "status": "Released", "popularity": 32.4, "vote_average": 8.3, "vote_count": 8892, "tagline": "One ring to rule them all.", "genres": "[{'id': 12, 'name': 'Adventure'}, {'id': 14, 'name': 'Fantasy'}, {'id': 28, 'name': 'Action'}]"},
        {"id": 603, "title": "The Matrix", "overview": "A computer hacker learns about the true nature of reality.", "release_date": "1999-03-30", "budget": 63000000, "revenue": 463517383, "runtime": 136, "status": "Released", "popularity": 43.3, "vote_average": 8.2, "vote_count": 9079, "tagline": "Welcome to the Real World.", "genres": "[{'id': 28, 'name': 'Action'}, {'id': 878, 'name': 'Science Fiction'}]"},
    ])

    # Credits: cast and crew for each movie
    credits = pd.DataFrame([
        {"id": 862, "cast": "[{'id': 31, 'name': 'Tom Hanks', 'character': 'Woody', 'order': 0}, {'id': 12898, 'name': 'Tim Allen', 'character': 'Buzz Lightyear', 'order': 1}]", "crew": "[{'id': 7879, 'name': 'John Lasseter', 'department': 'Directing', 'job': 'Director'}]"},
        {"id": 550, "cast": "[{'id': 819, 'name': 'Edward Norton', 'character': 'The Narrator', 'order': 0}, {'id': 287, 'name': 'Brad Pitt', 'character': 'Tyler Durden', 'order': 1}]", "crew": "[{'id': 7467, 'name': 'David Fincher', 'department': 'Directing', 'job': 'Director'}]"},
        {"id": 680, "cast": "[{'id': 8891, 'name': 'John Travolta', 'character': 'Vincent Vega', 'order': 0}, {'id': 2231, 'name': 'Samuel L. Jackson', 'character': 'Jules Winnfield', 'order': 1}]", "crew": "[{'id': 138, 'name': 'Quentin Tarantino', 'department': 'Directing', 'job': 'Director'}, {'id': 138, 'name': 'Quentin Tarantino', 'department': 'Writing', 'job': 'Writer'}]"},
        {"id": 155, "cast": "[{'id': 17419, 'name': 'Christian Bale', 'character': 'Bruce Wayne', 'order': 0}, {'id': 1810, 'name': 'Heath Ledger', 'character': 'The Joker', 'order': 1}]", "crew": "[{'id': 525, 'name': 'Christopher Nolan', 'department': 'Directing', 'job': 'Director'}]"},
        {"id": 27205, "cast": "[{'id': 6193, 'name': 'Leonardo DiCaprio', 'character': 'Dom Cobb', 'order': 0}, {'id': 24045, 'name': 'Joseph Gordon-Levitt', 'character': 'Arthur', 'order': 1}]", "crew": "[{'id': 525, 'name': 'Christopher Nolan', 'department': 'Directing', 'job': 'Director'}, {'id': 525, 'name': 'Christopher Nolan', 'department': 'Writing', 'job': 'Writer'}]"},
        {"id": 278, "cast": "[{'id': 504, 'name': 'Tim Robbins', 'character': 'Andy Dufresne', 'order': 0}, {'id': 192, 'name': 'Morgan Freeman', 'character': 'Ellis Redding', 'order': 1}]", "crew": "[{'id': 4027, 'name': 'Frank Darabont', 'department': 'Directing', 'job': 'Director'}]"},
        {"id": 238, "cast": "[{'id': 3084, 'name': 'Marlon Brando', 'character': 'Don Vito Corleone', 'order': 0}, {'id': 1158, 'name': 'Al Pacino', 'character': 'Michael Corleone', 'order': 1}]", "crew": "[{'id': 1776, 'name': 'Francis Ford Coppola', 'department': 'Directing', 'job': 'Director'}]"},
        {"id": 157336, "cast": "[{'id': 10297, 'name': 'Matthew McConaughey', 'character': 'Cooper', 'order': 0}, {'id': 1813, 'name': 'Anne Hathaway', 'character': 'Brand', 'order': 1}]", "crew": "[{'id': 525, 'name': 'Christopher Nolan', 'department': 'Directing', 'job': 'Director'}]"},
        {"id": 120, "cast": "[{'id': 109, 'name': 'Elijah Wood', 'character': 'Frodo Baggins', 'order': 0}, {'id': 1327, 'name': 'Ian McKellen', 'character': 'Gandalf', 'order': 1}]", "crew": "[{'id': 108, 'name': 'Peter Jackson', 'department': 'Directing', 'job': 'Director'}]"},
        {"id": 603, "cast": "[{'id': 6384, 'name': 'Keanu Reeves', 'character': 'Neo', 'order': 0}, {'id': 2975, 'name': 'Laurence Fishburne', 'character': 'Morpheus', 'order': 1}]", "crew": "[{'id': 9340, 'name': 'Lana Wachowski', 'department': 'Directing', 'job': 'Director'}]"},
    ])

    # Ratings (empty - not needed for MovieCatalog)
    ratings = pd.DataFrame(columns=["userId", "movieId", "rating", "timestamp"])

    movies.to_csv(DATA_DIR / "movies_metadata.csv", index=False)
    credits.to_csv(DATA_DIR / "credits.csv", index=False)
    ratings.to_csv(DATA_DIR / "ratings.csv", index=False)

    print(f"Test data written to {DATA_DIR}/")
    print(f"  movies_metadata.csv: {len(movies)} movies")
    print(f"  credits.csv: {len(credits)} credit records")
    print(f"  ratings.csv: empty (not needed for Phase 2)")


if __name__ == "__main__":
    generate()
