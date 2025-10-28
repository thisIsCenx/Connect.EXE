@echo off
echo Running database migration for nested replies...
echo.

REM Update these variables with your PostgreSQL credentials
set PGHOST=localhost
set PGPORT=5432
set PGDATABASE=your_database_name
set PGUSER=postgres
set PGPASSWORD=your_password

REM Run the migration
psql -h %PGHOST% -p %PGPORT% -U %PGUSER% -d %PGDATABASE% -f database_migration_nested_replies.sql

echo.
echo Migration completed!
pause
