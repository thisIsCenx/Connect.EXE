@echo off
REM Migration script for project features
REM This script runs the database migration to add new columns to projects table

echo ================================================
echo Running Project Features Migration
echo ================================================

REM Check if PostgreSQL psql is available
where psql >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: psql command not found. Please install PostgreSQL and add it to PATH.
    pause
    exit /b 1
)

REM Database connection parameters
set DB_HOST=localhost
set DB_PORT=5432
set DB_NAME=Connect.EXE
set DB_USER=postgres

echo.
echo Connecting to database: %DB_NAME%
echo Host: %DB_HOST%:%DB_PORT%
echo User: %DB_USER%
echo.

REM Run the migration script
echo Running migration SQL script...
psql -h %DB_HOST% -p %DB_PORT% -U %DB_USER% -d "%DB_NAME%" -f database_migration_project_features.sql

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ================================================
    echo Migration completed successfully!
    echo ================================================
) else (
    echo.
    echo ================================================
    echo ERROR: Migration failed!
    echo ================================================
)

echo.
pause
