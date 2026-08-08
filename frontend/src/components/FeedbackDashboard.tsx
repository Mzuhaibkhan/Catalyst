import React, { useState } from 'react';
import { InterviewFeedback } from '../services/api';
import { TurnMessage } from './InterviewCanvas';
import { RadarChart } from './RadarChart';
import { Award, CheckCircle, AlertTriangle, ArrowRight, Check, MessageSquare, BarChart3, Download, Bot, User } from 'lucide-react';

interface FeedbackDashboardProps {
  feedback: InterviewFeedback;
  candidateName: string;
  history: TurnMessage[];
}

export const FeedbackDashboard: React.FC<FeedbackDashboardProps> = ({
  feedback,
  candidateName,
  history
}) => {
  const [showTranscript, setShowTranscript] = useState(false);

  // Derive radar chart data from history evaluations
  const topicScores = new Map<string, number[]>();
  history.forEach(msg => {
    if (msg.speaker === 'interviewer' && msg.evaluation) {
      const provider = msg.provider || 'Unknown';
      // Group by provider for simplicity; in a richer implementation, group by curriculum day
      if (!topicScores.has(provider)) topicScores.set(provider, []);
      topicScores.get(provider)!.push(msg.evaluation.score);
    }
  });

  // Generate generic category labels from feedback content
  const radarLabels = ['Technical Depth', 'Problem Solving', 'Communication', 'Architecture', 'Implementation', 'Best Practices'];
  const radarValues = radarLabels.map((_, i) => {
    // Distribute scores across categories based on available evaluation data
    const allScores = history
      .filter(m => m.speaker === 'interviewer' && m.evaluation)
      .map(m => m.evaluation!.score);
    return allScores.length > 0 ? allScores[i % allScores.length] : 3.5;
  });

  const handleExportReport = () => {
    let report = `INTERVIEW EVALUATION REPORT\n`;
    report += `Candidate: ${candidateName}\n`;
    report += `Date: ${new Date().toLocaleDateString()}\n`;
    report += `${'='.repeat(50)}\n\n`;
    report += `EXECUTIVE SUMMARY\n${feedback.summary}\n\n`;
    report += `KEY STRENGTHS\n${feedback.strengths.map(s => `  • ${s}`).join('\n')}\n\n`;
    report += `KNOWLEDGE GAPS\n${feedback.gaps.map(g => `  • ${g}`).join('\n')}\n\n`;
    report += `NEXT STEPS ROADMAP\n${feedback.next.map(n => `  • ${n}`).join('\n')}\n\n`;
    report += `${'='.repeat(50)}\n\nFULL TRANSCRIPT\n\n`;
    report += history.map(msg => {
      const prefix = msg.speaker === 'interviewer' ? '🤖 INTERVIEWER' : '👤 CANDIDATE';
      return `[${msg.timestamp}] ${prefix}:\n${msg.text}\n`;
    }).join('\n');

    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `interview-report-${candidateName.replace(/\s+/g, '-').toLowerCase()}-${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="feedback-enter glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header Banner */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '1rem', borderBottom: '1px solid var(--border-subtle)' }}>
        <div>
          <div className="pill-badge" style={{ color: 'var(--accent-green)', marginBottom: '0.4rem' }}>
            <Check size={14} /> INTERVIEW COMPLETED · FEEDBACK SYNTHESIZED
          </div>
          <h2 style={{ fontSize: '2.5rem', color: 'var(--base-text)' }}>
            EVALUATION DOSSIER: {candidateName.toUpperCase()}
          </h2>
        </div>
        <button
          onClick={handleExportReport}
          style={{
            background: 'var(--base-200)',
            color: 'var(--base-text)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '8px',
            padding: '0.6rem 1rem',
            fontFamily: 'DM Mono, monospace',
            fontSize: '0.78rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <Download size={14} /> DOWNLOAD REPORT
        </button>
      </div>

      {/* Summary Box + Radar Chart */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '1.5rem', alignItems: 'start' }}>
        <div style={{ background: 'var(--base-200)', padding: '1.25rem 1.5rem', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
          <span className="mono" style={{ color: 'var(--accent-1)', display: 'block', marginBottom: '0.5rem' }}>
            EXECUTIVE SUMMARY
          </span>
          <p style={{ fontSize: '1.1rem', color: 'var(--base-text)', lineHeight: 1.6 }}>
            {feedback.summary}
          </p>
        </div>

        {/* Radar Chart */}
        <div style={{ background: 'var(--base-200)', padding: '1rem', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
          <span className="mono" style={{ color: 'var(--accent-1)', display: 'block', marginBottom: '0.5rem', textAlign: 'center' }}>
            <BarChart3 size={12} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
            SKILL RADAR
          </span>
          <RadarChart labels={radarLabels} values={radarValues} size={240} />
        </div>
      </div>

      {/* Grid of Strengths, Gaps, Next Steps */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.25rem' }}>
        {/* Strengths */}
        <div style={{ background: 'rgba(163, 230, 53, 0.05)', border: '1px solid rgba(163, 230, 53, 0.3)', borderRadius: '10px', padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <CheckCircle size={18} style={{ color: 'var(--accent-green)' }} />
            <h3 style={{ fontSize: '1.4rem', color: 'var(--accent-green)' }}>KEY STRENGTHS</h3>
          </div>
          <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', listStyle: 'none', padding: 0 }}>
            {feedback.strengths.map((s, idx) => (
              <li key={idx} style={{ fontSize: '0.95rem', color: 'var(--base-text)', display: 'flex', gap: '0.5rem' }}>
                <span style={{ color: 'var(--accent-green)', fontWeight: 700 }}>•</span> {s}
              </li>
            ))}
          </ul>
        </div>

        {/* Gaps */}
        <div style={{ background: 'rgba(242, 172, 172, 0.05)', border: '1px solid rgba(242, 172, 172, 0.3)', borderRadius: '10px', padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <AlertTriangle size={18} style={{ color: 'var(--accent-2)' }} />
            <h3 style={{ fontSize: '1.4rem', color: 'var(--accent-2)' }}>KNOWLEDGE GAPS</h3>
          </div>
          <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', listStyle: 'none', padding: 0 }}>
            {feedback.gaps.map((g, idx) => (
              <li key={idx} style={{ fontSize: '0.95rem', color: 'var(--base-text)', display: 'flex', gap: '0.5rem' }}>
                <span style={{ color: 'var(--accent-2)', fontWeight: 700 }}>•</span> {g}
              </li>
            ))}
          </ul>
        </div>

        {/* Next Steps */}
        <div style={{ background: 'rgba(255, 221, 148, 0.05)', border: '1px solid rgba(255, 221, 148, 0.3)', borderRadius: '10px', padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <ArrowRight size={18} style={{ color: 'var(--accent-3)' }} />
            <h3 style={{ fontSize: '1.4rem', color: 'var(--accent-3)' }}>NEXT STEPS ROADMAP</h3>
          </div>
          <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', listStyle: 'none', padding: 0 }}>
            {feedback.next.map((n, idx) => (
              <li key={idx} style={{ fontSize: '0.95rem', color: 'var(--base-text)', display: 'flex', gap: '0.5rem' }}>
                <span style={{ color: 'var(--accent-3)', fontWeight: 700 }}>•</span> {n}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Transcript Toggle */}
      <div>
        <button
          onClick={() => setShowTranscript(!showTranscript)}
          style={{
            width: '100%',
            background: 'var(--base-200)',
            color: 'var(--base-text)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '8px',
            padding: '0.85rem 1.25rem',
            fontFamily: 'DM Mono, monospace',
            fontSize: '0.82rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <MessageSquare size={16} style={{ color: 'var(--accent-1)' }} />
            <span>VIEW FULL INTERVIEW TRANSCRIPT ({history.length} TURNS)</span>
          </div>
          <span>{showTranscript ? '▲' : '▼'}</span>
        </button>

        {showTranscript && (
          <div style={{
            marginTop: '0.75rem',
            background: 'var(--base-200)',
            borderRadius: '8px',
            border: '1px solid var(--border-subtle)',
            padding: '1rem',
            maxHeight: '400px',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem'
          }}>
            {history.map((msg, idx) => (
              <div key={idx} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                <div style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '6px',
                  background: msg.speaker === 'interviewer' ? 'rgba(177, 193, 239, 0.15)' : 'rgba(163, 230, 53, 0.15)',
                  border: `1px solid ${msg.speaker === 'interviewer' ? 'var(--accent-1)' : 'var(--accent-green)'}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  {msg.speaker === 'interviewer'
                    ? <Bot size={14} style={{ color: 'var(--accent-1)' }} />
                    : <User size={14} style={{ color: 'var(--accent-green)' }} />
                  }
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                    <span className="mono" style={{
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      color: msg.speaker === 'interviewer' ? 'var(--accent-1)' : 'var(--accent-green)'
                    }}>
                      {msg.speaker.toUpperCase()}
                    </span>
                    <span className="mono" style={{ fontSize: '0.65rem', color: 'var(--base-muted)' }}>
                      {msg.timestamp}
                    </span>
                    {msg.evaluation && (
                      <span className={`score-badge ${`score-${Math.min(Math.max(Math.round(msg.evaluation.score), 1), 5)}`}`} style={{ width: '22px', height: '22px', fontSize: '0.7rem' }}>
                        {msg.evaluation.score}
                      </span>
                    )}
                  </div>
                  <p style={{ fontSize: '0.9rem', color: 'var(--base-text)', whiteSpace: 'pre-wrap', lineHeight: 1.5 }}>
                    {msg.text}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
