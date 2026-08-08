import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Send, Play, RefreshCw, Bot, User, Mic, MicOff, Download } from 'lucide-react';
import { TurnEvaluation } from '../services/api';

export interface TurnMessage {
  speaker: 'interviewer' | 'candidate';
  text: string;
  timestamp: string;
  provider?: string;
  latencyMs?: number;
  evaluation?: TurnEvaluation;
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
  const [isListening, setIsListening] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (history.length > 0 && chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [history, isLoading]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 160) + 'px';
    }
  }, [inputText]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isLoading || isComplete) return;
    onSendAnswer(inputText.trim());
    setInputText('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  // Voice input using Web Speech API
  const toggleVoiceInput = useCallback(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      return; // Silently fail if not supported
    }

    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event: any) => {
      let transcript = '';
      for (let i = 0; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }
      setInputText(transcript);
    };

    recognition.onerror = () => {
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  }, [isListening]);

  const handleExportTranscript = () => {
    const text = history.map(msg => {
      const prefix = msg.speaker === 'interviewer' ? '🤖 INTERVIEWER' : '👤 CANDIDATE';
      return `[${msg.timestamp}] ${prefix}:\n${msg.text}\n`;
    }).join('\n');

    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `interview-transcript-${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getScoreClass = (score: number) => `score-${Math.min(Math.max(Math.round(score), 1), 5)}`;

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

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {isStarted && history.length > 0 && (
            <button
              onClick={handleExportTranscript}
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
              <Download size={12} /> EXPORT
            </button>
          )}
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
      </div>

      {/* Chat Messages Stream */}
      <div ref={chatContainerRef} style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1.25rem', paddingRight: '0.5rem' }}>
        {!isStarted ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '1.5rem', textAlign: 'center', padding: '2rem' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(177, 193, 239, 0.1)', border: '1px solid var(--accent-1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Bot size={32} style={{ color: 'var(--accent-1)' }} />
            </div>
            <div>
              <h2 style={{ fontSize: '2.2rem', marginBottom: '0.5rem', color: '#ffffff' }}>
                READY TO BEGIN TECHNICAL INTERVIEW
              </h2>
              <p style={{ color: '#c0c0c0', maxWidth: '480px', margin: '0 auto', fontSize: '0.95rem' }}>
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
              <Play size={20} fill="#0a0a0a" /> INITIALIZE SESSION
            </button>
            <span className="mono" style={{ fontSize: '0.7rem', color: '#a0a0a0' }}>
              POST /api/interview · CTRL+ENTER
            </span>
          </div>
        ) : (
          <>
            {history.map((msg, idx) => (
              <div
                key={idx}
                className="message-enter"
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
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem', gap: '0.75rem' }}>
                    <span className="mono" style={{ fontSize: '0.75rem', fontWeight: 700, color: msg.speaker === 'interviewer' ? 'var(--accent-1)' : 'var(--accent-green)' }}>
                      {msg.speaker.toUpperCase()}
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      {msg.evaluation && (
                        <span className={`score-badge ${getScoreClass(msg.evaluation.score)}`} title={msg.evaluation.notes}>
                          {msg.evaluation.score}
                        </span>
                      )}
                      {msg.provider && (
                        <span className="mono" style={{ fontSize: '0.68rem', color: 'var(--base-muted)' }}>
                          {msg.provider} · {msg.latencyMs}ms
                        </span>
                      )}
                    </div>
                  </div>
                  <p style={{ fontSize: '1.05rem', whiteSpace: 'pre-wrap' }}>{msg.text}</p>
                </div>

                {msg.speaker === 'candidate' && (
                  <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(163, 230, 53, 0.15)', border: '1px solid var(--accent-green)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <User size={18} style={{ color: 'var(--accent-green)' }} />
                  </div>
                )}
              </div>
            ))}

            {/* Typing indicator when loading */}
            {isLoading && (
              <div
                className="message-enter"
                style={{ display: 'flex', gap: '1rem', alignSelf: 'flex-start', maxWidth: '85%' }}
              >
                <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(177, 193, 239, 0.15)', border: '1px solid var(--accent-1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Bot size={18} style={{ color: 'var(--accent-1)' }} />
                </div>
                <div style={{
                  background: 'var(--base-200)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '12px',
                  padding: '0.75rem 1.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem'
                }}>
                  <div className="typing-indicator">
                    <div className="typing-dot"></div>
                    <div className="typing-dot"></div>
                    <div className="typing-dot"></div>
                  </div>
                  <span className="mono" style={{ fontSize: '0.7rem', color: 'var(--base-muted)' }}>
                    THINKING...
                  </span>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Input Box */}
      {isStarted && !isComplete && (
        <form onSubmit={handleSubmit} style={{ marginTop: '1rem', display: 'flex', gap: '0.75rem', alignItems: 'flex-end' }}>
          {/* Voice Input Button */}
          <button
            type="button"
            onClick={toggleVoiceInput}
            className={isListening ? 'voice-pulse' : ''}
            style={{
              background: isListening ? 'rgba(242, 172, 172, 0.2)' : 'var(--base-200)',
              color: isListening ? 'var(--accent-2)' : 'var(--base-muted)',
              border: `1px solid ${isListening ? 'var(--accent-2)' : 'var(--border-subtle)'}`,
              borderRadius: '8px',
              padding: '0.75rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              height: '48px',
              width: '48px'
            }}
            title={isListening ? 'Stop listening' : 'Start voice input'}
          >
            {isListening ? <MicOff size={18} /> : <Mic size={18} />}
          </button>

          <textarea
            ref={textareaRef}
            className="chat-textarea"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your technical response... (Shift+Enter for new line)"
            disabled={isLoading}
            rows={1}
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
              gap: '6px',
              height: '48px',
              flexShrink: 0
            }}
          >
            <Send size={16} /> RESPOND
          </button>
        </form>
      )}
    </div>
  );
};
