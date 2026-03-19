import React from 'react';

function Guide() {
  return (
    <section className="section">
      <div className="guide-header" style={{ textAlign: 'center', marginBottom: '30px' }}>
        <h2>How Our System Analyzes Your Media</h2>
        <p>The system adapts its analysis based on the files you provide.</p>
      </div>

      <div className="guide-grid">
        {/* Step 1: Input Flexibility */}
        <div className="card">
          <div className="icon-box" style={{ fontSize: '2rem' }}></div>
          <h3>1. Flexible Input</h3>
          <p>You can provide:</p>
          <ul style={{ textAlign: 'left', fontSize: '0.9rem' }}>
            <li><strong>Text Only:</strong> Checks writing style & emotion.</li>
            <li><strong>Image Only:</strong> Extracts text (OCR) and scans for Deepfakes.</li>
            <li><strong>Text + Image:</strong> Performs a full Consistency Match.</li>
          </ul>
        </div>

        {/* Step 2: The Process */}
        <div className="card">
          <div className="icon-box" style={{ fontSize: '2rem' }}></div>
          <h3>2. Deep Analysis</h3>
          <p>Once you click <strong>Analyse</strong>, the AI runs:</p>
          <ul style={{ textAlign: 'left', fontSize: '0.9rem' }}>
            <li><strong>Emotion Scan:</strong> Detects if text is trying to manipulate feelings.</li>
            <li><strong>Deepfake Check:</strong> Scans faces for AI-generated artifacts.</li>
            <li><strong>Logic Check:</strong> Ensures the image actually matches the text.</li>
          </ul>
        </div>

        {/* Step 3: The Report */}
        <div className="card">
          <div className="icon-box" style={{ fontSize: '2rem' }}></div>
          <h3>3. Analysis Report</h3>
          <p>
            The system generates a final score. A <strong>High Risk</strong> verdict means 
            the AI found emotional manipulation, a deepfake face, or a text-image mismatch.
          </p>
        </div>

        {/* Step 4: Explainability */}
        <div className="card">
          <div className="icon-box" style={{ fontSize: '2rem' }}></div>
          <h3>4. Interactive Evidence</h3>
          <p>
            Click <strong>Explain</strong> to see the "Why":
          </p>
          <ul style={{ textAlign: 'left', fontSize: '0.9rem' }}>
            <li><strong>SHAP:</strong> Highlights specific words that influenced the score.</li>
            <li><strong>Grad-CAM:</strong> Paints a heatmap on the image showing exactly where the AI detected a fake.</li>
          </ul>
        </div>
      </div>
    </section>
  );
}

export default Guide;