# 🧪 Catalyst — AI Technical Interview Agent

> An autonomous AI interview agent that conducts personalized, multi-turn technical interviews for the AI Cohort program.

---

## Overview

Catalyst is a full-stack AI interview system that:

- **Conducts adaptive interviews** — dynamically adjusts question difficulty based on candidate responses
- **Personalizes to each candidate** — plans interview topics around their specific completed missions, attempts, and skipped topics
- **Routes across multiple LLMs** — automatically fails over between Groq, Google Gemini, OpenAI, xAI Grok, and NVIDIA NIM
- **Generates structured feedback** — produces evaluation reports with strengths, gaps, and actionable next steps
- **Meets all spec requirements** — ≥ 8 questions, ≥ 4 curriculum days covered, structured JSON feedback

## Architecture

```
┌──────────────────────────────────────────────────────────┐
│                    React Frontend (Vite)                  │
│  ┌──────────┐  ┌───────────────┐  ┌──────────────────┐  │
│  │ Landing   │  │ Interview     │  │ Feedback         │  │
│  │ Page      │  │ Canvas        │  │ Dashboard        │  │
│  └──────────┘  └───────────────┘  └──────────────────┘  │
└──────────────────────┬───────────────────────────────────┘
                       │ POST /api/interview
┌──────────────────────┴───────────────────────────────────┐
│                Express Backend (TypeScript)                │
│  ┌──────────────┐  ┌──────────────┐  ┌────────────────┐  │
│  │ Interview     │  │ Candidate    │  │ Session        │  │
│  │ Controller    │  │ Planner      │  │ Store          │  │
│  └──────┬───────┘  └──────────────┘  └────────────────┘  │
│         │                                                  │
│  ┌──────┴───────────────────────────────────────────────┐ │
│  │            Multi-LLM Router (Auto-Failover)           │ │
│  │  ┌─────┐  ┌───────┐  ┌──────┐  ┌────┐  ┌──────┐    │ │
│  │  │Groq │  │Gemini │  │OpenAI│  │Grok│  │NVIDIA│    │ │
│  │  └─────┘  └───────┘  └──────┘  └────┘  └──────┘    │ │
│  │  ┌──────────────────────────────────────────┐        │ │
│  │  │ Mock Provider (Zero-Latency Fallback)    │        │ │
│  │  └──────────────────────────────────────────┘        │ │
│  └──────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────┘
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, TypeScript, Vite |
| Backend | Express, TypeScript, Zod validation |
| LLM Providers | Groq (Llama 3.3 70B), Google Gemini 1.5 Flash, OpenAI GPT-4o-mini, xAI Grok, NVIDIA NIM |
| Deployment | Docker (multi-stage build) |
| Design | Custom CSS with Barlow Condensed + DM Mono typography |

## Quick Start

### Prerequisites
- Node.js 20+
- At least one LLM API key (or use mock mode)

### Local Development

```bash
# 1. Clone the repository
git clone <repo-url>
cd Catalyst

# 2. Setup backend
cd backend
cp .env.example .env
# Edit .env — add at least one API key (GROQ_API_KEY, GEMINI_API_KEY, etc.)
npm install
npm run dev

# 3. Setup frontend (in a separate terminal)
cd frontend
npm install
npm run dev
```

Backend runs at `http://localhost:3000`, frontend at `http://localhost:5173`.

### Docker

```bash
docker build -t catalyst-interviewer .
docker run -p 3000:3000 --env-file backend/.env catalyst-interviewer
```

## API Contract

Single endpoint: `POST /api/interview`

### Start Interview
```json
POST /api/interview
{
  "sessionId": "abc-123",
  "candidate": { ...candidate profile }
}
→ { "reply": "Welcome...", "done": false }
```

### Conversation Turn
```json
POST /api/interview
{
  "sessionId": "abc-123",
  "message": "I implemented vector embeddings using..."
}
→ { "reply": "That's interesting...", "done": false }
```

### End Interview
```json
→ {
    "reply": "Interview completed.",
    "done": true,
    "feedback": {
      "summary": "...",
      "strengths": ["..."],
      "gaps": ["..."],
      "next": ["..."]
    }
  }
```

### Health Check
```
GET /api/health → { status: "ok", availableProviders: [...] }
```

## Key Features

### 🧠 Adaptive Interview Logic
- Plans interview based on candidate's specific completed missions
- Uses attempt counts and skip data to focus on areas of difficulty
- Follows up when candidates score ≤ 3, advances when they demonstrate mastery

### 🔀 Multi-LLM Router
- Automatic tier-based failover across 5 providers
- Key rotation with cooldown on rate limits (429) and auth errors
- Zero-latency mock fallback guarantees 100% uptime

### 📊 Structured Feedback
- Executive summary with quantitative metrics
- SVG radar chart visualization
- Exportable interview reports

### 🎯 Spec Compliance
- ≥ 8 questions enforced via `questionCount >= 8` gate
- ≥ 4 curriculum days enforced via `coveredDays.size >= 4` gate
- Wind-down phase gives candidates a closing turn before feedback
- Visual progress rings track spec compliance in real-time

## Project Structure

```
Catalyst/
├── backend/
│   ├── src/
│   │   ├── controllers/     # HTTP request handlers
│   │   ├── providers/       # LLM provider implementations
│   │   │   ├── baseProvider.ts   # Abstract base class
│   │   │   ├── prompts.ts        # Centralized prompt templates
│   │   │   ├── keyRotator.ts     # API key rotation
│   │   │   ├── llmRouter.ts      # Multi-provider router
│   │   │   └── ...Provider.ts    # Groq, Gemini, OpenAI, Grok, NVIDIA
│   │   ├── services/        # Business logic
│   │   │   ├── interviewerAgent.ts  # Interview turn orchestration
│   │   │   ├── sessionStore.ts      # Session state management
│   │   │   └── candidatePlanner.ts  # Curriculum-based planning
│   │   ├── types.ts          # TypeScript interfaces
│   │   └── index.ts          # Express server entry
│   └── tests/
├── frontend/
│   └── src/
│       ├── components/       # React UI components
│       ├── services/         # API client
│       └── styles/           # CSS design system
├── candidates.json           # Candidate profiles
├── curriculum.json           # 31-day curriculum
├── technical-spec.md         # API specification
└── Dockerfile                # Multi-stage production build
```

## Environment Variables

See [`backend/.env.example`](backend/.env.example) for all configuration options. At minimum, configure one LLM provider API key. The system works with the mock provider if no keys are configured.
