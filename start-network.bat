@echo off
REM --- Get local IP address (ignoring 127.0.0.1) ---
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /R /C:"IPv4.*" ^| findstr /V "127.0.0.1"') do (
    set "LOCAL_IP=%%a"
    goto :gotip
)
:gotip
set "LOCAL_IP=%LOCAL_IP:~1%"
echo Detected local IP: %LOCAL_IP%

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

REM --- Write .env for backend ---
(
    echo BASE_URL=http://%LOCAL_IP%:3001
    REM Add other backend env variables as needed
) > .env

start cmd /k "npm run dev"

cd ..\..\bento-social-next\bento-social-next

REM --- Write .env for frontend ---
(
    echo NEXT_PUBLIC_API_URL=http://%LOCAL_IP%:3001
    echo NEXT_PUBLIC_BASE_URL=http://%LOCAL_IP%:3001
    REM Add other frontend env variables as needed
) > .env

start cmd /k "npm run dev"

echo Services started in network mode!
echo Frontend: http://%LOCAL_IP%:3001
echo Backend: http://%LOCAL_IP%:3000
echo.
echo Note: Services are now starting up...
pause