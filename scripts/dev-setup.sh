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

echo "❓ Do you want to restore from a local backup? (y/n)"
read -r choice

if [ "$choice" == "y" ]; then
  echo "Enter the path to your backup file (use TAB for autocompletion):"
  read -e -p "> " backup_file
  
  if [ ! -f "$backup_file" ]; then
    echo "❌ File not found: $backup_file"
    exit 1
  fi
  
  echo "📤 Importing backup into Docker container..."
  docker cp "$backup_file" godoplay-postgres:/tmp/dump.sql
  docker exec godoplay-postgres psql -U "$POSTGRES_USER" -d "$POSTGRES_NAME" -f /tmp/dump.sql
  
  if [ $? -eq 0 ]; then
    echo "✅ Database import completed successfully"
    docker exec godoplay-postgres rm /tmp/dump.sql
  else
    echo "❌ Error during database import"
    exit 1
  fi
else
  echo "🚀 Running the database without restore."
fi 