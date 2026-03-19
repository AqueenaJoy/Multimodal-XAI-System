import { useState } from "react";
import axios from "axios";
import ModalityIndicator from "../components/ModalityIndicator";
import ResultVisualization from "../components/ResultVisualization";

function TryNow() {
  const [text, setText] = useState("");
  const [image, setImage] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [checkDeepfake, setCheckDeepfake] = useState(false); // Added for Deepfake toggle

  const explain = async () => {
  // Update: Only alert if BOTH text and image are missing
  if (!text.trim() && !image) {
    alert("Please provide text or an image for explanation.");
    return;
  }

  setLoading(true);

  const formData = new FormData();
  if (text.trim()) formData.append("text", text);
  if (image) formData.append("image", image);
  formData.append("check_deepfake", checkDeepfake); // Ensure this is sent

  try {
    const res = await axios.post(
      "http://localhost:5000/api/explain",
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
        timeout: 600000 // SHAP and Heatmap generation take time
      }
    );

    // Merge the explanation data into the current result state
    setResult(prev => ({
      ...prev,
      explanation: res.data
    }));

  } catch (err) {
    console.error("Explain error:", err);
    alert("Error generating explanation.");
  } finally {
    setLoading(false);
  }
};

  const analyze = async () => {
    if (!text.trim() && !image) {
      alert("Please provide at least text or an image.");
      return;
    }

    setLoading(true);
    setResult(null);

    const formData = new FormData();
    if (text.trim()) formData.append("text", text);
    if (image) formData.append("image", image);
    formData.append("check_deepfake", checkDeepfake); // Include checkbox state

    try {
      const res = await axios.post(
        "http://localhost:5000/api/analyze",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
          timeout: 30000,
        }
      );
      setResult(res.data);
    } catch (err) {
      console.error("Analysis error:", err);
      alert("Backend error. Please check server.");
    }
    setLoading(false);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith("image/")) {
        setImage(file);
      }
    }
  };

  const resetInputs = () => {
    setText("");
    setImage(null);
    setResult(null);
    setCheckDeepfake(false);
  };

  return (
    <div className="container">
      <div className="hero" style={{ paddingBottom: "2rem" }}>
        <h1>Unified Authenticity Scan</h1>
        <p>Upload text and images for comprehensive  risk assessment</p>
      </div>

      <div className="two-column">
        <div className="input-panel">
          <div className="card">
            <h2>Input Modalities</h2>

            <div className="modality-indicator" style={{ marginBottom: "2rem" }}>
              <ModalityIndicator text={text} image={image} />
            </div>

            {/* TEXT */}
            <div className="form-group">
              <label className="form-label">Text Input</label>
              <textarea
                className="form-textarea"
                placeholder="Enter news headline, social media post, or any text to analyze..."
                value={text}
                onChange={(e) => setText(e.target.value)}
                disabled={loading}
              />
            </div>

            {/* IMAGE */}
            <div className="form-group">
              <label className="form-label">Image Upload</label>
              <div
                className={`file-upload ${dragActive ? "drag-active" : ""}`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImage(e.target.files[0])}
                  disabled={loading}
                />
                <label className="file-upload-label">
                  <div>
                    {image ? (
                      <div>
                        <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>🖼️</div>
                        <div>{image.name}</div>
                        <div style={{ fontSize: "0.875rem", color: "#94a3b8" }}>
                          {(image.size / 1024 / 1024).toFixed(2)} MB
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>📁</div>
                        <div>Click to upload or drag & drop</div>
                        <div style={{ fontSize: "0.875rem", color: "#94a3b8" }}>
                          PNG, JPG up to 10MB
                        </div>
                      </div>
                    )}
                  </div>
                </label>
              </div>
            </div>

            {/* DEEPFAKE CHECKBOX */}
            <div style={{ 
              display: "flex", 
              alignItems: "center", 
              gap: "10px", 
              margin: "1rem 0",
              padding: "10px",
              background: "rgba(239, 68, 68, 0.05)",
              borderRadius: "8px",
              border: "1px solid rgba(239, 68, 68, 0.1)"
            }}>
              <input 
                type="checkbox" 
                id="deepfake-check" 
                checked={checkDeepfake} 
                onChange={(e) => setCheckDeepfake(e.target.checked)}
                style={{ width: "18px", height: "18px", cursor: "pointer" }}
              />
              <label htmlFor="deepfake-check" style={{ cursor: "pointer", fontSize: "0.9rem", color: "#e2e8f0" }}>
              Run AI Deepfake Facial Scan
              </label>
            </div>

            <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
              <button
                className="btn btn-primary"
                onClick={analyze}
                disabled={loading || (!text.trim() && !image)}
                style={{ flex: 1 }}
              >
                {loading ? <><span className="loading"></span> Analyzing...</> : "Analyze"}
              </button>
              <button 
                className="btn btn-secondary"
                onClick={explain}
                disabled={loading || !result} // Disabled until initial analysis is done
              >
                Explain
              </button>
              <button
                className="btn btn-secondary"
                onClick={resetInputs}
                disabled={loading}
              >
                Reset
              </button>
            </div>
          </div>
        </div>

        {/* RESULT PANEL */}
        <div className="result-panel">
          {loading && (
            <div className="card" style={{ textAlign: "center", padding: "3rem" }}>
              <div className="loading" style={{ width: "40px", height: "40px", margin: "0 auto 1rem" }}></div>
              <h3>Processing Content...</h3>
              <p style={{ color: "#94a3b8" }}>Running multimodal fusion and deepfake checks.</p>
            </div>
          )}

          {!loading && !result && (
            <div className="card" style={{ textAlign: "center", padding: "3rem" }}>
              <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>🤖</div>
              <h3>System Standby</h3>
              <p style={{ color: "#94a3b8" }}>Upload content and click "Analyze" to begin.</p>
            </div>
          )}

          {!loading && result && (
            <div>
              <div style={{ marginBottom: "2rem" }}>
                <h2>Analysis Results</h2>
              </div>
              <ResultVisualization result={result} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default TryNow;