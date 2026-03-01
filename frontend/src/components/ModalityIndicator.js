import React from 'react';

function ModalityIndicator({ text, image, video }) {
  const modalities = [];
  
  if (text && text.trim()) modalities.push({ type: 'text', icon: '📝', label: 'Text' });
  if (image) modalities.push({ type: 'image', icon: '🖼️', label: 'Image' });
  if (video) modalities.push({ type: 'video', icon: '🎥', label: 'Video' });

  if (modalities.length === 0) {
    return (
      <div className="modality-indicator">
        <div className="badge badge-warning">No inputs selected</div>
      </div>
    );
  }

  return (
    <div className="modality-indicator">
      <div style={{fontSize: '0.875rem', color: '#94a3b8', marginBottom: '0.5rem'}}>
        Active Modalities:
      </div>
      <div style={{display: 'flex', gap: '0.5rem', flexWrap: 'wrap'}}>
        {modalities.map((modality, index) => (
          <div key={index} className="badge badge-success">
            {modality.icon} {modality.label}
          </div>
        ))}
      </div>
      {modalities.length > 1 && (
        <div style={{marginTop: '0.5rem', fontSize: '0.75rem', color: '#3b82f6'}}>
          🔄 Multimodal fusion will be applied
        </div>
      )}
    </div>
  );
}

export default ModalityIndicator;
