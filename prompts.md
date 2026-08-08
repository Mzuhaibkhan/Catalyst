# Master Prompt Documentation & Analysis (`PROMPTS.md`)

This master document consolidates all prompt documentation for the **AI Technical Interviewer Agent / Catalyst** application into a single unified reference. It contains three main sections:

1. **Part 1: Technical System Prompts & LLM Templates** — The prompt engineering, system instructions, dynamic turn generators, and feedback synthesis prompts used by the AI agent engine.
2. **Part 2: Complete User Prompt Log** — Chronological history of user prompts, instructions, and feature requests submitted across the project build phases.
3. **Part 3: Deep-Dive User Prompt Analysis & Meta-Analysis** — In-depth technical analysis of user directives, workspace metadata, prompt intents, comparative matrices, and engineering pattern synthesis.

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
{candidateContext}

Interview Statistics:
- Total interview turns: {history.length}
- Curriculum days covered: {coveredDays.map(d => `Day ${d.day}: ${d.title}`).join(', ')}
- Average evaluation score: {avgScore}/5

Full Interview Transcript:
{history.map(t => `${t.speaker.toUpperCase()}: ${t.text}`).join('\n')}

Instructions:
- Synthesize comprehensive, actionable feedback based on the FULL transcript above.
- Reference specific responses and topics from the conversation.
- Be honest but constructive. Highlight both strengths and areas for growth.
- For "next" steps, provide concrete, actionable learning recommendations.

Return JSON with these exact keys:
{
  "summary": "A 2-3 sentence executive overview of the candidate's performance",
  "strengths": ["Specific strength 1 with evidence", "Specific strength 2 with evidence", "Specific strength 3"],
  "gaps": ["Specific gap 1 with context", "Specific gap 2 with context"],
  "next": ["Actionable recommendation 1", "Actionable recommendation 2", "Actionable recommendation 3"]
}
```

---

# Part 2: Complete User Prompt History & Building Log

Chronological record of all user prompts, instructions, and feature requests provided to the AI assistant to build, refactor, optimize, verify, document, and deploy the application.

## 2.1 Initial Implementation & Architecture
- **Prompt 1**: *"use this implementation plan"*
- **Prompt 2**: *"backend is saying no circulam jason check if it has jason file otherwise i will give you"*
- **Prompt 3**: *"make this implation do on this project if done verify and improve code base of changes mention in plan if neede"* *(Attached implementation plan covering round-robin key rotation, multi-provider failover, session TTL, and AbortController)*
- **Prompt 4**: *"push to github repo"*
- **Prompt 5**: *"push to github repo https://github.com/Mzuhaibkhan/Interviewer.git"*
- **Prompt 6**: *"keep fronted styling same but jsut make it more organised and user friendly dont change ui and aux design keep it same"*

## 2.2 Verification, Compliance & Deployment
- **Prompt 7**: *"analse the project and improve its bacend code efficiency and peformance and make sure it vrifies all terms in md file and give me plan before changes"*
- **Prompt 8**: *"pull the repo and merge with mine such that i does not break functionality"*
- **Prompt 9**: *"analse the project and improve its bacend code efficiency and peformance and make sure it vrifies all terms in md file and give me plan before changes and make it ready for deployment in render"*
- **Prompt 10**: *(Approval of implementation plan containing root `package.json`, `render.yaml`, SQLite/Prisma fallback, and curriculum caching)*
- **Prompt 11**: *"push changes to github repo"*
- **Prompt 12**: *"upDATE DOCKER IMAGE FOR deploying"*

## 2.3 Documentation & Analysis Requests
- **Prompt 13**: *"give me propmt .md which used in this project"*
- **Prompt 14**: *"i want a file which has all the prompts which i used in this project"*
- **Prompt 15**: *"just give me file of all the chats i used this project to build it not technical prompts"*
- **Prompt 16**: *"analyze the implementation plan for the improvement of the application and improve on the given implementation plan"*
- **Prompt 17**: *"analyze all the past conversation about my prompts in a prompt.md make sure to include all the prompts by me in all the past conversation"*
- **Prompt 18**: *"now combine the files of prompt.md and prompts.md into a single file called PROMPTS.md"*

---

# Part 3: Deep-Dive User Prompt Meta-Analysis

Detailed analytical breakdown of the user prompt requests, workspace context, audit findings, and intent trajectory.

## 3.1 Prompt Analysis Sessions

### Session Turn 1: Implementation Plan Audit & Upgrade
- **Timestamp**: `2026-08-08T05:43:41Z`
- **Active Workspace**: `Interviewer` (`c:\Github\AB_Talk_hackathon\Interviewer`)
- **Active Document**: [`implementation_plan.md`](file:///c:/Github/AB_Talk_hackathon/Interviewer/implementation_plan.md)
- **Model Selected**: Claude 3.5 Sonnet / Opus (Thinking)
- **Prompt Text**:
  > `analyze the implementation plan for the improvement of the application and improve on the given implementation plan`
- **Technical Intent**: Review draft `implementation_plan.md`, audit codebase, identify gaps/vulnerabilities, and write a revised 12-phase execution plan.
- **Audit Findings Discovered**:
  1. Incorrect file paths (`D:/Project/...` instead of actual repo path).
  2. Missing input validation (`zod` installed but unused).
  3. Incomplete timeouts (feedback generation omitted).
  4. Missing rate limiting against API quota exhaustion.
  5. Synchronous `fs.existsSync` on every GET request blocking event loop.
  6. Docker path resolution fragility for `curriculum.json`.
- **Deliverable Produced**: 12-phase revised `implementation_plan.md` with key rotator architecture, Zod validation, rate limiting, and verification steps.

---

### Session Turn 2: Meta-Analysis & Log Synthesis
- **Timestamp**: `2026-08-08T18:19:35Z`
- **Active Workspace**: `Catalyst` (`c:\Github\AB_Talk_hackathon\Catalyst`)
- **Active Document**: [`seedDatabase.ts`](file:///c:/Github/AB_Talk_hackathon/Catalyst/backend/scripts/seedDatabase.ts)
- **Model Selected**: Gemini 3.6 Flash (High)
- **Prompt Text**:
  > `analyze all the past conversation about my prompts in a prompt.md make sure to include all the prompts by me in all the past conversation`
- **Technical Intent**: Extract all conversation history from system transcripts, analyze user prompt intent and workspace context, and document the analysis inside `prompt.md`.
- **Deliverable Produced**: Initial [`prompt.md`](file:///c:/Github/AB_Talk_hackathon/prompt.md) log document.

---

### Session Turn 3: Master File Consolidation (`PROMPTS.md`)
- **Timestamp**: `2026-08-09T00:04:44+05:30`
- **Active Workspace**: `Catalyst` (`c:\Github\AB_Talk_hackathon\Catalyst`)
- **Active Document**: [`prompt.md`](file:///c:/Github/AB_Talk_hackathon/Catalyst/prompt.md)
- **Model Selected**: Gemini 3.6 Flash (High)
- **Prompt Text**:
  > `now combine the files of prompt.md and prompts.md into a single file called PROMPTS.md`
- **Technical Intent**: Consolidate technical system prompts, complete user chat history, and meta-analysis documentation into a single master reference file [`PROMPTS.md`](file:///c:/Github/AB_Talk_hackathon/PROMPTS.md).

---

## 3.2 Matrix of User Prompts & Analysis

| Turn | Timestamp | Workspace / Target | Core Objective | Key Deliverables |
|---|---|---|---|---|
| **1** | `2026-08-08T05:43:41Z` | `Interviewer` / `implementation_plan.md` | Codebase audit & 12-phase implementation plan | Revised [`implementation_plan.md`](file:///c:/Github/AB_Talk_hackathon/Interviewer/implementation_plan.md) with Zod, KeyRotator, timeouts, rate limits |
| **2** | `2026-08-08T18:19:35Z` | `Catalyst` / `seedDatabase.ts` | Transcript extraction & prompt history log | Created [`prompt.md`](file:///c:/Github/AB_Talk_hackathon/prompt.md) |
| **3** | `2026-08-09T00:04:44+05:30` | `Catalyst` / `prompt.md` | Merge all prompt files into unified master reference | Created [`PROMPTS.md`](file:///c:/Github/AB_Talk_hackathon/PROMPTS.md) |

---

## 3.3 Synthesis of Architectural Directives

1. **Enterprise Multi-LLM Reliability**:
   Focus on round-robin key rotation (`KeyRotator`), multi-provider failover (Groq, Gemini, OpenAI, xAI Grok, NVIDIA NIM), and zero-latency local fallback execution.
2. **Production-Grade Server Hardening**:
   Enforces strict Zod input validation, IP-based rate limiting, non-blocking asynchronous asset serving, session TTL sweeps, and client-side AbortController cancellations.
3. **Comprehensive Documentation & Auditing**:
   Values complete transparency, maintainable execution plans, explicit prompt engineering templates, and systematic session logging.
