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

echo Starting services in network mode (IP: 172.16.11.140)...
start cmd /k "copy .env .env.temp 2>nul && copy .env.network .env && npm run dev"

cd ..\..\bento-social-next\bento-social-next
start cmd /k "copy .env .env.temp 2>nul && copy .env.network .env && npm run dev"

echo Services started in network mode!
echo Frontend: http://172.16.11.140:3001
echo Backend: http://172.16.11.140:3000
echo.
echo Note: Services are now starting up...