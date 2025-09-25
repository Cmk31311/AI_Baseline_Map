# AI Integration Setup Guide

## 🚀 Multiple AI Providers Available

Your chatbot now supports multiple AI providers! Here's how to set them up:

## 1. **Groq API** (Recommended - Fast & Free)
- **Speed**: ⚡ Lightning fast (sub-second responses)
- **Cost**: 💰 Free tier: 14,400 requests/day
- **Setup**: 
  1. Go to [Groq Console](https://console.groq.com/)
  2. Sign up for free
  3. Get your API key
  4. Replace `gsk_your_groq_api_key_here` in `src/config/aiConfig.ts`

## 2. **OpenAI API** (Most Reliable)
- **Speed**: 🚀 Very fast
- **Cost**: 💰 Pay per use (~$0.002 per request)
- **Setup**:
  1. Go to [OpenAI Platform](https://platform.openai.com/)
  2. Create API key
  3. Replace `sk-your_openai_api_key_here` in `src/config/aiConfig.ts`
  4. Set `enabled: true` for openai provider

## 3. **Google Gemini API** (Free Tier)
- **Speed**: 🏃 Fast
- **Cost**: 💰 Free tier available
- **Setup**:
  1. Go to [Google AI Studio](https://makersuite.google.com/)
  2. Get API key
  3. Replace `your_gemini_api_key_here` in `src/config/aiConfig.ts`
  4. Set `enabled: true` for gemini provider

## 4. **Hugging Face API** (Free Tier)
- **Speed**: 🚶 Moderate
- **Cost**: 💰 Free tier with rate limits
- **Setup**:
  1. Go to [Hugging Face](https://huggingface.co/)
  2. Get access token
  3. Replace `hf_your_huggingface_token_here` in `src/config/aiConfig.ts`
  4. Set `enabled: true` for huggingface provider

## 5. **Ollama** (Local - Already Working)
- **Speed**: 🐌 Slower (depends on your hardware)
- **Cost**: 💰 Free (runs locally)
- **Setup**: Already configured! No changes needed.

## 🔧 How It Works

1. **Primary**: Tries the first enabled provider (currently Groq)
2. **Fallback**: If primary fails, tries Ollama
3. **Final Fallback**: If all AI fails, uses intelligent responses

## ⚡ Quick Start (Recommended)

1. **Get Groq API Key** (Free):
   - Visit: https://console.groq.com/
   - Sign up
   - Copy your API key

2. **Update Configuration**:
   - Open `src/config/aiConfig.ts`
   - Replace `gsk_your_groq_api_key_here` with your actual key
   - Save the file

3. **Test**:
   - Your chatbot will now use Groq for lightning-fast responses!
   - If Groq fails, it automatically falls back to Ollama

## 🎯 Benefits

- **Speed**: Groq responds in milliseconds
- **Reliability**: Multiple fallback options
- **Cost**: Free tier available
- **No Local Setup**: No need to run Ollama locally

## 🔄 Switching Providers

To switch to a different provider:
1. Open `src/config/aiConfig.ts`
2. Set your preferred provider to `enabled: true`
3. Set others to `enabled: false`
4. Add your API key
5. Save and restart the server

## 🆘 Troubleshooting

- **"API Error"**: Check your API key
- **"Request timed out"**: Provider is slow, will fallback automatically
- **"No response"**: All providers failed, using intelligent fallback

Your chatbot is now much more reliable and faster! 🎉
