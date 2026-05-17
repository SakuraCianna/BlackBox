start "" /D "%~dp0backend" cmd /k ".venv\Scripts\python.exe main.py"
start "" /D "%~dp0frontend" cmd /k "npm start"
