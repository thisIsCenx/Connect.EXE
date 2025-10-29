@echo off
echo ========================================
echo  Add Status Column Migration
echo ========================================
echo.
echo Database: connectexe
echo User: postgres
echo.

set PGPASSWORD=23012004

psql -U postgres -d connectexe -f add_user_status_column.sql

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo  Migration completed successfully!
    echo ========================================
) else (
    echo.
    echo ========================================
    echo  Migration failed! Error code: %ERRORLEVEL%
    echo ========================================
)

pause
