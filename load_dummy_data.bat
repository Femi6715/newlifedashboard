@echo off
echo Loading NewLife Recovery Center Dummy Data...
echo.

REM Replace these values with your MySQL connection details
set MYSQL_HOST=localhost
set MYSQL_PORT=3306
set MYSQL_USER=root
set MYSQL_PASSWORD=your_password
set DATABASE_NAME=newlife_recovery_db

echo Connecting to MySQL...
echo Host: %MYSQL_HOST%
echo Port: %MYSQL_PORT%
echo User: %MYSQL_USER%
echo Database: %DATABASE_NAME%
echo.

REM Check if MySQL is available
mysql --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: MySQL command line client not found!
    echo Please install MySQL or add it to your PATH
    pause
    exit /b 1
)

REM Load the dummy data
echo Loading dummy data...
mysql -h %MYSQL_HOST% -P %MYSQL_PORT% -u %MYSQL_USER% -p%MYSQL_PASSWORD% %DATABASE_NAME% < dummy_data.sql

if errorlevel 1 (
    echo ERROR: Failed to load dummy data!
    echo Please check your MySQL connection settings
    pause
    exit /b 1
) else (
    echo.
    echo SUCCESS: Dummy data loaded successfully!
    echo.
    echo Data Summary:
    echo - Users: 9
    echo - Staff: 8
    echo - Programs: 6
    echo - Clients: 10
    echo - Sessions: 10
    echo - Intake Calls: 8
    echo - Case Files: 10
    echo - Progress Notes: 15
    echo - Medications: 8
    echo.
    echo You can now test the NewLife Recovery Dashboard with realistic data!
)

pause 