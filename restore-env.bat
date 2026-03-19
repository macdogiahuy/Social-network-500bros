@echo off
echo Restoring original environment files...

cd bento-microservices-express
copy .env.example .env >nul
cd ..\bento-social-next
copy .env.example .env >nul

echo Environment clean!