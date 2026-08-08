import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { CandidateDossier } from './components/CandidateDossier';
import { InterviewCanvas, TurnMessage } from './components/InterviewCanvas';
import { FeedbackDashboard } from './components/FeedbackDashboard';
import { ApiDebugger } from './components/ApiDebugger';
import { sendInterviewRequest, checkBackendHealth, CandidateProfile, InterviewFeedback } from './services/api';
import candidatesData from '../../candidates.json';

export const App: React.FC = () => {
  const allCandidates = candidatesData.candidates as CandidateProfile[];
  const [selectedCandidate, setSelectedCandidate] = useState<CandidateProfile>(allCandidates[0]);
  const [sessionId, setSessionId] = useState<string>(`session-${Date.now()}`);

  const [activeProvider, setActiveProvider] = useState<string>('auto');
  const [latencyMs, setLatencyMs] = useState<number | null>(null);
  const [serverStatus, setServerStatus] = useState<string>('checking');

  const [history, setHistory] = useState<TurnMessage[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isStarted, setIsStarted] = useState<boolean>(false);
  const [isComplete, setIsComplete] = useState<boolean>(false);

  const [questionCount, setQuestionCount] = useState<number>(0);
  const [coveredDaysCount, setCoveredDaysCount] = useState<number>(0);
  const [feedback, setFeedback] = useState<InterviewFeedback | null>(null);

  const [lastPayload, setLastPayload] = useState<any>(null);
  const [lastResponse, setLastResponse] = useState<any>(null);

  // Check health on load
  useEffect(() => {
    checkBackendHealth().then(res => {
      setServerStatus(res.status);
    });
  }, []);

  const handleStartInterview = async () => {
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
        latencyMs: res.metrics?.latencyMs
      }]);
    } catch (err: any) {
      alert(`Error starting interview: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendAnswer = async (answerText: string) => {
    setIsLoading(true);

    // Add candidate response locally immediately
    const userMsg: TurnMessage = {
      speaker: 'candidate',
      text: answerText,
      timestamp: new Date().toLocaleTimeString()
    };

    setHistory(prev => [...prev, userMsg]);

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
        latencyMs: res.metrics?.latencyMs
      };

      setHistory(prev => [...prev, interviewerMsg]);

      if (res.done && res.feedback) {
        setIsComplete(true);
        setFeedback(res.feedback);
      }
    } catch (err: any) {
      alert(`Error sending answer: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetInterview = () => {
    setIsStarted(false);
    setIsComplete(false);
    setHistory([]);
    setQuestionCount(0);
    setCoveredDaysCount(0);
    setFeedback(null);
    setLatencyMs(null);
  };

  return (
    <div style={{ maxWidth: '1800px', margin: '0 auto', padding: '1.5rem 2rem' }}>
      <Header
        activeProvider={activeProvider}
        onProviderChange={setActiveProvider}
        latencyMs={latencyMs}
        serverStatus={serverStatus}
      />

      <div style={{ display: 'grid', gridTemplateColumns: '380px 1fr', gap: '1.5rem' }}>
        {/* Left Panel: Candidate Dossier & Spec Progress */}
        <CandidateDossier
          selectedCandidate={selectedCandidate}
          onSelectCandidate={setSelectedCandidate}
          questionCount={questionCount}
          coveredDaysCount={coveredDaysCount}
          isInterviewStarted={isStarted}
        />

        {/* Right Panel: Interactive Canvas or Final Feedback */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {isComplete && feedback ? (
            <FeedbackDashboard
              feedback={feedback}
              candidateName={selectedCandidate.member.name}
            />
          ) : (
            <InterviewCanvas
              history={history}
              isLoading={isLoading}
              isComplete={isComplete}
              isStarted={isStarted}
              onStartInterview={handleStartInterview}
              onSendAnswer={handleSendAnswer}
              onResetInterview={handleResetInterview}
            />
          )}
        </div>
      </div>

      {/* Technical REST API Payload Inspector */}
      <ApiDebugger lastPayload={lastPayload} lastResponse={lastResponse} />
    </div>
  );
};
