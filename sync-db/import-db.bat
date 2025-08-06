@echo off
setlocal enabledelayedexpansion
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

echo Finding the newest database dump...
echo.
set "NEWEST_DUMP="
set "NEWEST_DATE=0"

REM Check in the dumps directory
for %%F in (..\sync-db\dumps\*.sql) do (
    for %%A in (%%F) do (
        if %%~tA gtr !NEWEST_DATE! (
            set "NEWEST_DATE=%%~tA"
            set "NEWEST_DUMP=%%~nxF"
            set "DUMP_PATH=..\sync-db\dumps"
        )
    )
)

REM Also check in the data directory
for %%F in (..\data\social_network_*.sql) do (
    for %%A in (%%F) do (
        if %%~tA gtr !NEWEST_DATE! (
            set "NEWEST_DATE=%%~tA"
            set "NEWEST_DUMP=%%~nxF"
            set "DUMP_PATH=..\data"
        )
    )
)

if "!NEWEST_DUMP!"=="" (
    echo No SQL dump files found in dumps or data directories
    echo Please copy a database dump file to sync-db\dumps or data directory
    echo.
    echo Press any key to exit...
    pause >nul
    exit /b 1
)

echo Found newest dump: !NEWEST_DUMP! in !DUMP_PATH!
set "DUMP_FILE=!NEWEST_DUMP!"

if not exist "!DUMP_PATH!\!DUMP_FILE!" (
    echo Error: File !DUMP_FILE! not found in !DUMP_PATH!
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
echo Importing database from !DUMP_FILE!...
docker exec -i mysql-bento mysql -u root -p12345678 social_network < "!DUMP_PATH!\!DUMP_FILE!"

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
