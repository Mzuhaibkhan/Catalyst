import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { LandingPage } from './components/LandingPage';
import { Footer } from './components/Footer';
import { PrivacyPolicyModal } from './components/PrivacyPolicyModal';
import { CandidateDossier } from './components/CandidateDossier';
import { InterviewCanvas } from './components/InterviewCanvas';
import { FeedbackDashboard } from './components/FeedbackDashboard';
import { ApiDebugger } from './components/ApiDebugger';
import { ToastContainer } from './components/Toast';
import { ErrorBoundary } from './components/ErrorBoundary';
import { useSmoothScroll } from './hooks/useSmoothScroll';
import { CandidateProfile } from './services/api';
import candidatesData from '../../candidates.json';

import { useBackendHealth } from './hooks/useBackendHealth';
import { useInterviewSession } from './hooks/useInterviewSession';

const AppContent: React.FC = () => {
  useSmoothScroll();
  const allCandidates = candidatesData.candidates as CandidateProfile[];
  
  // UI State
  const [activeView, setActiveView] = useState<'landing' | 'console'>('landing');
  const [isPrivacyOpen, setIsPrivacyOpen] = useState<boolean>(false);
  const [selectedCandidate, setSelectedCandidate] = useState<CandidateProfile>(allCandidates[0]);
  const [activeProvider, setActiveProvider] = useState<string>('auto');

  // Custom Hooks for Logic
  const { serverStatus } = useBackendHealth();
  const session = useInterviewSession(selectedCandidate, activeProvider);

  // Keyboard shortcut: Ctrl+Enter to start interview
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 'Enter' && !session.isStarted && !session.isLoading) {
        if (activeView === 'landing') {
          setActiveView('console');
        }
        session.startInterview();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [session.isStarted, session.isLoading, session.startInterview, activeView]);

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

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--base-100)' }}>
      
      {/* Shell Container */}
      <div style={{ maxWidth: '1800px', width: '100%', margin: '0 auto', padding: '1.5rem 2rem 0 2rem', flex: 1 }}>
        <Header
          activeView={activeView}
          onViewChange={setActiveView}
          activeProvider={activeProvider}
          onProviderChange={setActiveProvider}
          latencyMs={session.latencyMs}
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
                questionCount={session.questionCount}
                coveredDaysCount={session.coveredDaysCount}
                isInterviewStarted={session.isStarted}
              />

              {/* Right Panel: Interactive Canvas or Final Feedback */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {session.isComplete && session.feedback ? (
                  <FeedbackDashboard
                    feedback={session.feedback}
                    candidateName={selectedCandidate.member.name}
                    history={session.history}
                  />
                ) : (
                  <InterviewCanvas
                    history={session.history}
                    isLoading={session.isLoading}
                    isComplete={session.isComplete}
                    isStarted={session.isStarted}
                    onStartInterview={session.startInterview}
                    onSendAnswer={session.sendAnswer}
                    onResetInterview={session.resetInterview}
                  />
                )}
              </div>
            </div>

            {/* Technical REST API Payload Inspector */}
            <ApiDebugger lastPayload={session.lastPayload} lastResponse={session.lastResponse} />
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
