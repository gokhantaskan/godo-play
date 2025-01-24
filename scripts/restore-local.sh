#!/bin/bash
# restore-local.sh

set -a
source .env
source .env.development
source .env.local
set +a

echo "🚀 Starting local restore procedure..."

# Function to handle SIGINT
cleanup() {
  echo "Caught SIGINT signal! Stopping local restore..."
  exit 0
}

# Trap SIGINT signal
trap cleanup SIGINT

echo "Enter the path to your backup file (use TAB for autocompletion):"
read -e -p "> " backupFile

if [ ! -f "$backupFile" ]; then
  echo "❌ File not found: $backupFile"
  exit 1
fi

echo "📤 Importing backup into Docker container..."
docker cp "$backupFile" godoplay-postgres:/tmp/dump.sql
docker exec godoplay-postgres psql -U "$POSTGRES_USER" -d "$POSTGRES_NAME" -f /tmp/dump.sql

if [ $? -eq 0 ]; then
  echo "✅ Database import completed successfully"
  docker exec godoplay-postgres rm /tmp/dump.sql
else
  echo "❌ Error during database import"
  exit 1
fi