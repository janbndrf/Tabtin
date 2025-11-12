#!/bin/sh
set -e

echo "Starting PocketBase initialization..."

# Wait a moment for the filesystem to be ready
sleep 1

# Check if this is the first run by looking for the database file
FIRST_RUN=false
if [ ! -f "/pb/pb_data/data.db" ]; then
    echo "First run detected - database does not exist"
    FIRST_RUN=true
fi

# Run migrations
echo "Running database migrations..."
./pocketbase migrate up --migrationsDir=pb_migrations

# Create superuser if credentials are provided and it's not the first run with existing data
if [ -n "$POCKETBASE_ADMIN_EMAIL" ] && [ -n "$POCKETBASE_ADMIN_PASSWORD" ]; then
    echo "Creating/updating superuser account..."
    ./pocketbase superuser upsert "$POCKETBASE_ADMIN_EMAIL" "$POCKETBASE_ADMIN_PASSWORD"
    echo "Superuser account configured successfully"
else
    echo "Note: POCKETBASE_ADMIN_EMAIL and POCKETBASE_ADMIN_PASSWORD not set"
    echo "You can set these in your .env file to automatically create an admin account"
fi

echo "PocketBase initialization complete"
echo "Starting PocketBase server..."

# Execute the CMD from Dockerfile or command line arguments
exec "$@"
