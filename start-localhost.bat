@echo off
echo Starting Docker services...

cd bento-microservices-express\bento-microservices-express

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
start cmd /k "copy .env .env.temp 2>nul && copy .env.development .env && npm run dev"

cd ..\..\bento-social-next\bento-social-next
start cmd /k "copy .env .env.temp 2>nul && npm run dev"

echo Services started in localhost mode!
echo Frontend: http://localhost:3001
echo Backend: http://localhost:3000
echo.
echo Note: Services are now starting up...