# AI Baseline Tool for Google Chrome Hackathon

A comprehensive monorepo containing multiple tools for visualizing, analyzing, and working with Baseline web features. This project includes a web application, VS Code extension, ESLint plugin, and AI-powered code analyzer.

## 🏗️ Monorepo Structure

This monorepo contains several interconnected tools:

- **`/app`** - Main Next.js web application with interactive baseline map
- **`/src`** - Shared components and utilities
- **`/eslint-plugin-baseline`** - ESLint plugin for baseline compliance checking
- **`/vscode-extension`** - VS Code extension for hover information
- **`/lib`** - Core baseline analysis and data processing
- **`/tools`** - CLI tools and utilities

## ✨ Features

### 🌐 Interactive Baseline Map
- **Visual Feature Explorer**: Browse 1,000+ web features with interactive cards
- **Real-time Filtering**: Search by name, filter by baseline status (widely/newly/limited available)
- **Browser Support Analysis**: Detailed compatibility information with version requirements
- **Hover Tooltips**: Quick information without leaving the main view
- **Responsive Design**: Works seamlessly on desktop and mobile devices

### 🤖 AI Chat Assistant
- **Intelligent Q&A**: Ask questions about web features, alternatives, and best practices
- **Context-Aware Responses**: AI understands baseline compatibility and provides relevant suggestions
- **Multiple AI Providers**: Support for Groq, OpenAI, Google Gemini, Hugging Face, and Ollama
- **Real-time Streaming**: Get instant responses with streaming chat interface
- **Feature-Specific Help**: Get recommendations for specific web features and their alternatives

### 📊 Code Analyzer
- **File Upload Analysis**: Upload JavaScript, TypeScript, CSS, and HTML files for analysis
- **Baseline Compliance Checking**: Identify features that may not be widely supported
- **Detailed Reports**: Get comprehensive analysis with suggestions and alternatives
- **Export Results**: Download analysis reports in JSON and CSV formats
- **Real-time Processing**: Fast analysis with progress indicators

### 🔧 VS Code Extension
- **Hover Information**: See baseline compatibility when hovering over web features
- **Multi-language Support**: Works with CSS, JavaScript, TypeScript, HTML, JSX, and TSX
- **Quick Links**: Direct access to specifications and Can I Use data
- **Status Indicators**: Visual indicators for baseline status (widely/newly/limited)
- **Published**: Available on [VS Code Marketplace](https://marketplace.visualstudio.com/items?itemName=ckhadar3.baseline-map-extension)

### 📋 ESLint Plugin
- **Baseline Compliance**: Enforce baseline standards in your code
- **Configurable Rules**: Customize which baseline levels to enforce
- **CI/CD Integration**: Perfect for automated code quality checks
- **Detailed Reporting**: Get specific feedback on non-baseline features
- **Published**: Available on [npm](https://www.npmjs.com/package/eslint-plugin-baseline-compatibility)
- **Repository**: [GitHub](https://github.com/Cmk31311/AI_Baseline_Map/tree/main/eslint-plugin-baseline)

### 🛠️ CLI Tools
- **Baseline Check**: Command-line tool for checking files and directories
- **Statistics**: View baseline data statistics and coverage
- **CI/CD Integration**: Automated baseline compliance in build pipelines

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation
```bash
# Clone the repository
git clone <your-repo-url>
cd AI_Baseline_Map

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your API keys (see Environment Setup below)

# Start development server
npm run dev
```

### 🎯 Using Different Tools

#### Web Application
```bash
npm run dev
# Opens at http://localhost:3000
```

#### VS Code Extension
```bash
# Install from VS Code Marketplace
# Search for "Baseline Map" in VS Code Extensions

# Or install from source:
cd vscode-extension
npm install
npm run compile
# Press F5 in VS Code to test the extension
```

#### ESLint Plugin
```bash
# Install from npm
npm install --save-dev eslint-plugin-baseline-compatibility

# Or install from source:
cd eslint-plugin-baseline
npm install
npm run build
# Use in your project's ESLint configuration
```

#### Code Analyzer
```bash
# Access via web interface at /analyzer
# Or use CLI tools:
npm run baseline:check
npm run baseline:stats
```

## 🔧 Environment Setup

**Required**: GROQ API Key for AI chat functionality
- Get your free API key from [Groq Console](https://console.groq.com/)
- Add to `.env.local` for local development
- Add to Vercel Environment Variables for deployment

Create a `.env.local` file:
```env
GROQ_API_KEY=your_groq_api_key_here
```

## 📜 Available Scripts

### Main Application
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Baseline Tools
- `npm run baseline:check` - Check Baseline compliance
- `npm run baseline:stats` - Show Baseline data statistics
- `npm run baseline:check:allow-newly` - Check with newly available features allowed
- `npm run baseline:report` - Generate detailed baseline report

### Testing
- `npm run test` - Run test suite
- `npm run test:watch` - Run tests in watch mode

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Add `GROQ_API_KEY` to Environment Variables
3. Deploy automatically on push

### Other Platforms
- Ensure `GROQ_API_KEY` is set in environment variables
- Build command: `npm run build`
- Output directory: `.next`

## 🛠️ Technology Stack

### Frontend
- **Framework**: Next.js 15 with React 19
- **Language**: TypeScript
- **Styling**: Tailwind CSS + Custom CSS
- **Icons**: Lucide React

### Backend & Data
- **Data Source**: web-features npm package (1,085+ web features)
- **AI Integration**: Groq SDK with streaming support
- **File Processing**: Papa Parse for CSV export
- **Analysis Engine**: Custom baseline compliance checker

### Development Tools
- **Linting**: ESLint with Next.js config
- **Testing**: Jest + Testing Library
- **Build**: Next.js optimized builds
- **Package Manager**: npm

### Extensions & Plugins
- **VS Code Extension**: TypeScript + VS Code API
- **ESLint Plugin**: Custom rules for baseline compliance
- **CLI Tools**: Node.js with tsx for TypeScript execution

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Add tests if applicable
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Add tests for new features
- Update documentation for API changes
- Ensure baseline compliance in your code

## 📄 License

MIT License - see LICENSE file for details

## 📦 Published Packages

### VS Code Extension
- **Marketplace**: [Baseline Map Extension](https://marketplace.visualstudio.com/items?itemName=your-extension-id)
- **Install**: Search for "Baseline Map" in VS Code Extensions
- **Features**: Hover information for web features, baseline compatibility checking

### ESLint Plugin
- **npm Package**: [eslint-plugin-baseline-compatibility](https://www.npmjs.com/package/eslint-plugin-baseline-compatibility)
- **GitHub Repository**: [eslint-plugin-baseline](https://github.com/Cmk31311/AI_Baseline_Map/tree/main/eslint-plugin-baseline)
- **Install**: `npm install --save-dev eslint-plugin-baseline-compatibility`
- **Features**: Baseline compliance enforcement, configurable rules

## 🙏 Acknowledgments

- Built for Google Chrome Hackathon
- Uses data from [web-features](https://github.com/web-platform-dx/web-features)
- Powered by [Groq](https://groq.com/) for AI capabilities
