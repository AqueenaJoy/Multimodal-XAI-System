def multimodal_fusion(text=None, image=None):
    """
    Perform dynamic late-fusion across available modalities.
    Each modality must provide fake probability (0–1).
    """

   
    # STANDARD FUSION LOGIC
  
    # Default weights
    weights = {
        "text": 0.8,
        "image": 0.2
    }

    scores = {}

    # Collect fake probabilities
    if text:
        scores["text"] = text["fake_probability"]

    if image:
        scores["image"] = image["mismatch_probability"]

    if not scores:
        return None

    # Normalize weights based on active modalities
    active_weight_sum = sum(weights[k] for k in scores.keys())

    fusion_score = 0
    for key in scores:
        normalized_weight = weights[key] / active_weight_sum
        fusion_score += normalized_weight * scores[key]

    if fusion_score >= 0.70:
        label = "High Fake News Risk"
    elif fusion_score >= 0.50:
        label = "Moderate Fake News Risk"
    elif fusion_score >= 0.30:
        label = "Moderately Authentic"
    else:
        label = "Highly Authentic News"

    return {
        "score": round(fusion_score, 4),
        "label": label,
        "modalities_used": list(scores.keys())
    }