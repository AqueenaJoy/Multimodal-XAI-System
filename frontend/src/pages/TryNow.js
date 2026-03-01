import { useState } from "react";
import axios from "axios";
import ModalityIndicator from "../components/ModalityIndicator";
import ResultVisualization from "../components/ResultVisualization";

function TryNow() {
  const [text, setText] = useState("");
  const [image, setImage] = useState(null);
  const [video, setVideo] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const analyze = async () => {
    if (!text.trim() && !image && !video) {
      alert("⚠️ Please provide at least one input modality for analysis.");
      return;
    }

    setLoading(true);
    setResult(null);

    const formData = new FormData();
    if (text.trim()) formData.append("text", text);
    if (image) formData.append("image", image);
    if (video) formData.append("video", video);

    try {
      const res = await axios.post(
        "http://localhost:5000/api/analyze",
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          timeout: 30000
        }
      );
      setResult(res.data);
    } catch (err) {
      console.error("Analysis error:", err);
      if (err.code === 'ECONNABORTED') {
        alert("⏱️ Analysis timed out. Please try with smaller files.");
      } else if (err.response?.status === 500) {
        alert("🔧 Backend server error. Please ensure the backend is running.");
      } else {
        alert("🌐 Error connecting to analysis backend. Please check your connection.");
      }
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
      if (file.type.startsWith('image/')) {
        setImage(file);
        setVideo(null);
      } else if (file.type.startsWith('video/')) {
        setVideo(file);
        setImage(null);
      }
    }
  };

  const resetInputs = () => {
    setText("");
    setImage(null);
    setVideo(null);
    setResult(null);
  };

  return (
    <div className="container">
      <div className="hero" style={{paddingBottom: '2rem'}}>
        <h1>Multimodal Analysis</h1>
        <p>Upload text, images, or videos for comprehensive misinformation detection</p>
      </div>

      <div className="two-column">
        <div className="input-panel">
          <div className="card">
            <h2>📥 Input Modalities</h2>
            
            <div className="modality-indicator" style={{marginBottom: '2rem'}}>
              <ModalityIndicator text={text} image={image} video={video} />
            </div>

            <div className="form-group">
              <label className="form-label">📝 Text Input (Optional)</label>
              <textarea
                className="form-textarea"
                placeholder="Enter news headline, social media post, or any text to analyze..."
                value={text}
                onChange={(e) => setText(e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label className="form-label">🖼️ Image Upload (Optional)</label>
              <div 
                className={`file-upload ${dragActive ? 'drag-active' : ''}`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    setImage(e.target.files[0]);
                    setVideo(null);
                  }}
                  disabled={loading}
                />
                <label className="file-upload-label">
                  <div>
                    {image ? (
                      <div>
                        <div style={{fontSize: '2rem', marginBottom: '0.5rem'}}>✅</div>
                        <div>{image.name}</div>
                        <div style={{fontSize: '0.875rem', color: '#94a3b8'}}>
                          {(image.size / 1024 / 1024).toFixed(2)} MB
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div style={{fontSize: '2rem', marginBottom: '0.5rem'}}>📁</div>
                        <div>Click to upload or drag & drop</div>
                        <div style={{fontSize: '0.875rem', color: '#94a3b8'}}>
                          PNG, JPG, GIF up to 10MB
                        </div>
                      </div>
                    )}
                  </div>
                </label>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">🎥 Video Upload (Optional)</label>
              <div 
                className={`file-upload ${dragActive ? 'drag-active' : ''}`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <input
                  type="file"
                  accept="video/*"
                  onChange={(e) => {
                    setVideo(e.target.files[0]);
                    setImage(null);
                  }}
                  disabled={loading}
                />
                <label className="file-upload-label">
                  <div>
                    {video ? (
                      <div>
                        <div style={{fontSize: '2rem', marginBottom: '0.5rem'}}>✅</div>
                        <div>{video.name}</div>
                        <div style={{fontSize: '0.875rem', color: '#94a3b8'}}>
                          {(video.size / 1024 / 1024).toFixed(2)} MB
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div style={{fontSize: '2rem', marginBottom: '0.5rem'}}>📹</div>
                        <div>Click to upload or drag & drop</div>
                        <div style={{fontSize: '0.875rem', color: '#94a3b8'}}>
                          MP4, AVI, MOV up to 50MB
                        </div>
                      </div>
                    )}
                  </div>
                </label>
              </div>
            </div>

            <div style={{display: 'flex', gap: '1rem', marginTop: '2rem'}}>
              <button 
                className="btn btn-primary" 
                onClick={analyze}
                disabled={loading || (!text.trim() && !image && !video)}
                style={{flex: 1}}
              >
                {loading ? (
                  <>
                    <span className="loading"></span>
                    Analyzing...
                  </>
                ) : (
                  "🔍 Analyze"
                )}
              </button>
              
              <button 
                className="btn btn-secondary" 
                onClick={resetInputs}
                disabled={loading}
              >
                🔄 Reset
              </button>
            </div>
          </div>
        </div>

        <div className="result-panel">
          {loading && (
            <div className="card" style={{textAlign: 'center', padding: '3rem'}}>
              <div className="loading" style={{width: '40px', height: '40px', margin: '0 auto 1rem'}}></div>
              <h3>Analyzing Content...</h3>
              <p style={{color: '#94a3b8'}}>
                Our AI models are processing your inputs for comprehensive analysis
              </p>
            </div>
          )}

          {!loading && !result && (
            <div className="card" style={{textAlign: 'center', padding: '3rem'}}>
              <div style={{fontSize: '4rem', marginBottom: '1rem'}}>🤖</div>
              <h3>Ready for Analysis</h3>
              <p style={{color: '#94a3b8'}}>
                Upload content and click "Analyze" to see detailed results
              </p>
            </div>
          )}

          {!loading && result && (
            <div>
              <div style={{marginBottom: '2rem'}}>
                <h2>📊 Analysis Results</h2>
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