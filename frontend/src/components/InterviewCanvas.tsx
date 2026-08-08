import React, { useState, useRef, useEffect } from 'react';
import { Send, Play, RefreshCw, Volume2, Bot, User } from 'lucide-react';

export interface TurnMessage {
  speaker: 'interviewer' | 'candidate';
  text: string;
  timestamp: string;
  provider?: string;
  latencyMs?: number;
}

interface InterviewCanvasProps {
  history: TurnMessage[];
  isLoading: boolean;
  isComplete: boolean;
  isStarted: boolean;
  onStartInterview: () => void;
  onSendAnswer: (answer: string) => void;
  onResetInterview: () => void;
}

export const InterviewCanvas: React.FC<InterviewCanvasProps> = ({
  history,
  isLoading,
  isComplete,
  isStarted,
  onStartInterview,
  onSendAnswer,
  onResetInterview
}) => {
  const [inputText, setInputText] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history, isLoading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isLoading || isComplete) return;
    onSendAnswer(inputText.trim());
    setInputText('');
  };

  return (
    <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', height: '100%', minHeight: '650px' }}>
      {/* Header Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '1rem', borderBottom: '1px solid var(--border-subtle)', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ background: 'var(--accent-1)', color: '#000', padding: '0.3rem 0.6rem', borderRadius: '6px', fontWeight: 900 }} className="mono">
            LIVE INTERVIEW CANVAS
          </div>
          {isLoading && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div className="audio-wave">
                <div className="audio-bar"></div>
                <div className="audio-bar"></div>
                <div className="audio-bar"></div>
                <div className="audio-bar"></div>
                <div className="audio-bar"></div>
              </div>
              <span className="mono" style={{ color: 'var(--accent-1)', fontSize: '0.75rem' }}>
                INTERVIEWER SYNTHESIZING...
              </span>
            </div>
          )}
        </div>

        <button
          onClick={onResetInterview}
          style={{
            background: 'transparent',
            color: 'var(--base-muted)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '6px',
            padding: '0.4rem 0.8rem',
            fontFamily: 'DM Mono, monospace',
            fontSize: '0.75rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}
        >
          <RefreshCw size={12} /> RESET SESSION
        </button>
      </div>

      {/* Chat Messages Stream */}
      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1.25rem', paddingRight: '0.5rem' }}>
        {!isStarted ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '1.5rem', textAlign: 'center', padding: '2rem' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(177, 193, 239, 0.1)', border: '1px solid var(--accent-1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Bot size={32} style={{ color: 'var(--accent-1)' }} />
            </div>
            <div>
              <h2 style={{ fontSize: '2.2rem', marginBottom: '0.5rem', color: 'var(--base-text)' }}>
                READY TO BEGIN TECHNICAL INTERVIEW
              </h2>
              <p style={{ color: 'var(--base-muted)', maxWidth: '480px', margin: '0 auto', fontSize: '0.95rem' }}>
                The Interview Agent will analyze your candidate profile, plan a sequence across completed cohort missions, and conduct an adaptive multi-turn interview.
              </p>
            </div>
            <button
              onClick={onStartInterview}
              style={{
                background: 'var(--accent-1)',
                color: '#0a0a0a',
                border: 'none',
                padding: '0.9rem 2rem',
                borderRadius: '8px',
                fontFamily: 'Barlow Condensed, sans-serif',
                fontSize: '1.4rem',
                fontWeight: 900,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                textTransform: 'uppercase',
                boxShadow: '0 0 20px rgba(177, 193, 239, 0.3)'
              }}
            >
              <Play size={20} fill="#0a0a0a" /> INITIALIZE SESSION (POST /api/interview)
            </button>
          </div>
        ) : (
          history.map((msg, idx) => (
            <div
              key={idx}
              style={{
                display: 'flex',
                gap: '1rem',
                alignSelf: msg.speaker === 'interviewer' ? 'flex-start' : 'flex-end',
                maxWidth: '85%'
              }}
            >
              {msg.speaker === 'interviewer' && (
                <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(177, 193, 239, 0.15)', border: '1px solid var(--accent-1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Bot size={18} style={{ color: 'var(--accent-1)' }} />
                </div>
              )}

              <div
                style={{
                  background: msg.speaker === 'interviewer' ? 'var(--base-200)' : 'rgba(177, 193, 239, 0.1)',
                  border: `1px solid ${msg.speaker === 'interviewer' ? 'var(--border-subtle)' : 'var(--accent-1)'}`,
                  padding: '1rem 1.25rem',
                  borderRadius: '12px',
                  color: 'var(--base-text)',
                  lineHeight: 1.6
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                  <span className="mono" style={{ fontSize: '0.75rem', fontWeight: 700, color: msg.speaker === 'interviewer' ? 'var(--accent-1)' : 'var(--accent-green)' }}>
                    {msg.speaker.toUpperCase()}
                  </span>
                  {msg.provider && (
                    <span className="mono" style={{ fontSize: '0.68rem', color: 'var(--base-muted)' }}>
                      {msg.provider} · {msg.latencyMs}ms
                    </span>
                  )}
                </div>
                <p style={{ fontSize: '1.05rem', whiteSpace: 'pre-wrap' }}>{msg.text}</p>
              </div>

              {msg.speaker === 'candidate' && (
                <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(163, 230, 53, 0.15)', border: '1px solid var(--accent-green)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <User size={18} style={{ color: 'var(--accent-green)' }} />
                </div>
              )}
            </div>
          ))
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Input Box */}
      {isStarted && !isComplete && (
        <form onSubmit={handleSubmit} style={{ marginTop: '1rem', display: 'flex', gap: '0.75rem' }}>
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type your technical response here..."
            disabled={isLoading}
            style={{
              flex: 1,
              padding: '0.9rem 1.25rem',
              borderRadius: '8px',
              background: 'var(--base-200)',
              color: 'var(--base-text)',
              border: '1px solid var(--border-subtle)',
              fontFamily: 'Host Grotesk, sans-serif',
              fontSize: '1rem',
              outline: 'none'
            }}
          />
          <button
            type="submit"
            disabled={isLoading || !inputText.trim()}
            style={{
              background: isLoading || !inputText.trim() ? 'var(--base-300)' : 'var(--accent-1)',
              color: '#0a0a0a',
              border: 'none',
              padding: '0 1.5rem',
              borderRadius: '8px',
              fontFamily: 'Barlow Condensed, sans-serif',
              fontSize: '1.2rem',
              fontWeight: 900,
              cursor: isLoading || !inputText.trim() ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Send size={16} /> RESPOND
          </button>
        </form>
      )}
    </div>
  );
};
