@echo off
REM Migrate Local PostgreSQL to Render PostgreSQL (SQLAlchemy version)
REM Usage: scripts\migrate_to_render.bat

echo ============================================================
echo PostgreSQL Migration: Local to Render (SQLAlchemy)
echo ============================================================
echo.

REM Check if .env file exists
if not exist .env (
    echo Error: .env file not found
    echo Please create .env file with your database URLs
    pause
    exit /b 1
)

REM Load environment from .env (basic support)
for /f "tokens=*" %%a in ('type .env ^| findstr /v "^#"') do set %%a

REM Set LOCAL_DATABASE_URL if not already set
if "%LOCAL_DATABASE_URL%"=="" (
    if not "%DATABASE_URL%"=="" (
        echo Using DATABASE_URL from .env as LOCAL_DATABASE_URL
        set LOCAL_DATABASE_URL=%DATABASE_URL%
    ) else (
        echo.
        echo Enter your LOCAL database URL:
        echo Example: postgresql://user:password@localhost:5432/dbname
        set /p LOCAL_DATABASE_URL=
    )
)

REM Set RENDER_DATABASE_URL if not already set
if "%RENDER_DATABASE_URL%"=="" (
    if not "%EXTERNAL_RENDER_POSTGRES_URL%"=="" (
        echo Using EXTERNAL_RENDER_POSTGRES_URL from .env
        set RENDER_DATABASE_URL=%EXTERNAL_RENDER_POSTGRES_URL%
    ) else (
        echo.
        echo Enter your RENDER database URL (EXTERNAL URL):
        echo Example: postgresql://user:password@host.render.com:5432/dbname
        set /p RENDER_DATABASE_URL=
    )
)

echo.
echo Configuration:
echo   Local DB: %LOCAL_DATABASE_URL%
echo   Render DB: %RENDER_DATABASE_URL%
echo.

REM Activate virtual environment if it exists
if exist .venv\Scripts\activate.bat (
    echo Activating virtual environment...
    call .venv\Scripts\activate.bat
) else (
    echo Warning: Virtual environment not found at .venv\Scripts\activate.bat
    echo Make sure sqlalchemy and psycopg are installed
    echo.
)

REM Check if psycopg is installed
python -c "import psycopg" 2>nul
if errorlevel 1 (
    echo Error: psycopg package not found
    echo Installing required packages...
    pip install psycopg sqlalchemy
)

REM Run migration script (SQLAlchemy version - no pg_dump needed!)
echo.
echo Starting migration using SQLAlchemy...
python scripts\migrate_local_to_render_sqlalchemy.py

echo.
echo Migration script completed!
pause
