@echo off
echo Exporting database from Docker container...

cd bento-microservices-express\bento-microservices-express

rem Create dumps directory if it doesn't exist
mkdir dumps 2>nul

rem Get current date and time for filename
set year=%date:~10,4%
set month=%date:~4,2%
set day=%date:~7,2%
set hour=%time:~0,2%
if "%hour:~0,1%" == " " set hour=0%hour:~1,1%
set min=%time:~3,2%
set filename=dumps\social_network_%year%%month%%day%_%hour%%min%.sql

echo Exporting to %filename%...

rem Export database using docker exec
docker exec mysql-bento mysqldump -u root -p12345678 social_network > %filename%

if errorlevel 1 (
    echo Error: Database export failed
    exit /b 1
) else (
    echo Database exported successfully to %filename%
    echo.
    echo You can copy this file to another computer and use import-db.bat to import it
)