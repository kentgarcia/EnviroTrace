#!/bin/bash
# Migrate Local PostgreSQL to Render PostgreSQL
# Usage: ./scripts/migrate_to_render.sh

set -e

echo "Setting up migration environment..."

# Check if .env file exists
if [ ! -f .env ]; then
    echo "Error: .env file not found"
    echo "Please create .env file with your database URLs"
    exit 1
fi

# Load environment variables from .env
export $(grep -v '^#' .env | xargs)

# Prompt for database URLs if not set
if [ -z "$LOCAL_DATABASE_URL" ]; then
    echo ""
    echo "Enter your LOCAL database URL:"
    echo "Example: postgresql://user:password@localhost:5432/dbname"
    read -r LOCAL_DATABASE_URL
    export LOCAL_DATABASE_URL
fi

if [ -z "$RENDER_DATABASE_URL" ]; then
    echo ""
    echo "Enter your RENDER database URL (EXTERNAL URL from Render dashboard):"
    echo "Example: postgresql://user:password@host.render.com:5432/dbname"
    read -r RENDER_DATABASE_URL
    export RENDER_DATABASE_URL
fi

# Activate virtual environment if it exists
if [ -d ".venv" ]; then
    echo "Activating virtual environment..."
    source .venv/Scripts/activate 2>/dev/null || source .venv/bin/activate
fi

# Run migration script
echo ""
echo "Starting migration..."
python scripts/migrate_local_to_render.py

echo ""
echo "Migration script completed!"
