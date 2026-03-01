import React from 'react';

function ProgressBar({ value, max = 100, color = '#3b82f6' }) {
  const percentage = Math.min((value / max) * 100, 100);

  return (
    <div className="progress-bar">
      <div
        className="progress-fill"
        style={{
          width: `${percentage}%`,
          background: `linear-gradient(90deg, ${color}, ${color}dd)`
        }}
      />
    </div>
  );
}

function ConfidenceMeter({ value, max = 100 }) {
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / max) * circumference;

  return (
    <div className="confidence-meter">
      <svg className="confidence-circle" viewBox="0 0 100 100">
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#8b5cf6" />
          </linearGradient>
        </defs>
        <circle className="confidence-bg" cx="50" cy="50" r={radius} />
        <circle
          className="confidence-fill"
          cx="50"
          cy="50"
          r={radius}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="confidence-text">
        {Math.round(value)}%
      </div>
    </div>
  );
}

function ResultVisualization({ result }) {
  const getBadgeClass = (label) => {
    if (!label) return 'badge-warning';
    if (label.toLowerCase().includes('authentic')) return 'badge-success';
    if (label.toLowerCase().includes('fake')) return 'badge-danger';
    if (label.toLowerCase().includes('match')) return 'badge-success';
    if (label.toLowerCase().includes('mismatch')) return 'badge-danger';
    return 'badge-warning';
  };

  const getProgressColor = (percentage) => {
    if (percentage < 30) return '#10b981';
    if (percentage < 70) return '#f59e0b';
    return '#ef4444';
  };

  return (
    <div className="result-visualization">

      {/* ================= FUSION RESULT (FIRST) ================= */}
      {result.fusion && (
        <div className="card fade-in-up" style={{
          background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(139, 92, 246, 0.1))',
          border: '1px solid rgba(59, 130, 246, 0.3)'
        }}>
          <h3 style={{ textAlign: 'center', marginBottom: '2rem' }}>
             Final Multimodal Fusion Result
          </h3>

          <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
            <div className={`badge ${getBadgeClass(result.fusion.label)}`} style={{
              fontSize: '1.25rem',
              padding: '0.75rem 1.5rem'
            }}>
              {result.fusion.label}
            </div>
          </div>

          <div style={{ textAlign: 'center', marginBottom: '1rem', fontSize: '0.9rem', color: '#94a3b8' }}>
            Modalities Used: {result.fusion.modalities_used?.join(' + ').toUpperCase()}
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '2rem',
            alignItems: 'center'
          }}>
            <div>
              <div style={{ fontSize: '0.875rem', color: '#94a3b8', marginBottom: '0.5rem' }}>
                Final Score
              </div>
              <div style={{ fontSize: '2rem', fontWeight: '700', color: '#3b82f6' }}>
                {(result.fusion.score * 100).toFixed(1)}%
              </div>
            </div>

            <div>
              <ConfidenceMeter value={(result.fusion.confidence || 0) * 100} />
              <div style={{ fontSize: '0.875rem', color: '#94a3b8', textAlign: 'center', marginTop: '0.5rem' }}>
                Overall Confidence
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= TEXT ANALYSIS ================= */}
      {result.text && (
        <div className="card fade-in-up">
          <h3>📝 Text Analysis</h3>

          <div style={{ marginBottom: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span>Fake Probability</span>
              <span>{(result.text.fake_probability * 100).toFixed(1)}%</span>
            </div>
            <ProgressBar
              value={result.text.fake_probability * 100}
              color={getProgressColor(result.text.fake_probability * 100)}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <div style={{ fontSize: '0.875rem', color: '#94a3b8', marginBottom: '0.5rem' }}>
                Detected Emotion
              </div>
              <div className="badge badge-success">
                {result.text.emotion}
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.875rem', color: '#94a3b8', marginBottom: '0.5rem' }}>
                Emotion Confidence
              </div>
              <ConfidenceMeter value={(result.text.emotion_confidence || 0) * 100} />
            </div>
          </div>
        </div>
      )}

      {/* ================= IMAGE ANALYSIS ================= */}
      {result.image && (
        <div className="card fade-in-up">
          <h3>🖼️ Image Analysis</h3>

          <div style={{ marginBottom: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span>Image-Text Consistency</span>
              <span>{(result.image.consistency_score * 100).toFixed(1)}%</span>
            </div>
            <ProgressBar
              value={result.image.consistency_score * 100}
              color={result.image.consistency_score > 0.7 ? '#10b981' : '#f59e0b'}
            />
          </div>

          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div>
              <div style={{ fontSize: '0.875rem', color: '#94a3b8', marginBottom: '0.5rem' }}>
                Match Decision
              </div>
              <div className={`badge ${getBadgeClass(result.image.decision)}`}>
                {result.image.decision}
              </div>
            </div>

            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '0.875rem', color: '#94a3b8', marginBottom: '0.5rem' }}>
                Mismatch Probability
              </div>
              <ConfidenceMeter value={(result.image.mismatch_probability || 0) * 100} />
            </div>
          </div>
        </div>
      )}

      {/* ================= VIDEO (FUTURE READY) ================= */}
      {result.video && (
        <div className="card fade-in-up">
          <h3>🎥 Video Deepfake Analysis</h3>

          <div style={{ marginBottom: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span>Deepfake Probability</span>
              <span>{(result.video.fake_probability * 100).toFixed(1)}%</span>
            </div>
            <ProgressBar
              value={result.video.fake_probability * 100}
              color={getProgressColor(result.video.fake_probability * 100)}
            />
          </div>
        </div>
      )}

    </div>
  );
}

export default ResultVisualization;