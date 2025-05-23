#!/bin/bash
# Run the admin user creation script

# Make sure we're in the backend directory
cd "$(dirname "$0")/.."

# Windows-specific path for virtual environment activation
if [ -d "venv" ]; then
    # Check if running in Git Bash or similar Bash on Windows
    if [ -f "venv/Scripts/activate" ]; then
        source venv/Scripts/activate
    else
        source venv/bin/activate
    fi
elif [ -d ".venv" ]; then
    # Check if running in Git Bash or similar Bash on Windows
    if [ -f ".venv/Scripts/activate" ]; then
        source .venv/Scripts/activate
    else
        source .venv/bin/activate
    fi
fi

# Create scripts directory if it doesn't exist
if [ ! -d "scripts" ]; then
    mkdir scripts
fi

# Run the script
python scripts/create_admin_user.py

# Deactivate virtual environment if activated
if [[ ! -z "$VIRTUAL_ENV" ]]; then
    deactivate
fi
