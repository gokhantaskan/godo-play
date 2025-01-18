#!/bin/bash

set -a
source .env
source .env.local
set +a

echo "🚀 Starting development environment setup..."

# Function to handle SIGINT
cleanup() {
  echo "Caught SIGINT signal! Shutting down Docker containers..."
  docker-compose down
  exit 0
}

# Trap SIGINT signal
trap cleanup SIGINT

# Start Docker containers in detached mode
echo "📦 Starting Docker containers..."
docker-compose up -d

# Wait for PostgreSQL to be ready
echo "⏳ Waiting for PostgreSQL to be ready..."
until docker exec afet-bildirim-postgres pg_isready -U $DATABASE_USER -d $DATABASE_NAME -q; do
  echo "PostgreSQL is unavailable - sleeping"
  sleep 1
done

# Create backups directory if it doesn't exist
mkdir -p backups

DUMP_FILE="backups/main_dump.sql"

echo "❓ Do you want to dump and seed the database? (y/n)"
read -r choice

if [ "$choice" == "y" ]; then
  echo "📥 Starting database dump inside Docker container..."
  # Execute pg_dump inside the Docker container
  docker exec afet-bildirim-postgres \
    pg_dump "$REMOTE_DATABASE_URL" \
    --clean \
    --if-exists \
    --no-owner \
    --no-acl \
    > "$DUMP_FILE"

  if [ $? -eq 0 ]; then
    echo "✅ Database dump completed successfully"
    
    echo "📤 Importing dump into Docker container..."
    # Copy the dump file into the container and import it
    docker cp "$DUMP_FILE" afet-bildirim-postgres:/tmp/dump.sql
    docker exec afet-bildirim-postgres psql -U $DATABASE_USER -d $DATABASE_NAME -f /tmp/dump.sql
    
    if [ $? -eq 0 ]; then
      echo "✅ Database import completed successfully"
      # Clean up the temporary file in the container
      docker exec afet-bildirim-postgres rm /tmp/dump.sql
    else
      echo "❌ Error during database import"
      exit 1
    fi
  else
    echo "❌ Error during database dump"
    rm -f "$DUMP_FILE"
    exit 1
  fi
else
  echo "🚀 Running the database without dump and seed."
fi 