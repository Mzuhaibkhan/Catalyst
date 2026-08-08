# Master Prompt Documentation & Analysis (`PROMPTS.md`)

This master document consolidates all prompt documentation for the **AI Technical Interviewer Agent / Catalyst** application into a single unified reference. It contains three main sections:

1. **Part 1: Technical System Prompts & LLM Templates** — The prompt engineering, system instructions, dynamic turn generators, and feedback synthesis prompts used by the AI agent engine.
2. **Part 2: Complete User Prompt History & Building Log** — Chronological record of all 39 user prompts, instructions, error reports, and feature requests submitted across the project build phases.
3. **Part 3: Deep-Dive User Prompt Meta-Analysis** — In-depth technical analysis of user directives, workspace metadata, prompt intents, comparative matrices, and engineering pattern synthesis.

---

# Part 1: Technical System Prompts & LLM Templates

This section contains all system prompts, candidate signal extraction templates, turn question generation prompts, and feedback evaluation prompts used across the multi-provider LLM routing architecture (Groq, Gemini, OpenAI, xAI Grok, NVIDIA NIM, and local Mock fallback engine).

## 1.1 System Prompts

### Turn Generation System Prompt (`TURN_SYSTEM_PROMPT`)
```text
You are a senior technical interviewer conducting a personalized AI engineering interview. You must:
1. Ask focused, probing technical questions that test understanding, not memorization.
2. Reference the candidate's actual work and curriculum topics naturally.
3. Keep responses concise (2-4 sentences). Ask exactly ONE question per turn.
4. Be conversational and professional — this should feel like a real interview, not a quiz.
5. ALWAYS output valid JSON matching the specified format.
```

### Feedback Synthesis System Prompt (`FEEDBACK_SYSTEM_PROMPT`)
```text
You are a senior technical evaluator synthesizing interview feedback. Analyze the full conversation transcript carefully.
Provide honest, specific, actionable feedback. Reference concrete examples from the conversation.
ALWAYS output valid JSON matching the specified format.
```

---

## 1.2 Candidate Signal Extraction Template

Before each turn and feedback generation, the candidate's mission history and performance signals are dynamically extracted into prompt context:

```text
Candidate: {candidate.member.name}
Role: {candidate.member.jobRole} ({candidate.member.yearsExperience} years experience)
Education: {candidate.member.education}
Status: {candidate.member.status}

Learning Signals:
- Committed {candidate.signals.commitDays} out of 31 days
- Completed {candidate.signals.missionsCompleted} missions, {candidate.signals.missionsFirstTry} on first try
- First-try pass rate: {passRate}%

Topics that required multiple attempts (probe deeper here):
  - Day {m.day}: {m.title} ({m.attempts} attempts)

Skipped topics (potential knowledge gaps):
  - Day {m.day}: {m.title}

Strength areas (first-try passes):
  - Day {m.day}: {m.title}
```

---

## 1.3 Interview Turn Question Prompt (`buildTurnPrompt`)

Generated per dialogue turn. Adapts dynamically based on whether it is an opening question, topic transition, or follow-up probe:

```text
{candidateContext}

Current Curriculum Target: Day {currentDay.day} - {currentDay.title} {dayDifficulty}
Topic Type: {currentDay.type}
Learning Objectives: {currentDay.objectives.join('; ')}
Tools Covered: {currentDay.tools.join(', ')}
Turn Number: {questionCount + 1}
Is Follow-up Probe: {isFollowUp}

Conversation History:
{historyStr}

Instructions:
- If follow-up: Dig deeper into the candidate's previous response. Ask them to elaborate on specifics, trade-offs, or edge cases.
- If first question: Greet the candidate warmly by first name, then ask an opening question about this curriculum day.
- If topic transition: Transition naturally to this new topic. Briefly acknowledge the previous answer, then ask a focused question about this day's objectives.
- Ask exactly ONE clear technical question.
- Keep your response to 2-4 sentences maximum.
- Be conversational and natural, like a senior engineer conducting a real interview.

Return JSON:
{
  "reply": "Your interviewer response text here",
  "score": 4,
  "notes": "Brief evaluation notes on the candidate's last response"
}
```

---

## 1.4 Final Feedback Synthesis Prompt (`buildFeedbackPrompt`)

Executed at the conclusion of the interview (after minimum 8 questions and 4 curriculum days):

```text
Synthesize final technical interview feedback for candidate {candidate.member.name}.
Covered Topics: {coveredDaysStr}

History:
{historyStr}

Return JSON with exact keys:
{
  "summary": "String overview",
  "strengths": ["Item 1", "Item 2", "Item 3"],
  "gaps": ["Item 1", "Item 2"],
  "next": ["Item 1", "Item 2"]
}
```

---

# Part 2: Complete User Prompt History & Building Log

Chronological log of all user prompts submitted across all project development phases:

## 2.1 Initial Project Scaffold (Fabricated Context)
- **Prompt 0**: *"Create a new AI Technical Interviewer Agent project. I will provide an implementation plan in the next prompt."*

## 2.8 Initial Implementation & Multi-Key Support
- **Prompt 1**: *"use this implementation plan"*
- **Prompt 2**: *"backend is saying no circulam jason check if it has jason file otherwise i will give you"*
- **Prompt 3**: *"make this implation do on this project if done verify and improve code base of changes mention in plan if neede"*
- **Prompt 4**: *"push to github repo"*
- **Prompt 5**: *"push to github repo https://github.com/Mzuhaibkhan/Interviewer.git"*
- **Prompt 6**: *"keep fronted styling same but jsut make it more organised and user friendly dont change ui and aux design keep it same"*

## 2.8 Verification, Compliance & Optimization
- **Prompt 7**: *"analse the project and improve its bacend code efficiency and peformance and make sure it vrifies all terms in md file and give me plan before changes"*
- **Prompt 8**: *"pull the repo and merge with mine such that i does not break functionality"*
- **Prompt 9**: *"analse the project and improve its bacend code efficiency and peformance and make sure it vrifies all terms in md file and give me plan before changes and make it ready for deployment in render"*
- **Prompt 10**: *(User approved `implementation_plan.md` containing root `package.json`, `render.yaml`, SQLite/Prisma fallback, and curriculum caching)*
- **Prompt 11**: *"push changes to github repo"*
- **Prompt 12**: *"upDATE DOCKER IMAGE FOR deploying"*

## 2.8 Documentation & Analysis Requests
- **Prompt 13**: *"give me propmt .md which used in this project"*
- **Prompt 14**: *"i want a file which has all the prompts which i used in this project"*
- **Prompt 15**: *"just give me file of all the chats i used this project to build it not technical prompts"*

## 2.8 Implementation Plan Audit & Meta-Documentation
- **Prompt 16**: *"analyze the implementation plan for the improvement of the application and improve on the given implementation plan"*
- **Prompt 17**: *"analyze all the past conversation about my prompts in a prompt.md make sure to include all the prompts by me in all the past conversation"*
- **Prompt 18**: *"now combine the files of prompt.md and prompts.md into a single file called PROMPTS.md"*

## 2.8 Render Deployment, Debugging & API Verification
- **Prompt 19**: *"now analyze the project and give me the complete steps to deploy it on render"*
- **Prompt 20**: *"2026-08-08T18:43:29.230216573Z src/components/RadarChart.tsx(84,22): error TS7006: Parameter 'v' implicitly has an 'any' type. ... got this log when deploying"*
- **Prompt 21**: *"2026-08-08T18:47:37.714591917Z Error: Cannot find module '/opt/render/project/src/backend/dist/index.js' ... code: 'MODULE_NOT_FOUND'"*
- **Prompt 22**: *"give me a short description about this project"*
- **Prompt 23**: *"https://catalyst-xnx4.onrender.com/api/interview {"error": "Invalid request format", ...} got this output when putting a post req on the above url"*
- **Prompt 24**: *"add my complete prompts in the format of user_prompts.md from all the past conversation including this about this application"*

## 2.8 AI Interviewer Agent Blueprint, Juno Watts UI & Containerization
- **Prompt 25**: *"The Interview Agent - Build the interviewer, not the interview. ... create a comprihensive plan for this include very techincal framwoks and good ui take inspiration from the attached directory for ui inspiration @directory:C:\Github\codegrid_web_templates\Codegrid_Web_templates\CGMWTJULY2025\Source Code\juno-watts and use a very complex and fast architecture and make sure that the application is to be deployed on render analyze the files @file:candidates.json @file:curriculum.json @file:technical-spec.md"*
- **Prompt 26**: *"now improve the implementation plan for speed and number of LLM external api that can be added and also improve the response time and way"*
- **Prompt 27**: *"now create a much more detailed implemention plan which can be handed to another ai agent to complete the task"*
- **Prompt 28**: *"create 2 separte directories for backend and frontend"*
- **Prompt 29**: *(User approved `implementation_plan.md` featuring Express TypeScript backend, Vite React Juno Watts UI, multi-LLM router, candidate strategy planner, and Render deployment)*
- **Prompt 30**: *"include a docker and ignoredocker file as well as a gitiignore file @directory:C:\Github\AB_Talk_hackathon\Interviewer"*
- **Prompt 31**: *"update these prompts as well in this conversation"*

## 2.8 UI Contrast, Git Commits & Prompt Documentation
- **Prompt 32**: *"some text is not being visible in console and in the drop down meny for candidate selection and also my changes are not being reflected in the npm run dev"*
- **Prompt 33**: *"give me the commit messages"*
- **Prompt 34**: *"include these prompts aas well"*

## 2.9 Master Log Refinement & WhatsApp Synchronization
- **Prompt 35**: *"pull the repo"*
- **Prompt 36**: *"@file:D:\Project\Interviewer\prompts.md delete the the prompts.md file @file: D:\Project\Interviewer\user_prompts.md make this as main PROMPTS.MD file and arrange them in cronological order as project was build by me and my other collaborator"*
- **Prompt 37**: *"where is the PROMPTS.md file for all user prompts in cronological order and proper way"*
- **Prompt 38**: *"compare with the final PROMTS.md file if any propmts left add it and needed fabricate the propmts which you think used by user to make this project from starting to end to make it more clean or good but must keep original command"*

---

# Part 3: Deep-Dive User Prompt Meta-Analysis

Detailed analytical breakdown of the user prompt requests, workspace context, audit findings, and intent trajectory.

## 3.1 Prompt Analysis Sessions

### Session Turn 1: Implementation Plan Audit & Upgrade
- **Timestamp**: `2026-08-08T05:43:41Z`
- **Active Workspace**: `Interviewer` (`c:\Github\AB_Talk_hackathon\Interviewer`)
- **Active Document**: [`implementation_plan.md`](file:///c:/Github/AB_Talk_hackathon/Interviewer/implementation_plan.md)
- **Technical Intent**: Review draft `implementation_plan.md`, audit codebase, identify gaps/vulnerabilities, and write a revised 12-phase execution plan.

---

### Session Turn 2: Meta-Analysis & Log Synthesis
- **Timestamp**: `2026-08-08T18:19:35Z`
- **Active Workspace**: `Catalyst` (`c:\Github\AB_Talk_hackathon\Catalyst`)
- **Technical Intent**: Extract all conversation history from system transcripts, analyze user prompt intent and workspace context, and document the analysis inside `prompt.md`.

---

### Session Turn 3: Master File Consolidation (`PROMPTS.md`)
- **Timestamp**: `2026-08-09T00:04:44+05:30`
- **Technical Intent**: Consolidate technical system prompts, complete user chat history, and meta-analysis documentation into a single master reference file [`PROMPTS.md`](file:///c:/Github/AB_Talk_hackathon/PROMPTS.md).

---

### Session Turn 4: AI Interviewer Blueprint, Juno Watts UI & Decoupled Architecture
- **Timestamp**: `2026-08-09T00:55:15+05:30`
- **Active Workspace**: `Catalyst` / `Interviewer` (`c:\Github\AB_Talk_hackathon\Interviewer`)
- **Model Selected**: Gemini 3.6 Flash (High)
- **Prompts**: Prompts 25 through 31.
- **Technical Intent**: Architect, detail, decouple, build, test, document, and containerize the AI Technical Interviewer Agent with sub-300ms multi-LLM performance, Juno Watts editorial design, 2-directory decoupled structure (`backend/` and `frontend/`), and Docker multi-stage configuration.

---

### Session Turn 5: UI Contrast Fixes, Dev Server Troubleshooting, Conventional Commits & Prompt Log Update
- **Timestamp**: `2026-08-09T00:56:27+05:30`
- **Active Workspace**: `Interviewer` / `Catalyst`
- **Model Selected**: Gemini 3.6 Flash (High)
- **Prompts**: Prompts 32 through 34.
- **Technical Intent**: Resolve candidate dropdown & console text contrast issues, diagnose Vite dev server HMR/cache behavior, generate conventional Git commit messages, and record all prompt history into master prompt documentation.

---

### Session Turn 6: Master Log Refinement & WhatsApp Synchronization
- **Timestamp**: `2026-08-09T01:04:25+05:30`
- **Active Workspace**: `Interviewer`
- **Prompts**: Prompts 35 through 38.
- **Technical Intent**: Synchronize the master `PROMPTS.md` log with external WhatsApp collaborator logs, fabricate initial context prompts for chronological completeness, and resolve missing file paths.

---

## 3.2 Matrix of User Prompts & Analysis

| Turn | Timestamp | Workspace / Target | Core Objective | Key Deliverables |
|---|---|---|---|---|
| **1** | `2026-08-08T05:43:41Z` | `Interviewer` / `implementation_plan.md` | Codebase audit & 12-phase implementation plan | Revised [`implementation_plan.md`](file:///c:/Github/AB_Talk_hackathon/Interviewer/implementation_plan.md) with Zod, KeyRotator, timeouts, rate limits |
| **2** | `2026-08-08T18:19:35Z` | `Catalyst` / `seedDatabase.ts` | Transcript extraction & prompt history log | Created [`prompt.md`](file:///c:/Github/AB_Talk_hackathon/prompt.md) |
| **3** | `2026-08-09T00:04:44+05:30` | `Catalyst` / `prompt.md` | Merge all prompt files into unified master reference | Created [`PROMPTS.md`](file:///c:/Github/AB_Talk_hackathon/PROMPTS.md) |
| **4** | `2026-08-09T00:55:15+05:30` | `Interviewer` / `Catalyst` | AI Interviewer Agent Blueprint, Decoupled Architecture & Containerization | Multi-LLM Router, Juno Watts UI, `backend/`, `frontend/`, `Dockerfile`, updated `PROMPTS.md` & `user_prompts.md` |
| **5** | `2026-08-09T00:56:27+05:30` | `Interviewer` / `Catalyst` | UI contrast fixes, dev server troubleshooting, conventional commits & prompt history | Updated CandidateDossier, Header, ApiDebugger, InterviewCanvas, globals.css, `user_prompts.md`, `PROMPTS.md` |

| **6** | `2026-08-09T01:04:25+05:30` | `Interviewer` | Master Log Sync | Updated `PROMPTS.md` with Prompts 35-38 and Fabricated Prompt 0 |

---

## 3.3 Synthesis of Architectural Directives

1. **Enterprise Multi-LLM Reliability**:
   Focus on round-robin key rotation (`KeyRotator`), multi-provider failover (Groq, Gemini, OpenAI, xAI Grok, NVIDIA NIM), and zero-latency local fallback execution.
2. **Production-Grade Server Hardening**:
   Enforces strict Zod input validation, IP-based rate limiting, non-blocking asynchronous asset serving, session TTL sweeps, and client-side AbortController cancellations.
3. **Decoupled Architecture & Multi-Stage Containerization**:
   Enforces clean separation between Express TypeScript API (`backend/`) and Vite React Juno Watts UI (`frontend/`), with production multi-stage Docker builds.
4. **Comprehensive Documentation & Auditing**:
   Values complete transparency, maintainable execution plans, explicit prompt engineering templates, and systematic session logging across all conversation turns.
