# Environment Variables Setup

## Required Environment Variables

### GROQ_API_KEY (Required for AI Chat)
- **Purpose**: Powers the AI chatbot functionality
- **How to get**: Visit [Groq Console](https://console.groq.com/) and create a free account
- **Format**: `gsk_...` (starts with gsk_)
- **Local Development**: Add to `.env.local` file
- **Vercel Deployment**: Add to Vercel project settings → Environment Variables

## Optional Environment Variables

### VITE_OPENAI_API_KEY
- **Purpose**: Alternative AI provider (requires paid OpenAI plan)
- **Format**: `sk-...` (starts with sk-)

### VITE_GEMINI_API_KEY  
- **Purpose**: Google Gemini AI provider (free tier available)
- **Format**: Your Google AI Studio API key

### VITE_HUGGINGFACE_API_KEY
- **Purpose**: Hugging Face Inference API (free tier with rate limits)
- **Format**: `hf_...` (starts with hf_)

## Setup Instructions

### Local Development
1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Edit `.env.local` and add your actual API keys:
   ```
   VITE_GROQ_API_KEY=your_actual_groq_key_here
   ```

3. Restart the development server:
   ```bash
   npm run dev
   ```

### Vercel Deployment
1. Go to your Vercel project dashboard
2. Navigate to Settings → Environment Variables
3. Add `VITE_GROQ_API_KEY` with your actual GROQ API key
4. Redeploy your project

## Security Notes
- Never commit `.env.local` or `.env` files to version control
- The `.env.example` file contains placeholder values only
- Real API keys are only stored in Vercel environment variables or local `.env.local`
