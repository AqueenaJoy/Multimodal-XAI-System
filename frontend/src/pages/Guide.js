function Guide() {
  return (
    <section className="section">
      <h2>How It Works</h2>

      <div className="guide-grid">
        <div className="card">
          <h3>1. Input Modalities</h3>
          <p>
            Provide text, image, video — individually or in combination.
          </p>
        </div>

        <div className="card">
          <h3>2. AI Analysis</h3>
          <p>
            NLP (BERT + Emotion), CLIP-based semantic reasoning,
            and Xception deepfake detection process the inputs.
          </p>
        </div>

        <div className="card">
          <h3>3. Multimodal Fusion</h3>
          <p>
            A weighted fusion mechanism combines modality scores
            into a final authenticity decision.
          </p>
        </div>

        <div className="card">
          <h3>4. Explainable Output</h3>
          <p>
            The system provides probability scores and interpretable
            visual explanations.
          </p>
        </div>
      </div>
    </section>
  );
}

export default Guide;