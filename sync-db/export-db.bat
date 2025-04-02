@echo off
echo Database Export Script
echo -------------------

cd ..\bento-microservices-express\bento-microservices-express

rem Create dumps directory if it doesn't exist
mkdir ..\sync-db\dumps 2>nul

echo Checking Docker services...

rem Check if MySQL container is running
docker ps | findstr "mysql-bento" > nul
if errorlevel 1 (
    echo MySQL container is not running. Starting services...
    docker-compose up -d mysql
    echo Waiting for MySQL to start...
    timeout /t 10
)

rem Get current date and time for filename (using - instead of /)
for /f "tokens=2 delims==" %%a in ('wmic OS Get localdatetime /value') do set "dt=%%a"
set "year=%dt:~0,4%"
set "month=%dt:~4,2%"
set "day=%dt:~6,2%"
set "hour=%dt:~8,2%"
set "minute=%dt:~10,2%"

set "filename=..\sync-db\dumps\social_network_%year%-%month%-%day%_%hour%%minute%.sql"

echo.
echo Verifying MySQL connection...
docker exec mysql-bento mysqladmin -u root -p12345678 ping
if errorlevel 1 (
    echo Error: Cannot connect to MySQL
    echo.
    echo Press any key to exit...
    pause >nul
    exit /b 1
)

echo.
echo Exporting database to %filename%...
docker exec mysql-bento mysqldump -u root -p12345678 social_network > "%filename%"

if errorlevel 1 (
    echo Error: Database export failed
    echo.
    echo Press any key to exit...
    pause >nul
    exit /b 1
)

rem Verify the file was created and has content
if not exist "%filename%" (
    echo Error: Export file was not created
    echo.
    echo Press any key to exit...
    pause >nul
    exit /b 1
)

for %%A in ("%filename%") do set filesize=%%~zA
if %filesize% LSS 1000 (
    echo Error: Export file appears to be empty or too small
    del "%filename%"
    echo.
    echo Press any key to exit...
    pause >nul
    exit /b 1
)

echo.
echo Database exported successfully!
echo Location: %filename%
echo File size: %filesize% bytes
echo.
echo You can copy this file to another computer and use import-db.bat to import it
echo.
echo Press any key to exit...
pause >nul
