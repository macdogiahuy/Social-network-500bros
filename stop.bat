@echo off
echo Stopping all services...

echo Stopping running processes...
taskkill /F /IM node.exe 2>nul

echo Stopping Docker services...
cd bento-microservices-express\bento-microservices-express
docker-compose down

echo Restoring environment files...
if exist .env.temp (
    copy .env.temp .env
    del .env.temp
)

cd ..\..\bento-social-next\bento-social-next
if exist .env.temp (
    copy .env.temp .env
    del .env.temp
)

echo All services stopped and cleaned up!