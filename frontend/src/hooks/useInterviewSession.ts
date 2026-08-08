import { useState } from 'react';
import { sendInterviewRequest, abortCurrentRequest, CandidateProfile, InterviewFeedback } from '../services/api';
import { TurnMessage } from '../components/InterviewCanvas';
import { showToast } from '../components/Toast';

export function useInterviewSession(selectedCandidate: CandidateProfile, activeProvider: string) {
  const [sessionId, setSessionId] = useState<string>(`session-${Date.now()}`);
  const [history, setHistory] = useState<TurnMessage[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isStarted, setIsStarted] = useState<boolean>(false);
  const [isComplete, setIsComplete] = useState<boolean>(false);
  
  const [questionCount, setQuestionCount] = useState<number>(0);
  const [coveredDaysCount, setCoveredDaysCount] = useState<number>(0);
  const [feedback, setFeedback] = useState<InterviewFeedback | null>(null);
  
  const [latencyMs, setLatencyMs] = useState<number | null>(null);
  const [lastPayload, setLastPayload] = useState<any>(null);
  const [lastResponse, setLastResponse] = useState<any>(null);

  const startInterview = async () => {
    if (isLoading) return;
    setIsLoading(true);
    const newSessionId = `session-${Date.now()}`;
    setSessionId(newSessionId);

    const payload = {
      sessionId: newSessionId,
      candidate: selectedCandidate,
      provider: activeProvider !== 'auto' ? activeProvider : undefined
    };

    setLastPayload(payload);

    try {
      const res = await sendInterviewRequest(payload);
      setLastResponse(res);
      setIsStarted(true);

      if (res.metrics) {
        setLatencyMs(res.metrics.latencyMs);
        setQuestionCount(res.metrics.questionCount);
        setCoveredDaysCount(res.metrics.coveredDaysCount);
      }

      setHistory([{
        speaker: 'interviewer',
        text: res.reply,
        timestamp: new Date().toLocaleTimeString(),
        provider: res.metrics?.provider,
        latencyMs: res.metrics?.latencyMs,
        evaluation: res.evaluation
      }]);

      showToast('Interview session initialized successfully', 'success');
    } catch (err: any) {
      showToast(`Error starting interview: ${err.message}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const sendAnswer = async (answerText: string) => {
    if (isLoading) return;
    setIsLoading(true);

    const userMsg: TurnMessage = {
      speaker: 'candidate',
      text: answerText,
      timestamp: new Date().toLocaleTimeString()
    };

    setHistory((prev: TurnMessage[]) => [...prev, userMsg]);

    const payload = {
      sessionId,
      message: answerText,
      provider: activeProvider !== 'auto' ? activeProvider : undefined
    };

    setLastPayload(payload);

    try {
      const res = await sendInterviewRequest(payload);
      setLastResponse(res);

      if (res.metrics) {
        setLatencyMs(res.metrics.latencyMs);
        setQuestionCount(res.metrics.questionCount);
        setCoveredDaysCount(res.metrics.coveredDaysCount);
      }

      const interviewerMsg: TurnMessage = {
        speaker: 'interviewer',
        text: res.reply,
        timestamp: new Date().toLocaleTimeString(),
        provider: res.metrics?.provider,
        latencyMs: res.metrics?.latencyMs,
        evaluation: res.evaluation
      };

      setHistory((prev: TurnMessage[]) => [...prev, interviewerMsg]);

      if (res.done && res.feedback) {
        setIsComplete(true);
        setFeedback(res.feedback);
        showToast('Interview complete — evaluation ready', 'info');
      }
    } catch (err: any) {
      showToast(`Error sending answer: ${err.message}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const resetInterview = () => {
    abortCurrentRequest();
    setIsStarted(false);
    setIsComplete(false);
    setHistory([]);
    setQuestionCount(0);
    setCoveredDaysCount(0);
    setFeedback(null);
    setLatencyMs(null);
    showToast('Session reset. Select a candidate and start a new interview.', 'info');
  };

  return {
    sessionId,
    history,
    isLoading,
    isStarted,
    isComplete,
    questionCount,
    coveredDaysCount,
    feedback,
    latencyMs,
    lastPayload,
    lastResponse,
    startInterview,
    sendAnswer,
    resetInterview
  };
}
