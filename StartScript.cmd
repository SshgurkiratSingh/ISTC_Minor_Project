@echo off
setlocal

:: Function to install npm packages in a directory
:install_packages
echo Installing npm packages in %1...
cd %1
npm install
cd ..
goto :eof

:: Install npm packages for both frontend and backend
call :install_packages "backEnd"
call :install_packages "frontend"

set /p "start_backend=Do you want to start the Backend? (y/n): "
if /i "%start_backend%"=="y" (
    echo Starting Backend...
    cd backEnd
    start node index
    cd ..
) else (
    echo Backend will not be started.
)

set /p "start_frontend=Do you want to start the Frontend? (y/n): "
if /i "%start_frontend%"=="y" (
    echo Starting Frontend...
    cd frontend
    start npm run dev
    cd ..
) else (
    echo Frontend will not be started.
)

echo Done.
