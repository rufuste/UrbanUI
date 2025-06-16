@echo off
REM Start the Flask backend
start cmd /k "cd /d %~dp0UrbanAPIServer\UrbanAPIServer && call .venv\Scripts\activate && python app.py"

REM Start the React frontend
start cmd /k "cd /d %~dp0UrbanUIFrontend\urban-ui-frontend && npm start"

pause
