#!/bin/bash
# Load test data into LocalStack DynamoDB with poster URLs and embeddings.
# Usage: cd etl && ./setup.sh
set -e

cd "$(dirname "$0")"

if [ -z "$TMDB_API_KEY" ]; then
  if [ -f .env ]; then
    export $(grep TMDB_API_KEY .env | xargs)
  fi
fi

echo "==> Loading test fixtures..."
python test_fixture.py

echo "==> Loading into DynamoDB..."
python load.py

echo "==> Enriching poster URLs from TMDB..."
python enrich_posters.py

echo "==> Generating embeddings..."
python generate_embeddings.py

echo "==> Done! All data loaded with posters and embeddings."
