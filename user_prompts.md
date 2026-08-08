# Complete User Prompts & Chat History (`user_prompts.md`)

This document contains the complete, chronological record of all user prompts, instructions, error reports, and feature requests provided to the AI assistant to build, refactor, optimize, verify, document, debug, and deploy the **AI Technical Interviewer Agent / Catalyst** application.

---

## 1. Initial Implementation & Multi-Key Support

### Prompt 1: Initial Setup & Implementation Plan
> "use this implementation plan"

### Prompt 2: Curriculum File Verification
> "backend is saying no circulam jason check if it has jason file otherwise i will give you"

### Prompt 3: Architecture & Multi-Key Refactoring
> "make this implation do on this project if done verify and improve code base of changes mention in plan if neede"
> *(Attached `implementation_plan.md` covering round-robin key rotation, multi-provider failover for Gemini/Groq/OpenAI/Grok/NVIDIA, session TTL cleanup, history trimming, and frontend AbortController).*

### Prompt 4: GitHub Push Request
> "push to github repo"

### Prompt 5: Explicit GitHub Repository Target
> "push to github repo https://github.com/Mzuhaibkhan/Interviewer.git"

### Prompt 6: Frontend Refactoring & UI Organization
> "keep fronted styling same but jsut make it more organised and user friendly dont change ui and aux design keep it same"

---

## 2. Verification, Evaluator Compliance & Optimization

### Prompt 7: Project Compliance Analysis
> "analse the project and improve its bacend code efficiency and peformance and make sure it vrifies all terms in md file and give me plan before changes"
> *(Referenced `project.md` evaluator compliance checklist).*

### Prompt 8: Git Repo Sync & Merge
> "pull the repo and merge with mine such that i does not break functionality"

### Prompt 9: Deployment Optimization & Render Setup
> "analse the project and improve its bacend code efficiency and peformance and make sure it vrifies all terms in md file and give me plan before changes and make it ready for deployment in render"

### Prompt 10: Implementation Plan Approval
> *(User approved `implementation_plan.md` containing root `package.json`, `render.yaml`, SQLite/Prisma fallback, and curriculum caching).*

### Prompt 11: Repository Push Request
> "push changes to github repo"

### Prompt 12: Docker Image Deployment Update
> "upDATE DOCKER IMAGE FOR deploying"

---

## 3. Project Documentation Requests

### Prompt 13: Prompt Documentation Creation
> "give me propmt .md which used in this project"

### Prompt 14: Prompt Documentation Clarification
> "i want a file which has all the prompts which i used in this project"

### Prompt 15: Chat History File Request
> "just give me file of all the chats i used this project to build it not technical prompts"

---

## 4. Implementation Plan Audit & Meta-Documentation

### Prompt 16: Implementation Plan Audit & Upgrade
> "analyze the implementation plan for the improvement of the application and improve on the given implementation plan"

### Prompt 17: Past Prompts Analysis Request
> "analyze all the past conversation about my prompts in a prompt.md make sure to include all the prompts by me in all the past conversation"

### Prompt 18: Prompt Files Consolidation Request
> "now combine the files of prompt.md and prompts.md into a single file called PROMPTS.md"

---

## 5. Render Deployment, Debugging & Application Overview

### Prompt 19: Render Deployment Steps Request
> "now analyze the project and give me the complete steps to deploy it on render"

### Prompt 20: TypeScript Render Build Error Debugging
> "2026-08-08T18:43:29.230216573Z src/components/RadarChart.tsx(84,22): error TS7006: Parameter 'v' implicitly has an 'any' type.
> 2026-08-08T18:43:29.2303245Z src/components/Toast.tsx(1,46): error TS7016: Could not find a declaration file for module 'react'.
> ... got this log when deploying"

### Prompt 21: Node Module Runtime Error Debugging
> "2026-08-08T18:47:37.714591917Z Error: Cannot find module '/opt/render/project/src/backend/dist/index.js'
> ... code: 'MODULE_NOT_FOUND'"

### Prompt 22: Project Description Request
> "give me a short description about this project"

### Prompt 23: API Verification & Zod Schema Output Debugging
> "https://catalyst-xnx4.onrender.com/api/interview
> {
>     "error": "Invalid request format",
>     "details": [
>         {
>             "code": "invalid_type",
>             "expected": "string",
>             "received": "undefined",
>             "path": [
>                 "sessionId"
>             ],
>             "message": "Required"
>         }
>     ]
> }
> got this output when putting a post req on the above url"

### Prompt 24: Complete User Prompts Update Request
> "add my complete prompts in the format of user_prompts.md from all the past conversation including this about this application"
