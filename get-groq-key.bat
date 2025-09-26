@echo off
echo ========================================
echo   GROQ API Key Setup - QUICK FIX
echo ========================================
echo.
echo The chatbot is now working with demo responses!
echo.
echo To get REAL AI responses from GROQ:
echo.
echo 1. Go to: https://console.groq.com/
echo 2. Click "Sign Up" (it's FREE!)
echo 3. Create an account
echo 4. Go to "API Keys" section
echo 5. Click "Create API Key"
echo 6. Copy the key (starts with gsk_)
echo 7. Edit .env.local file
echo 8. Replace the placeholder with your real key
echo.
echo Example:
echo VITE_GROQ_API_KEY=gsk_your_real_key_here
echo.
echo After updating, the chatbot will use real GROQ AI!
echo.
echo Current .env.local content:
type .env.local
echo.
pause
