import { Request, Response } from 'express';
import { sessionStore } from '../services/sessionStore';
import { processInterviewTurn } from '../services/interviewerAgent';
import { llmRouter } from '../providers/llmRouter';

import { z } from 'zod';

const candidateSchema = z.object({
  member: z.object({
    id: z.string(),
    name: z.string(),
    jobRole: z.string(),
    yearsExperience: z.number(),
    education: z.string(),
    status: z.string(),
  }),
  missions: z.array(z.object({
    day: z.number(),
    title: z.string(),
    passed: z.boolean().optional(),
    attempts: z.number().optional(),
    skipped: z.boolean().optional(),
  })),
  signals: z.object({
    commitDays: z.number(),
    missionsCompleted: z.number(),
    missionsFirstTry: z.number(),
  }),
});

const interviewRequestSchema = z.object({
  sessionId: z.string().min(1),
  candidate: candidateSchema.optional(),
  message: z.string().max(5000).optional(),
  provider: z.string().optional(),
});

export async function handleInterviewRequest(req: Request, res: Response): Promise<void> {
  try {
    const parseResult = interviewRequestSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({ error: 'Invalid request format', details: parseResult.error.errors });
      return;
    }
    const { sessionId, candidate, message, provider } = parseResult.data;

    // 1. Start Interview or Retrieve Existing Session
    let session = sessionStore.getSession(sessionId);

    if (!session) {
      if (!candidate) {
        res.status(400).json({
          error: `Session ${sessionId} does not exist. Provide 'candidate' object in initial request to start session.`
        });
        return;
      }
      session = sessionStore.getOrCreateSession(sessionId, candidate);
    }

    // 2. Process Turn or Complete Session
    const turnResponse = await processInterviewTurn(session, message, provider);

    // Update Session Store state
    sessionStore.updateSession(session);

    // 3. Return JSON response strictly compliant with technical specification
    res.json(turnResponse);
  } catch (error: any) {
    console.error('Error handling /api/interview request:', error);
    res.status(500).json({
      reply: 'An unexpected technical issue occurred during the interview turn.',
      done: false,
      error: error.message || 'Internal Server Error'
    });
  }
}

export function handleHealthCheck(req: Request, res: Response): void {
  const providerDetails = llmRouter.getProviderDetails();
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    availableProviders: llmRouter.getAvailableProviders(),
    providerDetails,
    sessions: {
      active: sessionStore.getSessionCount(),
    }
  });
}
