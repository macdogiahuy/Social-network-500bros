@echo off
echo Database Import Script
echo -------------------

cd ..\bento-microservices-express\bento-microservices-express

if not exist ..\sync-db\dumps (
    echo Error: dumps directory not found
    echo Please create sync-db\dumps directory and place the database dump file there
    echo.
    echo Press any key to exit...
    pause >nul
    exit /b 1
)

echo Available database dumps:
echo.
dir /b ..\sync-db\dumps\*.sql
if errorlevel 1 (
    echo No SQL dump files found in dumps directory
    echo Please copy a database dump file to sync-db\dumps directory
    echo.
    echo Press any key to exit...
    pause >nul
    exit /b 1
)

echo.
set /p DUMP_FILE="Enter the dump filename (from above list): "

if not exist "..\sync-db\dumps\%DUMP_FILE%" (
    echo Error: File %DUMP_FILE% not found
    echo.
    echo Press any key to exit...
    pause >nul
    exit /b 1
)

echo.
echo Checking Docker services...
echo Stopping any running containers...
docker-compose down

echo.
echo Starting MySQL container...
docker-compose up -d mysql
echo Waiting for MySQL to initialize...
timeout /t 10

echo.
echo Verifying MySQL connection...
:CHECKMYSQL
docker exec mysql-bento mysqladmin -u root -p12345678 ping
if errorlevel 1 (
    echo Waiting for MySQL to be ready...
    timeout /t 5
    goto CHECKMYSQL
)

echo.
echo Importing database from %DUMP_FILE%...
docker exec -i mysql-bento mysql -u root -p12345678 social_network < "..\sync-db\dumps\%DUMP_FILE%"

if errorlevel 1 (
    echo Error: Database import failed
    echo.
    echo Press any key to exit...
    pause >nul
    exit /b 1
)

echo.
echo Verifying import...
docker exec mysql-bento mysql -u root -p12345678 -e "USE social_network; SHOW TABLES;" > nul
if errorlevel 1 (
    echo Error: Database verification failed
    echo.
    echo Press any key to exit...
    pause >nul
    exit /b 1
)

echo.
echo Database imported successfully!
echo.
echo You can now start the application using:
echo - start-localhost.bat for local access
echo - start-network.bat for network access
echo.
echo Press any key to exit...
pause >nul
