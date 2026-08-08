import React from 'react';
import { CandidateProfile } from '../services/api';
import candidatesData from '../../../candidates.json';
import { User, Award, CheckCircle2, AlertCircle, Layers } from 'lucide-react';

interface CandidateDossierProps {
  selectedCandidate: CandidateProfile;
  onSelectCandidate: (candidate: CandidateProfile) => void;
  questionCount: number;
  coveredDaysCount: number;
  isInterviewStarted: boolean;
}

export const CandidateDossier: React.FC<CandidateDossierProps> = ({
  selectedCandidate,
  onSelectCandidate,
  questionCount,
  coveredDaysCount,
  isInterviewStarted
}) => {
  const allCandidates = candidatesData.candidates as CandidateProfile[];

  return (
    <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Candidate Preset Selector */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
          <span className="mono" style={{ color: 'var(--base-muted)' }}>SELECT CANDIDATE PROFILE</span>
          <User size={16} style={{ color: 'var(--accent-1)' }} />
        </div>
        <select
          value={selectedCandidate.member.id}
          onChange={(e) => {
            const match = allCandidates.find(c => c.member.id === e.target.value);
            if (match) onSelectCandidate(match);
          }}
          disabled={isInterviewStarted}
          style={{
            width: '100%',
            padding: '0.75rem 1rem',
            borderRadius: '8px',
            background: 'var(--base-200)',
            color: 'var(--base-text)',
            border: '1px solid var(--border-subtle)',
            fontFamily: 'Host Grotesk, sans-serif',
            fontSize: '1rem',
            fontWeight: 600,
            outline: 'none',
            cursor: isInterviewStarted ? 'not-allowed' : 'pointer'
          }}
        >
          {allCandidates.map(c => (
            <option key={c.member.id} value={c.member.id} style={{ background: '#1c1c1c' }}>
              {c.member.name} — {c.member.jobRole} ({c.member.yearsExperience} yrs exp)
            </option>
          ))}
        </select>
      </div>

      {/* Profile Overview Card */}
      <div style={{ background: 'var(--base-200)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
        <h3 style={{ fontSize: '1.6rem', color: 'var(--accent-1)', marginBottom: '0.2rem' }}>
          {selectedCandidate.member.name}
        </h3>
        <p style={{ color: 'var(--base-text)', fontSize: '0.95rem', fontWeight: 500 }}>
          {selectedCandidate.member.jobRole} · {selectedCandidate.member.education}
        </p>
        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.75rem' }}>
          <span className="pill-badge" style={{ color: 'var(--accent-3)' }}>
            <Award size={12} /> {selectedCandidate.signals.missionsCompleted} MISSIONS COMPLETED
          </span>
          <span className="pill-badge" style={{ color: 'var(--accent-green)' }}>
            {selectedCandidate.signals.missionsFirstTry} FIRST TRY PASSES
          </span>
        </div>
      </div>

      {/* Interview Requirements Progress Gauges */}
      <div>
        <span className="mono" style={{ color: 'var(--base-muted)', display: 'block', marginBottom: '0.5rem' }}>
          SPEC COMPLIANCE METRICS
        </span>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {/* Question Count Gauge */}
          <div style={{ background: 'var(--base-200)', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {questionCount >= 8 ? <CheckCircle2 size={16} style={{ color: 'var(--accent-green)' }} /> : <AlertCircle size={16} style={{ color: 'var(--accent-2)' }} />}
              <span className="mono" style={{ fontSize: '0.8rem' }}>QUESTIONS ASKED</span>
            </div>
            <span style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: '1.4rem', fontWeight: 900, color: questionCount >= 8 ? 'var(--accent-green)' : 'var(--base-text)' }}>
              {questionCount} / 8 MIN
            </span>
          </div>

          {/* Curriculum Days Gauge */}
          <div style={{ background: 'var(--base-200)', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Layers size={16} style={{ color: 'var(--accent-1)' }} />
              <span className="mono" style={{ fontSize: '0.8rem' }}>CURRICULUM DAYS COVERED</span>
            </div>
            <span style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: '1.4rem', fontWeight: 900, color: coveredDaysCount >= 4 ? 'var(--accent-green)' : 'var(--base-text)' }}>
              {coveredDaysCount} / 4 MIN
            </span>
          </div>
        </div>
      </div>

      {/* Completed Missions Heatmap */}
      <div>
        <span className="mono" style={{ color: 'var(--base-muted)', display: 'block', marginBottom: '0.5rem' }}>
          COHORT MISSION TIMELINE ({selectedCandidate.missions.length} MISSIONS)
        </span>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.4rem', maxHeight: '200px', overflowY: 'auto' }}>
          {selectedCandidate.missions.map((m, idx) => (
            <div
              key={idx}
              style={{
                background: m.passed ? 'rgba(163, 230, 53, 0.08)' : m.skipped ? 'rgba(255, 255, 255, 0.03)' : 'rgba(242, 172, 172, 0.1)',
                border: `1px solid ${m.passed ? 'rgba(163, 230, 53, 0.3)' : 'var(--border-subtle)'}`,
                padding: '0.4rem 0.6rem',
                borderRadius: '6px'
              }}
            >
              <div style={{ fontSize: '0.72rem', fontWeight: 700, color: m.passed ? 'var(--accent-green)' : 'var(--base-muted)' }}>
                DAY {m.day}: {m.title}
              </div>
              <div className="mono" style={{ fontSize: '0.65rem', color: 'var(--base-muted)' }}>
                {m.passed ? `PASSED (${m.attempts} ATTEMPT${m.attempts && m.attempts > 1 ? 'S' : ''})` : m.skipped ? 'SKIPPED' : 'IN PROGRESS'}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
