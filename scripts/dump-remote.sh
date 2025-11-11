#!/bin/bash

# Load environment variables from .env file
set -a
source .env.production
set +a

# Create backups directory if it doesn't exist
mkdir -p backups/remote

# Generate timestamp for the filename
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
DUMP_FILE="backups/remote/${TIMESTAMP}.sql"

echo "📥 Starting remote database dump..."
echo "👉 Using database: $POSTGRES_NAME"
echo "👉 Using user: $POSTGRES_USER"

# Dump the database using Docker
docker run --rm \
  postgres:17-alpine \
  pg_dump "$POSTGRES_URL" \
  --clean \
  --if-exists \
  --no-owner \
  --no-acl \
  > "$DUMP_FILE"

if [ $? -eq 0 ]; then
  echo "✅ Database dump completed successfully"
  echo "📁 Backup saved to: $DUMP_FILE"
else
  echo "❌ Error during database dump"
  rm -f "$DUMP_FILE"
  exit 1
fi