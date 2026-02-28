@echo off
REM Setup script for Products Microservice

echo Setting up Products Microservice...
echo.

REM Activate virtual environment
echo Activating virtual environment...
call ..\..\.venv\Scripts\activate.bat

REM Install requirements
echo Installing dependencies...
pip install -r requirements.txt

REM Make migrations
echo Creating migrations...
python manage.py makemigrations

REM Apply migrations
echo Applying migrations...
python manage.py migrate

REM Create superuser (optional)
echo.
echo Superuser creation (optional):
python manage.py createsuperuser

REM Collect static files
echo.
echo Collecting static files...
python manage.py collectstatic --noinput

echo.
echo Setup complete!
echo.
echo To start the development server, run:
echo python manage.py runserver 0.0.0.0:8001
echo.
pause
