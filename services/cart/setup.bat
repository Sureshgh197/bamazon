@echo off
echo ========================================
echo Setting up Cart Service
echo ========================================
echo.

cd services\cart

echo Creating virtual environment...
python -m venv venv

echo Activating virtual environment...
call venv\Scripts\activate

echo Installing dependencies...
pip install -r requirements.txt

echo Running migrations...
python manage.py makemigrations
python manage.py migrate

echo.
echo ========================================
echo Cart Service Setup Complete!
echo ========================================
echo.
echo To start the service, run:
echo   cd services\cart
echo   venv\Scripts\activate
echo   python manage.py runserver 8002
echo.
pause
