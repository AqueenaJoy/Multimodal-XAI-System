def multimodal_fusion(text=None, image=None, video=None):
    """
    Perform dynamic late-fusion across available modalities.
    Each modality must provide fake probability (0–1).
    """

    # Default weights
    weights = {
    "text": 0.7,
    "image": 0.2,
    "video": 0.1
}

    scores = {}

    # Collect fake probabilities
    if text:
        scores["text"] = text["fake_probability"]

    if image:
        scores["image"] = image["mismatch_probability"]

    if video:
        scores["video"] = video["fake_probability"]

    # If no modalities provided
    if not scores:
        return None

    # Normalize weights based on active modalities
    active_weight_sum = sum(weights[k] for k in scores.keys())

    fusion_score = 0
    for key in scores:
        normalized_weight = weights[key] / active_weight_sum
        fusion_score += normalized_weight * scores[key]

    # Final decision
    label = "Likely Fake" if fusion_score > 0.5 else "Likely Authentic"

    # Confidence = distance from uncertainty boundary (0.5)
    confidence = abs(fusion_score - 0.5) * 2

    return {
        "score": round(fusion_score, 4),
        "label": label,
        "confidence": round(confidence, 4),
        "modalities_used": list(scores.keys())
    }