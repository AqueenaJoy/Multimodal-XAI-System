def multimodal_fusion(text=None, image=None, deepfake=None):
    """
    Intelligent dynamic fusion across text, image, and deepfake modules.
    """

    scores = {}
    weights = {}

    # ================================
    # TEXT MODULE
    # ================================
    if text:
        c_text = text["fake_probability"]
        confidence = text.get("confidence", 0.5)

        # Dynamic weight: 0.5 → 0.8
        text_weight = 0.5 + (0.3 * confidence)

        scores["text"] = c_text
        weights["text"] = text_weight

  
    # ================================
    # DEEPFAKE MODULE
    # ================================
    if deepfake:
        scores["deepfake"] = deepfake["fake_probability"]
        weights["deepfake"] = 0.1

    # ================================
    # NORMALIZE WEIGHTS
    # ================================
    if not scores:
        return None

    total_weight = sum(weights.values())

    fusion_score = 0
    for key in scores:
        normalized_weight = weights[key] / total_weight
        fusion_score += normalized_weight * scores[key]

    # ================================
    # FINAL LABEL
    # ================================
    if fusion_score >= 0.75:
        label = "High Fake Content Risk"
    elif fusion_score >= 0.55:
        label = "Moderate Fake Content Risk"
    elif fusion_score >= 0.35:
        label = "Moderately Authentic Content"
    else:
        label = "Highly Authentic Content"

    # ================================
    # RETURN OUTPUT
    # ================================
    return {
        "score": round(fusion_score, 4),
        "label": label,
        "modalities_used": list(scores.keys()),
        "weights": {k: round(v / total_weight, 3) for k, v in weights.items()}
    }