import torch
import os
from transformers import AutoTokenizer, AutoModelForSequenceClassification
from emotion_module import detect_emotion

# ================================
# DEVICE SETUP
# ================================
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# ================================
# LOAD ISOT MODEL
# ================================
MODEL_PATH = os.path.join(BASE_DIR, "models", "text_model_isot")

tokenizer = AutoTokenizer.from_pretrained(MODEL_PATH)
model = AutoModelForSequenceClassification.from_pretrained(MODEL_PATH)

model.to(device)
model.eval()


# ================================
# BASE TEXT PREDICTION
# ================================
def predict_text(text):
    inputs = tokenizer(
        text,
        truncation=True,
        padding=True,
        max_length=128,
        return_tensors="pt"
    ).to(device)

    with torch.no_grad():
        outputs = model(**inputs)
        probs = torch.softmax(outputs.logits, dim=1)

    # LABEL_1 = FAKE
    fake_prob = probs[0][1].item()
    return fake_prob


# ================================
# MANIPULATION DETECTOR
# ================================
def detect_manipulation(text):
    score = 0

    # ALL CAPS
    if text.isupper():
        score += 0.3

    # Excess punctuation
    score += min(text.count("!") * 0.05, 0.3)
    score += min(text.count("?") * 0.05, 0.3)

    # Clickbait keywords
    clickbait_words = [
        "shocking", "breaking", "urgent",
        "unbelievable", "must watch", "exclusive"
    ]

    text_lower = text.lower()
    for word in clickbait_words:
        if word in text_lower:
            score += 0.2

    return min(score, 1.0)


# ================================
# FINAL TEXT MODULE
# ================================
def predict_text_module(text):

    # 1. Base model prediction
    c_text = predict_text(text)

    # 2. Emotion analysis
    emotion_data = detect_emotion(text)
    e_risk = emotion_data["emotion_score"]

    # 3. Manipulation detection
    m_score = detect_manipulation(text)

    # 4. Final score (YOUR SIGNATURE FORMULA)
    final_score = (
        0.75 * c_text +
        0.15 * e_risk +
        0.10 * m_score
    )

    # 5. Confidence
    confidence = abs(0.5 - final_score) * 2

    return {
        "fake_probability": round(final_score, 4),
        "base_model_score": round(c_text, 4),
        "emotion": emotion_data["emotion"],
        "emotion_score": round(e_risk, 4),
        "manipulation_score": round(m_score, 4),
        "confidence": round(confidence, 4),
        "top_emotions": emotion_data.get("top_emotions", [])
    }