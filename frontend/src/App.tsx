import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { LandingPage } from './components/LandingPage';
import { Footer } from './components/Footer';
import { PrivacyPolicyModal } from './components/PrivacyPolicyModal';
import { CandidateDossier } from './components/CandidateDossier';
import { InterviewCanvas, TurnMessage } from './components/InterviewCanvas';
import { FeedbackDashboard } from './components/FeedbackDashboard';
import { ApiDebugger } from './components/ApiDebugger';
import { ToastContainer, showToast } from './components/Toast';
import { ErrorBoundary } from './components/ErrorBoundary';
import { sendInterviewRequest, checkBackendHealth, CandidateProfile, InterviewFeedback } from './services/api';
import candidatesData from '../../candidates.json';

const AppContent: React.FC = () => {
  const allCandidates = candidatesData.candidates as CandidateProfile[];
  const [activeView, setActiveView] = useState<'landing' | 'console'>('landing');
  const [isPrivacyOpen, setIsPrivacyOpen] = useState<boolean>(false);

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
      if (res.status === 'ok') {
        showToast(`Backend online — ${res.availableProviders.length} LLM provider(s) available`, 'success');
      } else {
        showToast('Backend is offline. Make sure the server is running on port 3000.', 'error');
      }
    });
  }, []);

  // Keyboard shortcut: Ctrl+Enter to start interview
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 'Enter' && !isStarted && !isLoading) {
        if (activeView === 'landing') {
          setActiveView('console');
        }
        handleStartInterview();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isStarted, isLoading, selectedCandidate, activeProvider, activeView]);

  const handleStartConsole = (candidateName?: string) => {
    if (candidateName) {
      const found = allCandidates.find(c => c.member.name.toLowerCase().includes(candidateName.toLowerCase()));
      if (found) {
        setSelectedCandidate(found);
      }
    }
    setActiveView('console');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

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

  const handleSendAnswer = async (answerText: string) => {
    setIsLoading(true);

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
        latencyMs: res.metrics?.latencyMs,
        evaluation: res.evaluation
      };

      setHistory(prev => [...prev, interviewerMsg]);

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

  const handleResetInterview = () => {
    setIsStarted(false);
    setIsComplete(false);
    setHistory([]);
    setQuestionCount(0);
    setCoveredDaysCount(0);
    setFeedback(null);
    setLatencyMs(null);
    showToast('Session reset. Select a candidate and start a new interview.', 'info');
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--base-100)' }}>
      
      {/* Shell Container */}
      <div style={{ maxWidth: '1800px', width: '100%', margin: '0 auto', padding: '1.5rem 2rem 0 2rem', flex: 1 }}>
        <Header
          activeView={activeView}
          onViewChange={setActiveView}
          activeProvider={activeProvider}
          onProviderChange={setActiveProvider}
          latencyMs={latencyMs}
          serverStatus={serverStatus}
          onOpenPrivacy={() => setIsPrivacyOpen(true)}
        />

        {activeView === 'landing' ? (
          <LandingPage
            onStartConsole={handleStartConsole}
            onOpenPrivacy={() => setIsPrivacyOpen(true)}
            serverStatus={serverStatus}
          />
        ) : (
          <div>
            <div className="main-grid" style={{ display: 'grid', gridTemplateColumns: '380px 1fr', gap: '1.5rem' }}>
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
                    history={history}
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
        )}
      </div>

      {/* Juno Watts Styled Footer */}
      <Footer
        onOpenPrivacy={() => setIsPrivacyOpen(true)}
        onNavigateConsole={() => { setActiveView('console'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
        serverStatus={serverStatus}
      />

      {/* Privacy Policy Modal */}
      <PrivacyPolicyModal
        isOpen={isPrivacyOpen}
        onClose={() => setIsPrivacyOpen(false)}
      />

    </div>
  );
};

export const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <ToastContainer />
      <AppContent />
    </ErrorBoundary>
  );
};
