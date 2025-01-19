#!/bin/bash

set -a
source .env
source .env.development
source .env.local
set +a

echo "🚀 Starting development environment setup..."

# Function to handle SIGINT
cleanup() {
  echo "Caught SIGINT signal! Shutting down Docker containers..."
  docker-compose down -v
  docker volume rm godoplay_postgres_data
  exit 0
}

# Trap SIGINT signal
trap cleanup SIGINT

# Start Docker containers in detached mode
echo "📦 Starting Docker containers..."
docker-compose up -d

# Wait for PostgreSQL to be ready
echo "⏳ Waiting for PostgreSQL to be ready..."
until docker exec godoplay-postgres pg_isready -U "$POSTGRES_USER" -d "$POSTGRES_DB" -q; do
  echo "😴💤 PostgreSQL is unavailable - sleeping"
  sleep 1
done

echo "✅ PostgreSQL is now ready!"

# Run database migrations
echo "🔄 Running database migrations..."
pnpm db:generate
if [ $? -ne 0 ]; then
  echo "❌ Failed to generate database migrations"
  cleanup
  exit 1
fi

pnpm db:push
if [ $? -ne 0 ]; then
  echo "❌ Failed to push database migrations"
  cleanup
  exit 1
fi

echo "✅ Database migrations completed successfully"

# Create backups directory if it doesn't exist
mkdir -p backups

DUMP_FILE="backups/main_dump-$(date +%Y-%m-%d-%H-%M).sql"

echo "❓ Do you want to dump and seed the database? (y/n)"
read -r choice

if [ "$choice" == "y" ]; then
  echo "📥 Starting database dump inside Docker container..."
  docker exec godoplay-postgres \
    pg_dump "$REMOTE_POSTGRES_URL" \
    --clean \
    --if-exists \
    --no-owner \
    --no-acl \
    > "$DUMP_FILE"

  if [ $? -eq 0 ]; then
    echo "✅ Database dump completed successfully"

    echo "📤 Importing dump into Docker container..."
    docker cp "$DUMP_FILE" godoplay-postgres:/tmp/dump.sql
    docker exec godoplay-postgres psql -U "$POSTGRES_USER" -d "$POSTGRES_NAME" -f /tmp/dump.sql
    
    if [ $? -eq 0 ]; then
      echo "✅ Database import completed successfully"
      docker exec godoplay-postgres rm /tmp/dump.sql
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