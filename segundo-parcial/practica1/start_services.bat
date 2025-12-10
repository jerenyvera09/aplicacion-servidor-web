@echo off
:: Cambiar al directorio donde se encuentra este script
cd /d "%~dp0"

echo Deteniendo contenedores antiguos para evitar conflictos...
docker-compose down

echo.
echo Iniciando SOLO infraestructura (Bases de datos, RabbitMQ, Redis)...
docker-compose up -d rabbitmq redis postgres-users postgres-reports

echo.
echo Esperando 20 segundos a que las bases de datos y RabbitMQ esten listos...
timeout /t 20 >nul

echo.
echo Iniciando Gateway (Local)...
start "Gateway" /D "%~dp0gateway" cmd /k "npm run start:dev"

echo Iniciando MS-Reports (Local)...
start "MS-Reports" /D "%~dp0ms-reports" cmd /k "set DB_HOST=127.0.0.1&& set DB_PORT=5433 && npm run start:dev"

echo Iniciando MS-Users (Local)...
start "MS-Users" /D "%~dp0ms-users" cmd /k "set DB_HOST=127.0.0.1&& set DB_PORT=5434 && npm run start:dev"

echo.
echo Todos los servicios han sido iniciados.
echo Si alguna ventana se cierra inmediatamente, revisa si hay errores.
pause
