# AI Baseline Tool for Google Chrome Hackathon

A comprehensive web application for visualizing and analyzing Baseline web features, with integrated AI chat assistance powered by multiple LLM providers.

## Features

- **Interactive Baseline Map**: Visualize web features and their browser support levels
- **AI Chat Assistant**: Get help with web development questions via integrated chatbot
- **Multiple AI Providers**: Support for Groq, OpenAI, Google Gemini, Hugging Face, and Ollama
- **Browser Support Analysis**: Detailed compatibility information for web features
- **Baseline Check Script**: CLI tool for checking Baseline compliance in CI/CD
- **Comprehensive Testing**: Unit tests for Baseline data integration

## Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation
```bash
# Clone the repository
git clone <your-repo-url>
cd baseline-map

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your API keys (see Environment Setup below)

# Start development server
npm run dev
```

## Environment Setup

**Required**: GROQ API Key for AI chat functionality
- Get your free API key from [Groq Console](https://console.groq.com/)
- Add to `.env.local` for local development
- Add to Vercel Environment Variables for deployment

See [ENVIRONMENT_SETUP.md](./ENVIRONMENT_SETUP.md) for detailed instructions.

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run test` - Run tests
- `npm run baseline:check` - Check Baseline compliance
- `npm run baseline:stats` - Show Baseline data statistics

## Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Add `VITE_GROQ_API_KEY` to Environment Variables
3. Deploy automatically on push

### Other Platforms
- Ensure `VITE_GROQ_API_KEY` is set in environment variables
- Build command: `npm run build`
- Output directory: `dist`

## Technology Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: CSS3 with modern features
- **Data**: web-features npm package for Baseline data
- **AI**: Multiple LLM providers (Groq, OpenAI, Gemini, Hugging Face, Ollama)
- **Testing**: Vitest + Testing Library
- **Build**: Vite with optimized production builds

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details
