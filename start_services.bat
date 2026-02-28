@echo off
echo ========================================
echo Starting Bamazon Microservices
echo ========================================
echo.

echo Starting Orders Service on port 8003...
start "Orders Service" cmd /k "cd services\orders && python manage.py runserver 0.0.0.0:8003"

timeout /t 2 /nobreak > nul

echo Starting Cart Service on port 8002...
start "Cart Service" cmd /k "cd services\cart && python manage.py runserver 0.0.0.0:8002"

timeout /t 2 /nobreak > nul

echo Starting Products Service on port 8001...
start "Products Service" cmd /k "cd services\products && python manage.py runserver 0.0.0.0:8001"

timeout /t 2 /nobreak > nul

echo Starting Auth Service on port 8000...
start "Auth Service" cmd /k "cd services\auth && python manage.py runserver 0.0.0.0:8000"

echo.
echo ========================================
echo Services Started!
echo ========================================
echo Auth Service (Main UI): http://localhost:8000
echo Products API Service: http://localhost:8001
echo Cart API Service: http://localhost:8002
echo Orders API Service: http://localhost:8003
echo.
echo Press any key to stop all services...
pause > nul

echo.
echo Stopping services...
taskkill /FI "WindowTitle eq Orders Service*" /T /F
taskkill /FI "WindowTitle eq Cart Service*" /T /F
taskkill /FI "WindowTitle eq Products Service*" /T /F
taskkill /FI "WindowTitle eq Auth Service*" /T /F
echo Services stopped.
