# AI Baseline Map 🌐

AI Baseline Map is an open-source developer tool built for the **Google Baseline Tooling Hackathon 2025**.  
It integrates **Baseline data about web features** (via the [`web-features`](https://www.npmjs.com/package/web-features) npm package) to provide developers with an interactive map of feature support across browsers and platforms.  

This project helps web developers quickly understand **what features are safe to use today** and **where adoption gaps still exist**.

---

✨ Features
- 📊 Interactive Map & Dashboard – visualize baseline feature adoption.  
- 🔍 Search & Filter – find specific web features by name, category, or support status.  
- 🤖 AI Integration – generate explanations about feature support and recommended fallbacks.  
- 🔄 Live Data – powered by the Baseline `web-features` dataset and updated regularly.  
- 🌍 Hosted Demo – available at [ai-baseline-map.vercel.app](https://ai-baseline-map.vercel.app/).

---

## 🚀 Getting Started

### Prerequisites
- Node.js >= 18  
- npm, yarn, or pnpm  

### Installation
```bash
# Clone the repo
git clone https://github.com/<your-username>/ai-baseline-map.git
cd ai-baseline-map

# Install dependencies
npm install
# or
yarn install
# or
pnpm install
```

### Environment Variables
Create a `.env.local` file in the project root with the following:

```bash
# Example API key (replace with your own if testing locally)
API_KEY=demo-1234abcd
```

👉 For judging and testing, a safe demo key is already configured in the **Vercel-hosted version**, so no manual setup is required unless you run locally.

### Run Locally
```bash
# Development mode
npm run dev

# Build for production
npm run build

# Start production build
npm start
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Testing Instructions
- Visit the live demo: [ai-baseline-map.vercel.app](https://ai-baseline-map.vercel.app/).  
- If running locally:
  1. Follow the installation steps above.  
  2. Add `.env.local` with the demo key.  
  3. Run `npm run dev`.  

No login is required. The app is free and unrestricted for testing.

---

## 🛠️ Tech Stack
- [Next.js](https://nextjs.org/) + [React](https://react.dev/)  
- [Vercel](https://vercel.com/) hosting  
- [web-features](https://www.npmjs.com/package/web-features) Baseline dataset  
- [Tailwind CSS](https://tailwindcss.com/)  
- [OpenAI / LLM API] (optional, for AI feature explanations)  

---

## 📹 Demo Video
Watch the demo here: [YouTube Link](<insert-your-youtube-link>)  
*(~3 minutes, in English with subtitles)*

---

## 📄 License
This project is licensed under the **MIT License** – see the [LICENSE](./LICENSE) file for details.  

---

## 📅 Hackathon Notes
- Built for the **Baseline Tooling Hackathon 2025**.  
- Project created **after August 7, 2025** in compliance with rules.  
- Public, open-source repository with permissive license.  
- Judges have unrestricted access to code and demo.  

---

## 🙌 Acknowledgements
- Google Baseline team for providing the data.  
- Web Platform Dashboard.  
- Hackathon organizers and community testers.  

---
