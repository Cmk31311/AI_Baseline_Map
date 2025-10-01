@echo off
echo Setting up Groq API Key...
echo.
if not exist .env.local (
    echo GROQ_API_KEY=your_groq_api_key_here > .env.local
    echo Created .env.local file
) else (
    echo .env.local already exists
)
echo.
echo Please edit .env.local and replace 'your_groq_api_key_here' with your actual Groq API key
echo Get your API key from: https://console.groq.com/keys
echo.
pause
