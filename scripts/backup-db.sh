#!/bin/bash

# Load environment variables from .env file
set -a
source .env
set +a

# Create backups directory if it doesn't exist
mkdir -p backups

# Generate timestamp for the filename
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
DUMP_FILE="backups/godoplay_db_${TIMESTAMP}.sql"

echo "📥 Starting database dump..."
echo "👉 Using database: $POSTGRES_NAME"
echo "👉 Using user: $POSTGRES_USER"

# Dump the database using Docker with password
PGPASSWORD="$POSTGRES_PASSWORD" docker exec godoplay-postgres pg_dump \
  --username "$POSTGRES_USER" \
  --dbname "$POSTGRES_NAME" \
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