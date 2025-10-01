@echo off
echo Getting Groq API Key...
echo.
echo Please visit: https://console.groq.com/keys
echo.
echo Copy your API key and paste it below:
set /p api_key="Enter your Groq API key: "
echo.
echo GROQ_API_KEY=%api_key% > .env.local
echo.
echo API key saved to .env.local
echo You can now run: npm run dev
pause
