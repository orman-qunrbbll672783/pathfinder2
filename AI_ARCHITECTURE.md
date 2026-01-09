# AI-Driven Reasoning Architecture

## Overview
PathFinder now uses an AI-First architecture where every user decision is routed through an AI reasoning layer before any flow is determined.

## Core Components

### 1. Situation Analyzer (`lib/ai-reasoning/situation-analyzer.ts`)
- **Input**: User selects a card (SituationType).
- **Process**: Calls Azure OpenAI to reason about the user's mental state.
- **Output**: Determines specific questions to ask and the appropriate "Flow Type" (Exploration, Execution, Validation, Recovery, Browse).
- **Fallback**: Contains robust hardcoded logic if AI is unavailable.

### 2. Dynamic Journey Page (`app/journey/[situation]/page.tsx`)
- Replaces the static Profile page.
- Renders the AI-generated questions dynamically.
- Shows the AI's "Reasoning" to the user for transparency.

### 3. Outcome Generator (`lib/ai-reasoning/outcome-generator.ts`)
- **Input**: User answers + Situation.
- **Process**: Generates a specific artifact based on the situation:
  - `university_paths`: For "Study Abroad" (uses Path Matcher Engine).
  - `exploration_map`: For "I don't know" (broad options).
  - `decision_validation`: For "Unsure".
  - `recovery_plan`: For "Something went wrong".
  - `info_board`: For "Explore safely".

### 4. Scenario Simulation (`app/scenario/[pathId]/page.tsx`)
- The "Deep Dive" view for a selected path.
- Shows Best/Likely/Failure scenarios.
- Integrated Streaming AI Chat for context-specific questions.

## Flow Diagram
```
User Click Card 
   │
   ▼
Analyze Situation (AI) ──▶ Determine Questions & Intent
   │
   ▼
Collect Answers (Dynamic UI)
   │
   ▼
Generate Outcome (AI/Engine) ──▶ Show Specific Result (Paths, Map, Plan, etc.)
```

## Setup
Ensure `.env.local` contains valid `AZURE_OPENAI_...` credentials to enable the full AI reasoning. The system degrades gracefully to static logic if keys are missing.
