@echo off
echo ========================================
echo   GROQ API Key Setup Helper
echo ========================================
echo.
echo Current .env.local content:
type .env.local
echo.
echo ========================================
echo   INSTRUCTIONS:
echo ========================================
echo 1. Go to: https://console.groq.com/
echo 2. Sign up for a free account
echo 3. Create a new API key
echo 4. Copy the key (starts with gsk_)
echo 5. Edit .env.local file
echo 6. Replace "demo-1234abcd" with your real key
echo.
echo Example:
echo VITE_GROQ_API_KEY=gsk_your_actual_key_here
echo.
echo After updating, restart the dev server:
echo npm run dev
echo.
pause
