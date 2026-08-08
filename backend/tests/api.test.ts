import { sessionStore } from '../src/services/sessionStore';
import { processInterviewTurn } from '../src/services/interviewerAgent';
import candidatesData from '../../Interviewer/candidates.json';

async function runEndToEndTest() {
  console.log('🧪 Starting AI Technical Interviewer E2E Test Suite...\n');

  const candidates = candidatesData.candidates;
  console.log(`Found ${candidates.length} candidate profiles in candidates.json.`);

  for (const candidate of candidates) {
    const sessionId = `test-session-${candidate.member.id}-${Date.now()}`;
    console.log(`\n--------------------------------------------------`);
    console.log(`Testing Candidate: ${candidate.member.name} (${candidate.member.jobRole})`);
    console.log(`Session ID: ${sessionId}`);

    // 1. Initialize session
    const session = sessionStore.getOrCreateSession(sessionId, candidate as any);
    console.log(`Target Curriculum Days planned: ${session.targetDays.join(', ')}`);

    let done = false;
    let turnCount = 0;

    // Turn 1: Start request (no candidate message)
    let res = await processInterviewTurn(session);
    console.log(`\nTurn 1 (Interviewer Start): "${res.reply.substring(0, 90)}..."`);
    turnCount++;

    // Subsequent turns: Simulate candidate technical answers
    const mockAnswers = [
      "I implemented vector embeddings using Qdrant and SentenceTransformers, optimizing cosine similarity search with HNSW indexing for sub-10ms retrieval latency.",
      "For prompt engineering, I used structured outputs with JSON schema enforcement and few-shot reasoning prompts to prevent hallucinations.",
      "Our chatbot architecture used FastAPI with async streaming responses via Server-Sent Events to maintain real-time responsiveness.",
      "In our agentic pipeline, we implemented Model Context Protocol (MCP) tools allowing agents to query live vector stores and execute code securely.",
      "We deployed our pipeline using Docker containers on Kubernetes with Prometheus monitoring and structured logging for observability.",
      "For evaluation, we measured precision@k and MRR across test queries to continuously benchmark retriever accuracy.",
      "In the capstone demo, we integrated tool-calling agents with fallback logic to handle external API failures gracefully."
    ];

    for (const answer of mockAnswers) {
      if (done) break;
      turnCount++;
      console.log(`Turn ${turnCount} (Candidate): "${answer.substring(0, 60)}..."`);
      res = await processInterviewTurn(session, answer);
      console.log(`Turn ${turnCount} (Interviewer): "${res.reply.substring(0, 90)}..."`);
      done = res.done;
    }

    // Assertions
    console.log(`\nInterview Completed Status: ${res.done}`);
    console.log(`Total Interviewer Questions Asked: ${session.questionCount}`);
    console.log(`Unique Curriculum Days Covered (${session.coveredDays.size}): ${Array.from(session.coveredDays).join(', ')}`);

    if (!res.done || !res.feedback) {
      throw new Error(`Test Failed: Interview did not produce done: true and structured feedback!`);
    }

    if (session.questionCount < 8) {
      throw new Error(`Test Failed: Expected >= 8 questions, got ${session.questionCount}`);
    }

    if (session.coveredDays.size < 4) {
      throw new Error(`Test Failed: Expected >= 4 covered days, got ${session.coveredDays.size}`);
    }

    console.log(`Feedback Summary: "${res.feedback.summary}"`);
    console.log(`Strengths (${res.feedback.strengths.length}): ${res.feedback.strengths.join(' | ')}`);
    console.log(`Gaps (${res.feedback.gaps.length}): ${res.feedback.gaps.join(' | ')}`);
    console.log(`Next Steps (${res.feedback.next.length}): ${res.feedback.next.join(' | ')}`);
    console.log(`✅ Candidate ${candidate.member.name} Test Passed!`);
  }

  console.log(`\n🎉 ALL E2E API VERIFICATION TESTS PASSED SUCCESSFULLY!`);
}

runEndToEndTest().catch(err => {
  console.error('❌ E2E Test Suite Error:', err);
  process.exit(1);
});
