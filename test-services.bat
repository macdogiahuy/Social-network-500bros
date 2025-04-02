@echo off
echo Testing service connectivity...

echo.
echo Testing MySQL connection...
docker-compose -f bento-microservices-express\bento-microservices-express\docker-compose.yml exec -T mysql mysqladmin ping -h localhost -u root -p12345678
if errorlevel 1 (
    echo [ERROR] MySQL is not responding
) else (
    echo [OK] MySQL is running
)

echo.
echo Testing Redis connection...
docker-compose -f bento-microservices-express\bento-microservices-express\docker-compose.yml exec -T redis redis-cli -a macdogiahuy_redis ping
if errorlevel 1 (
    echo [ERROR] Redis is not responding
) else (
    echo [OK] Redis is running
)

echo.
echo Checking ports...
netstat -an | findstr ":3306"
netstat -an | findstr ":3307"
netstat -an | findstr ":6379"

echo.
echo Service check complete!