#!/bin/bash

# Load environment variables from .env file
set -a
source .env.production
set +a

# Check if a backup file is provided as an argument
if [ -z "$1" ]; then
  echo "❌ Error: No backup file specified"
  echo "👉 Usage: ./scripts/restore-remote.sh backups/remote/YYYYMMDD_HHMMSS.sql [DB_URL]"
  exit 1
fi

BACKUP_FILE="$1"

# Check if the backup file exists
if [ ! -f "$BACKUP_FILE" ]; then
  echo "❌ Error: Backup file '$BACKUP_FILE' not found"
  exit 1
fi

# Determine DB URL: arg > POSTGRES_URL_PUBLIC > DATABASE_URL > POSTGRES_URL
DB_URL="${2:-${POSTGRES_URL_PUBLIC:-${DATABASE_URL:-$POSTGRES_URL}}}"
if [ -z "$DB_URL" ]; then
  echo "❌ Error: No database URL provided or found in env (.env.production)"
  echo "👉 Provide it as the 2nd argument, or set POSTGRES_URL_PUBLIC/DATABASE_URL/POSTGRES_URL"
  exit 1
fi

# Extract hostname for a quick DNS resolvability check
HOST=$(printf "%s" "$DB_URL" | sed -E 's#^[a-zA-Z]+://([^@/]+@)?([^:/?]+).*#\2#')
echo "🔎 Checking hostname resolution for: $HOST"
if ! docker run --rm alpine:3.19 sh -c "nslookup $HOST >/dev/null 2>&1"; then
  echo "❌ Hostname '$HOST' does not resolve from this machine."
  echo "👉 If your DB is private (VPC/internal), run this from within that network, use SSH port-forwarding,"
  echo "   or supply a public connection string as the 2nd argument."
  echo "👉 Example with tunnel: set DB_URL to 'postgres://user:pass@127.0.0.1:5432/db?sslmode=disable' after tunneling."
  exit 1
fi

echo "📤 Starting remote database restore..."
echo "👉 Using host: $HOST"
echo "👉 Using backup file: $BACKUP_FILE"

# Restore the database using Docker with absolute path mounting
docker run --rm \
  -v "$(pwd)/$BACKUP_FILE:/backup.sql:ro" \
  postgres:17-alpine \
  psql "$DB_URL" \
  -f /backup.sql

if [ $? -eq 0 ]; then
  echo "✅ Database restore completed successfully"
else
  echo "❌ Error during database restore"
  exit 1
fi