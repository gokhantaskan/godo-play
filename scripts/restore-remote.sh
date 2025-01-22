#!/bin/bash

# Load environment variables from .env file
set -a
source .env.production
set +a

# Check if a backup file is provided as an argument
if [ -z "$1" ]; then
  echo "❌ Error: No backup file specified"
  echo "👉 Usage: ./scripts/restore-remote.sh backups/remote/YYYYMMDD_HHMMSS.sql"
  exit 1
fi

BACKUP_FILE="$1"

# Check if the backup file exists
if [ ! -f "$BACKUP_FILE" ]; then
  echo "❌ Error: Backup file '$BACKUP_FILE' not found"
  exit 1
fi

echo "📤 Starting remote database restore..."
echo "👉 Using database: $POSTGRES_NAME"
echo "👉 Using user: $POSTGRES_USER"
echo "👉 Using backup file: $BACKUP_FILE"

# Restore the database using Docker with absolute path mounting
docker run --rm \
  -v "$(pwd)/$BACKUP_FILE:/backup.sql:ro" \
  postgres:16-alpine \
  psql "$POSTGRES_URL" \
  -f /backup.sql

if [ $? -eq 0 ]; then
  echo "✅ Database restore completed successfully"
else
  echo "❌ Error during database restore"
  exit 1
fi