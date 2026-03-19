import React from "react";

function ProgressBar({ value, max = 100, color = "#3b82f6" }) {
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

function ConfidenceMeter({ value, max = 100, color = "#3b82f6" }) {
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / max) * circumference;

  return (
    <div className="confidence-meter">
      <svg className="confidence-circle" viewBox="0 0 100 100">
        <circle className="confidence-bg" cx="50" cy="50" r={radius} />
        <circle
          className="confidence-fill"
          cx="50"
          cy="50"
          r={radius}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ stroke: color }} // Fixed: Now uses the dynamic color prop
        />
      </svg>
      <div className="confidence-text" style={{ color: color }}>{Math.round(value)}%</div>
    </div>
  );
}

function ResultVisualization({ result }) {
  // --- AI REASONING GENERATOR (ONLY TRIGGERS ON EXPLAIN) ---
  const generateAIReasoning = () => {
    if (!result.explanation) return null;

    let reasons = [];
    const isDeepfake = result.deepfake_analysis?.is_deepfake;
    const textProb = result.text?.fake_probability || 0;

    if (isDeepfake) {
      reasons.push("I detected artificial facial patterns and inconsistent textures in the image.");
    }

    if (textProb > 0.7) {
      const topToken = result.explanation.text_explanation?.reduce((prev, curr) => 
        (curr.importance > prev.importance) ? curr : prev, {importance: 0}
      );
      if (topToken && topToken.importance > 0.1) {
        reasons.push(`The language used—specifically the word "${topToken.token}"—is highly characteristic of misleading content.`);
      } else {
        reasons.push("The linguistic style exhibits patterns of high emotional manipulation.");
      }
    }

    if (reasons.length > 0) {
      return {
        text: `I am flagging this as FAKE because: ${reasons.join(" Additionally, ")}`,
        color: "#ef4444",
        bg: "rgba(239, 68, 68, 0.1)"
      };
    }

    return {
      text: "I am classifying this as AUTHENTIC because the facial features look natural and the text matches credible reporting patterns.",
      color: "#10b981",
      bg: "rgba(16, 185, 129, 0.1)"
    };
  };

  const summary = generateAIReasoning();

  const getBadgeClass = (label) => {
    if (!label) return "badge-warning";
    const l = label.toLowerCase();
    if (l.includes("authentic") || l.includes("match")) return "badge-success";
    if (l.includes("fake") || l.includes("mismatch")) return "badge-danger";
    return "badge-warning";
  };

  const getProgressColor = (percentage) => {
    if (percentage < 30) return "#10b981"; // Green
    if (percentage < 70) return "#f59e0b"; // Yellow/Amber
    return "#ef4444"; // Red
  };

  return (
    <div className="result-visualization">
      
      {/* ================= 1. AI SUMMARY (ONLY AFTER EXPLAIN) ================= */}
      {result.explanation && summary && (
        <div className="card fade-in-up" style={{ borderLeft: `5px solid ${summary.color}`, backgroundColor: summary.bg, marginBottom: "2rem" }}>
          <h4 style={{ color: summary.color, marginBottom: "0.5rem" }}>🤖 AI Reasoning Summary</h4>
          <p style={{ fontSize: "1.1rem", fontStyle: "italic", color: "#f8fafc", margin: 0 }}>
            "{summary.text}"
          </p>
        </div>
      )}

      {/* ================= 2. FUSION RESULTS (ALWAYS SHOWN) ================= */}
      {result.fusion && (
        <div className="card fade-in-up" style={{ background: "linear-gradient(135deg, rgba(59,130,246,0.1), rgba(139,92,246,0.1))", border: "1px solid rgba(59,130,246,0.3)" }}>
          <h3 style={{ textAlign: "center", marginBottom: "1rem" }}>🧠 Multimodal Fusion Result</h3>
          <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
            <div className={`badge ${getBadgeClass(result.fusion.label)}`} style={{ fontSize: "1.2rem", padding: "0.5rem 1rem" }}>
              {result.fusion.label}
            </div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "3rem", fontWeight: "bold", color: "#3b82f6" }}>{(result.fusion.score * 100).toFixed(1)}%</div>
            <div style={{ color: "#94a3b8", fontSize: "0.9rem" }}>Overall Suspicion Score</div>
          </div>
        </div>
      )}

      {/* ================= 3. TEXT ANALYSIS (ALWAYS SHOWN) ================= */}
      {result.text && (
        <div className="card fade-in-up">
          <h3>📝 Text Analysis</h3>
          <div style={{ marginBottom: "1.5rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
              <span>Combined Fake Probability</span>
              <span>{(result.text.fake_probability * 100).toFixed(1)}%</span>
            </div>
            <ProgressBar
              value={result.text.fake_probability * 100}
              color={getProgressColor(result.text.fake_probability * 100)}
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem", marginBottom: "1.5rem" }}>
            <div>
              <div style={{ fontSize: "0.875rem", color: "#94a3b8", marginBottom: "0.5rem" }}>Style Risk (FNN)</div>
              <ConfidenceMeter 
                value={(result.text.style_fake_probability || 0) * 100} 
                color={getProgressColor((result.text.style_fake_probability || 0) * 100)} 
              />
            </div>
            <div>
              <div style={{ fontSize: "0.875rem", color: "#94a3b8", marginBottom: "0.5rem" }}>Claim Risk (LIAR)</div>
              <ConfidenceMeter 
                value={(result.text.claim_fake_probability || 0) * 100} 
                color={getProgressColor((result.text.claim_fake_probability || 0) * 100)} 
              />
            </div>
          </div>

          <div style={{ marginTop: "1rem" }}>
            <div style={{ fontSize: "0.875rem", color: "#94a3b8", marginBottom: "1rem" }}>Top Detected Emotions</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem" }}>
              {(result.text.top_emotions || []).map((emo, index) => (
                <div key={index} className="badge" style={{ padding: "0.5rem 1rem", background: "rgba(59, 130, 246, 0.1)", border: "1px solid #3b82f6", color: "#fff", borderRadius: "20px" }}>
                  {emo.label} 
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      {/* ================= 4. IMAGE-TEXT CONSISTENCY (CLIP) ================= */}
{result.image && (
  <div className="card fade-in-up">
    <h3>Image-Text Consistency (CLIP)</h3>
    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
      <span>Semantic Match Score</span>
      <span>{(result.image.consistency_score * 100).toFixed(1)}%</span>
    </div>
    <ProgressBar 
      value={result.image.consistency_score * 100} 
      color={result.image.consistency_score > 0.5 ? "#10b981" : "#ef4444"} 
    />
    
    <div style={{ marginTop: "1rem", display: "flex", alignItems: "center", gap: "10px" }}>
      <div className={`badge ${getBadgeClass(result.image.decision)}`}>
        {result.image.decision}
      </div>
      <span style={{ fontSize: "0.9rem", color: "#94a3b8" }}>
        {result.image.mismatch_probability > 0.5 
          ? " High risk of context re-purposing (Cheapfake)." 
          : "Image aligns well with the provided text."}
      </span>
    </div>
    
    {/* OCR Notification - If text was pulled from the image itself */}
    {result.explanation?.ocr_text && (
      <div style={{ 
        marginTop: "1rem", 
        padding: "0.75rem", 
        background: "rgba(59, 130, 246, 0.1)", 
        borderRadius: "8px",
        border: "1px dashed #3b82f6" 
      }}>
        <div style={{ fontSize: "0.75rem", color: "#3b82f6", fontWeight: "bold" }}>OCR DETECTED TEXT:</div>
        <div style={{ fontSize: "0.85rem", color: "#cbd5e1" }}>"{result.explanation.ocr_text}"</div>
      </div>
    )}
  </div>
)}

      {/* ================= 4. DEEPFAKE ANALYSIS ================= */}
      {result.deepfake_analysis && (
        <div className="card fade-in-up" style={{ border: "1px solid rgba(239, 68, 68, 0.3)" }}>
          <h3>🎭 Deepfake Analysis</h3>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1rem" }}>
            <div style={{ fontSize: "1.2rem", fontWeight: "bold" }}>{(result.deepfake_analysis.fake_probability * 100).toFixed(1)}% AI Prob.</div>
            <div className={`badge ${getBadgeClass(result.deepfake_analysis.is_deepfake ? 'fake' : 'authentic')}`}>
              {result.deepfake_analysis.is_deepfake ? "AI GENERATED" : "AUTHENTIC"}
            </div>
          </div>
          <ProgressBar value={result.deepfake_analysis.fake_probability * 100} color="#ef4444" />
          
          {result.explanation?.deepfake_heatmap && (
            <div style={{ marginTop: "1.5rem", textAlign: "center" }}>
              <p style={{ fontSize: "0.85rem", color: "#94a3b8" }}>Grad-CAM Facial Artifact Mapping</p>
              <canvas 
                width="224" height="224"
                ref={(canvas) => {
                  if (canvas) {
                    const ctx = canvas.getContext('2d');
                    const heatmap = result.explanation.deepfake_heatmap;
                    const imgData = ctx.createImageData(224, 224);
                    for (let i = 0; i < heatmap.length; i++) {
                      for (let j = 0; j < heatmap[i].length; j++) {
                        const idx = (i * 224 + j) * 4;
                        const val = heatmap[i][j]; 
                        imgData.data[idx] = 255; imgData.data[idx+1] = 0; imgData.data[idx+2] = 0; imgData.data[idx+3] = val * 220; 
                      }
                    }
                    ctx.putImageData(imgData, 0, 0);
                  }
                }}
                style={{ backgroundColor: "#0f172a", borderRadius: "8px", border: "1px solid #ef4444" }}
              />
            </div>
          )}
        </div>
      )}

      {/* ================= 5. SHAP EXPLANATION (ONLY AFTER EXPLAIN) ================= */}
      {result.explanation?.text_explanation && (
        <div className="card fade-in-up">
          <h3>🔍 Explainability Report (SHAP)</h3>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
            {result.explanation.text_explanation.map((item, index) => (
              <span key={index} style={{
                  padding: "4px 8px", borderRadius: "4px",
                  backgroundColor: item.importance > 0 
                    ? `rgba(239,68,68,${Math.min(Math.abs(item.importance) * 5, 0.9)})` 
                    : `rgba(16,185,129,${Math.min(Math.abs(item.importance) * 5, 0.9)})`,
                  color: "#fff", fontSize: "0.9rem"
                }}>
                {item.token}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default ResultVisualization;