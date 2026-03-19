@echo off
echo Starting Docker services...

cd bento-microservices-express

echo Stopping any existing Docker services...
docker-compose down

echo Starting fresh Docker services...
docker-compose up -d

echo Waiting for MySQL to be ready...
:CHECKMYSQL
docker-compose exec -T mysql mysqladmin ping -h localhost -u root -p12345678 2>nul
if errorlevel 1 (
    echo Waiting for MySQL...
    timeout /t 2 >nul
    goto CHECKMYSQL
)

echo Starting services in localhost mode...
if not exist .env copy .env.example .env >nul
start cmd /k "yarn dev"

cd ..\bento-social-next
if not exist .env copy .env.example .env >nul
start cmd /k "yarn dev"

echo Services started in localhost mode!
echo Frontend: http://localhost:3001
echo Backend: http://localhost:3000
echo.
echo Note: Services are now starting up...