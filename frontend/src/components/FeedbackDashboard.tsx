import React from 'react';
import { InterviewFeedback } from '../services/api';
import { Award, CheckCircle, AlertTriangle, ArrowRight, Check } from 'lucide-react';

interface FeedbackDashboardProps {
  feedback: InterviewFeedback;
  candidateName: string;
}

export const FeedbackDashboard: React.FC<FeedbackDashboardProps> = ({
  feedback,
  candidateName
}) => {
  return (
    <div className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
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
      </div>

      {/* Summary Box */}
      <div style={{ background: 'var(--base-200)', padding: '1.25rem 1.5rem', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
        <span className="mono" style={{ color: 'var(--accent-1)', display: 'block', marginBottom: '0.5rem' }}>
          EXECUTIVE SUMMARY
        </span>
        <p style={{ fontSize: '1.1rem', color: 'var(--base-text)', lineHeight: 1.6 }}>
          {feedback.summary}
        </p>
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
    </div>
  );
};
