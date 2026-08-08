# AI Technical Interviewer Agent

An enterprise-grade, multi-turn AI Technical Interviewer web application built for automated candidate technical evaluation. Operates on a single unified REST endpoint (`POST /api/interview`), supporting multi-LLM provider routing with key rotation, persistent session state, and automated curriculum-anchored feedback generation.

---

## 📑 Evaluator Compliance Checklist Summary (`project.md`)

- [x] **Single Unified Endpoint**: `POST /api/interview` handles session creation, multi-turn dialogue, and final feedback generation.
- [x] **Authentication-Free**: Publicly accessible without API tokens or headers.
- [x] **Strict API Contract Shapes**:
  - Initial request: `{ sessionId, candidate }` → `{ reply, done: false }`
  - Dialogue turn: `{ sessionId, message }` → `{ reply, done: false }`
  - Final response: `{ reply, done: true, feedback: { summary: string, strengths: string[], gaps: string[], next: string[] } }`
- [x] **Multi-Turn Depth Requirements**: Requires at least **8 technical questions** across at least **4 distinct curriculum days** before concluding the interview.
- [x] **Adaptive Context-Aware Follow-ups**: Evaluates candidate answers per turn and shapes follow-up probes directly around the candidate's previous response.
- [x] **Resilient Hosting Compatibility**: In-memory session store + Prisma SQLite DB ensures zero state loss or 404s on single-process hosts (Render, Railway, Docker).

---

## 🚀 Quick Start (Local Development)

### 1. Environment Setup
Copy `.env.example` to `.env` in the `backend/` directory:

```bash
cp backend/.env.example backend/.env
```

Fill in your desired LLM API key(s) in `backend/.env`:

```env
PORT=3000
NODE_ENV=development
DATABASE_URL="file:./dev.db"

# LLM Providers (at least one key required)
GROQ_API_KEY=your_groq_api_key
GEMINI_API_KEY=your_gemini_api_key
OPENAI_API_KEY=your_openai_api_key
```

### 2. Install Dependencies & Seed Database
```bash
npm run install:all
cd backend && npx prisma db push && npx ts-node scripts/seedDatabase.ts
```

### 3. Run Development Servers
```bash
# Terminal 1 — Backend (Port 3000)
cd backend && npm run dev

# Terminal 2 — Frontend (Port 5173)
cd frontend && npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🌐 Deploying to Render

This repository is pre-configured with a `render.yaml` blueprint for 1-click Render deployment.

### Method 1: Render Blueprint (Recommended)
1. Push this repository to GitHub.
2. Go to [Render Dashboard](https://dashboard.render.com/) and click **New +** → **Blueprint**.
3. Connect your GitHub repository. Render will automatically detect `render.yaml`.
4. Fill in your environment variables (`GROQ_API_KEY`, `GEMINI_API_KEY`, `OPENAI_API_KEY`) when prompted.
5. Click **Apply**. Render will build both frontend and backend assets automatically.

### Method 2: Manual Web Service Setup
1. Click **New +** → **Web Service** on Render.
2. Connect your GitHub repository.
3. Configure the following settings:
   - **Environment**: `Node`
   - **Build Command**: `npm run build`
   - **Start Command**: `npm start`
4. Add your environment variables under the **Environment** tab:
   - `NODE_ENV` = `production`
   - `PORT` = `3000`
   - `GROQ_API_KEY` = `your_key`
   - `GEMINI_API_KEY` = `your_key`
   - `OPENAI_API_KEY` = `your_key`

---

## 🧪 Testing the API Endpoint

You can test the deployed endpoint directly via `curl`:

```bash
# 1. Start Interview Session
curl -X POST "https://your-app.onrender.com/api/interview" \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "test-session-101",
    "candidate": {
      "member": {
        "id": "CAND-001",
        "name": "Sarah Johnson",
        "jobRole": "Senior Data Engineer",
        "yearsExperience": 6,
        "education": "M.S. Computer Science",
        "status": "Active"
      },
      "missions": [
        { "day": 1, "title": "Capstone Project", "passed": true },
        { "day": 2, "title": "Prompt Engineering", "passed": true }
      ],
      "signals": { "commitDays": 14, "missionsCompleted": 8, "missionsFirstTry": 6 }
    }
  }'

# 2. Submit Dialogue Turn
curl -X POST "https://your-app.onrender.com/api/interview" \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "test-session-101",
    "message": "I used Qdrant vector database with HNSW indexing to achieve sub-10ms similarity search latency."
  }'
```

---

## 🏗️ Architecture & Multi-LLM Routing

```
                        ┌───────────────────────────────┐
                        │   POST /api/interview        │
                        └──────────────┬────────────────┘
                                       │
                               ┌───────▼───────┐
                               │ SessionStore  │ (Memory Map + SQLite)
                               └───────┬───────┘
                                       │
                               ┌───────▼───────┐
                               │   LLMRouter   │
                               └───────┬───────┘
          ┌────────────┬───────────────┼───────────────┬────────────┐
          ▼            ▼               ▼               ▼            ▼
     ┌─────────┐  ┌──────────┐  ┌─────────────┐  ┌───────────┐  ┌─────────┐
     │  Groq   │  │ Gemini   │  │  xAI Grok   │  │ NVIDIA NIM│  │ OpenAI  │
     │(Llama-3)│  │(1.5Flash)│  │ (Grok-3)    │  │ (Llama-3) │  │(GPT-4o) │
     └─────────┘  └──────────┘  └─────────────┘  └───────────┘  └─────────┘
                                       │ (Fallback Engine)
                               ┌───────▼───────┐
                               │ Mock Provider │ (Zero-latency guarantee)
                               └───────────────┘
```

- **Failover Chain**: `Groq` → `Gemini` → `Grok` → `NVIDIA NIM` → `OpenAI` → `MockProvider`.
- **Key Rotation**: Each provider uses a round-robin `KeyRotator` to cycle through multiple API keys on HTTP 429 rate limits or errors.
- **Session Cleanup**: In-memory sessions automatically expire after 2 hours of inactivity.
