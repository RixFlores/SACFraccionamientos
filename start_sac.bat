@echo off
REM Iniciar XAMPP (Apache y MySQL)
start "" "C:\xampp\apache_start.bat"
start "" "C:\xampp\mysql_start.bat"

REM Abrir Visual Studio Code - Backend (API)
start "" code "C:\Users\PC\Desktop\Master_Code\SAC fraccionamientos\SACFraccionamientos\api\puntodeventa-api"

REM Abrir Visual Studio Code - Frontend (Angular)
start "" code "C:\Users\PC\Desktop\Master_Code\SAC fraccionamientos\SACFraccionamientos\frontend\sac-fraccionamientos"

start cmd /k "cd /d C:\Users\PC\Desktop\Master_Code\SAC fraccionamientos\SACFraccionamientos\frontend\sac-fraccionamientos && ng serve"
start cmd /k "cd /d C:\Users\PC\Desktop\Master_Code\SAC fraccionamientos\SACFraccionamientos\api\puntodeventa-api && npm start"

REM Abrir navegador Firefox en localhost:4200
start "" firefox "http://localhost:4200/#/"