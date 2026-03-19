@echo off
echo Stopping all services...

echo Stopping running processes...
taskkill /F /IM node.exe 2>nul

echo Stopping Docker services...
cd bento-microservices-express
docker-compose down

echo Docker services stopped...

cd ..\bento-social-next

echo All services stopped and cleaned up!