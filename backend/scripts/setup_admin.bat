@echo off
REM Run the admin user creation script for Windows

REM Make sure we're in the backend directory
cd /d "%~dp0\.."

REM Activate virtual environment if it exists
if exist venv\Scripts\activate.bat (
    call venv\Scripts\activate.bat
) else if exist .venv\Scripts\activate.bat (
    call .venv\Scripts\activate.bat
)

REM Create scripts directory if it doesn't exist
if not exist scripts mkdir scripts

REM Run the script
python scripts\create_admin_user.py

REM Deactivate virtual environment if activated
if defined VIRTUAL_ENV (
    call deactivate
)
