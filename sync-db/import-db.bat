@echo off
echo Database Import Script
echo -------------------

cd ..\bento-microservices-express\bento-microservices-express

if not exist dumps (
    echo Error: dumps directory not found
    echo Please place the database dump file in the dumps directory
    exit /b 1
)

echo Available database dumps:
echo.
dir /b dumps\*.sql
echo.

set /p DUMP_FILE="Enter the dump filename (from above list): "

if not exist "dumps\%DUMP_FILE%" (
    echo Error: File dumps\%DUMP_FILE% not found
    exit /b 1
)

echo.
echo Stopping any running containers...
docker-compose down

echo.
echo Starting MySQL container...
docker-compose up -d mysql
timeout /t 10

echo.
echo Importing database...
docker exec -i mysql-bento mysql -u root -p12345678 social_network < "dumps\%DUMP_FILE%"

if errorlevel 1 (
    echo Error: Database import failed
    exit /b 1
) else (
    echo.
    echo Database imported successfully!
    echo.
    echo You can now start the application using start-localhost.bat or start-network.bat
)