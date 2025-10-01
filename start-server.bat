@echo off
echo Starting Baseline Map Server...
echo.
if not exist .env.local (
    echo Warning: .env.local not found
    echo Please run setup-groq-key.bat first
    echo.
    pause
    exit /b 1
)
echo Starting development server...
npm run dev
