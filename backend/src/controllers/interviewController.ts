import { Request, Response } from 'express';
import { sessionStore } from '../services/sessionStore';
import { processInterviewTurn } from '../services/interviewerAgent';
import { llmRouter } from '../providers/llmRouter';

export async function handleInterviewRequest(req: Request, res: Response): Promise<void> {
  try {
    const { sessionId, candidate, message, provider } = req.body;

    if (!sessionId) {
      res.status(400).json({ error: 'sessionId is required in request body.' });
      return;
    }

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
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    availableProviders: llmRouter.getAvailableProviders()
  });
}
