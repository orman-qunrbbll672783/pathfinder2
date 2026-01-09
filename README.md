# PathFinder - Student Decision Support Platform

**Built for Imagine Cup 2026**

PathFinder is a decision-support platform that helps students navigate education choices through structured guidance rather than data overload. Powered by Azure OpenAI.

## 🎯 Purpose

PathFinder answers one core question: **"What should I do next?"**

Students don't lack data—they lack:
- Direction
- Comparison
- Trustworthy paths
- Decision support

This app converts scattered public data into structured, explainable decisions.

## ✨ Features

### Core User Flow
1. **Situation Selection** - Choose your current situation
2. **Profile Collection** - Minimal input (country, stage, budget, fears, confidence)
3. **Path Generation** - Get exactly 3 realistic, diverse paths
4. **Scenario Simulation** - See best/likely/failure cases
5. **AI Explanations** - Streaming ChatGPT-style explanations
6. **Timeline Planning** - Unified timeline with deadlines and fallbacks

### Decision Systems
- ✅ University Fit Score Calculator
- ✅ Risk Analysis (financial, visa, academic, time)
- ✅ Scholarship Matching
- ✅ Country Move Readiness
- ✅ Transfer Reality Checker
- ✅ Alternative Education Paths
- ✅ Emergency Scenario Planning

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Azure OpenAI access (optional for MVP)

### Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Azure OpenAI Setup (Optional)

1. Create Azure account at [portal.azure.com](https://portal.azure.com)
2. Apply for OpenAI access at [aka.ms/oai/access](https://aka.ms/oai/access)
3. Create Azure OpenAI resource
4. Deploy GPT-4 or GPT-3.5-turbo model
5. Copy credentials to `.env.local`:

```env
AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com/
AZURE_OPENAI_API_KEY=your-key-here
AZURE_OPENAI_DEPLOYMENT=gpt-4
```

**Note:** The app works without Azure OpenAI using fallback explanations. Once configured, AI explanations will stream with typing animation.

## 📊 Data Strategy

### Current Implementation
- **Real Data**: 40-50 curated records per category (universities, scholarships, countries, bootcamps, internships)
- **Sources**: Manual curation from official websites, rankings, and government pages
- **Scraping Module**: Built-in scrapers for expanding data (see `lib/scrapers/`)

### Expanding Data

To add more universities:
```typescript
// lib/data/seed-data.ts
export const UNIVERSITIES: University[] = [
  // Add new entries here
];
```

To run scrapers:
```bash
# Example: Scrape QS Rankings
npm run scrape:universities
```

## 🏗️ Project Structure

```
pathfinder/
├── app/
│   ├── page.tsx                    # Entry screen (Step 1)
│   ├── profile/page.tsx            # Input collection (Step 2)
│   ├── paths/page.tsx              # Path results (Step 3)
│   ├── scenario/[pathId]/page.tsx  # Scenario simulation (Step 4)
│   └── api/
│       ├── generate-paths/route.ts # Path matching API
│       └── explain/route.ts        # AI explanation API
├── lib/
│   ├── types.ts                    # TypeScript interfaces
│   ├── azure-openai.ts             # Azure OpenAI client with streaming
│   ├── data/
│   │   └── seed-data.ts            # Real data (40-50 records each)
│   ├── engines/
│   │   └── path-matcher.ts         # Core decision logic
│   └── scrapers/
│       └── university-scraper.ts   # Web scraping utilities
└── components/
    └── StreamingChat.tsx           # AI chat UI with typing animation
```

## 🎨 Design Philosophy

- **Modern & Minimal** - Clean, calm interface
- **No Dashboards** - Focused user flow
- **Streaming AI** - ChatGPT-style typing animation
- **Premium Feel** - Gradients, smooth animations, glassmorphism
- **Mobile-First** - Responsive design

## 🔧 Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **AI**: Azure OpenAI (streaming)
- **Data**: JSON files (easily upgradable to database)
- **Scraping**: Cheerio + Axios

## 📝 Key Principles

1. **No Hallucination** - AI never invents facts
2. **Transparency** - All decisions explained
3. **Realistic Expectations** - No promises, only probabilities
4. **Fallback Plans** - Every path has recovery options
5. **User Control** - Students make decisions, we provide support

## 🚧 Roadmap

### Phase 1 (Current)
- [x] Core user flow (Steps 1-6)
- [x] Path matching engine
- [x] Streaming AI explanations
- [x] Real data (40-50 records)
- [ ] Scenario simulation page
- [ ] Timeline visualization

### Phase 2
- [ ] Emergency planning module
- [ ] Expand data to 100+ records per category
- [ ] Automated scraping pipeline
- [ ] User accounts and saved paths
- [ ] Mobile app (React Native)

### Phase 3
- [ ] Community features
- [ ] Mentor matching
- [ ] Real-time visa tracking
- [ ] Application deadline reminders

## 🤝 Contributing

This is an Imagine Cup project. Contributions welcome!

## 📄 License

MIT License

## 🏆 Imagine Cup 2026

PathFinder is built for Imagine Cup 2026, showcasing:
- Azure OpenAI integration (mandatory requirement)
- Real-world problem solving
- Student-focused innovation
- Scalable architecture

---

**Built with ❤️ for students worldwide**
