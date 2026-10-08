@rem
@echo off
setlocal

set "_root=%~dp0..\.."
cd /d "%_root%"

title AzurNext WebUI
echo Starting AzurNext WebUI via uv...

rem 延迟 2 秒后自动打开默认浏览器访问 WebUI
start "" /b cmd /c "timeout /t 2 /nobreak >nul && start http://127.0.0.1:25548"

uv run python gui.py

if %errorlevel% neq 0 (
    echo.
    echo AzurNext exited with error code %errorlevel%.
    pause
)

