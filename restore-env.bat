@echo off
echo Restoring original environment files...

cd bento-microservices-express\bento-microservices-express
if exist .env.temp (
    copy .env.temp .env
    del .env.temp
)

cd ..\..\bento-social-next\bento-social-next
if exist .env.temp (
    copy .env.temp .env
    del .env.temp
)

echo Environment files restored!