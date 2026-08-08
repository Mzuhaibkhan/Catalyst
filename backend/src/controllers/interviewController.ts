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
    let session = await sessionStore.getSession(sessionId);

    if (!session) {
      if (!candidate) {
        res.status(400).json({
          error: `Session ${sessionId} does not exist. Provide 'candidate' object in initial request to start session.`
        });
        return;
      }
      session = await sessionStore.getOrCreateSession(sessionId, candidate);
    }

    // 2. Process Turn or Complete Session
    const turnResponse = await processInterviewTurn(session, message, provider);

    // Update Session Store state
    await sessionStore.updateSession(session);

    // 3. Return JSON response strictly compliant with technical specification
    res.json(turnResponse);
  } catch (error: any) {
    console.error('Error handling /api/interview request:', error);
    
    // Return generic error to client — never leak internal details
    const isRateLimit = error.status === 429 || String(error.message).includes('429');
    res.status(isRateLimit ? 429 : 500).json({
      reply: isRateLimit
        ? 'The interview system is currently experiencing high demand. Please try again in a moment.'
        : 'An unexpected technical issue occurred during the interview turn. Please try again.',
      done: false,
      error: isRateLimit ? 'Rate limit exceeded' : 'Internal server error'
    });
  }
}

export async function handleHealthCheck(req: Request, res: Response): Promise<void> {
  const providerDetails = llmRouter.getProviderDetails();
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    availableProviders: llmRouter.getAvailableProviders(),
    providerDetails,
    sessions: {
      active: await sessionStore.getSessionCount(),
    }
  });
}
