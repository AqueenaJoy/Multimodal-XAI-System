import torch
import os
from transformers import AutoTokenizer, AutoModelForSequenceClassification
from emotion_module import detect_emotion


device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# ================================
# LOAD FNN STYLE MODEL
# ================================
# Reverting to the local custom-trained model as community HF models are severely overfitted
FNN_PATH = os.path.join(BASE_DIR, "models", "text_model_fnn")

fnn_tokenizer = AutoTokenizer.from_pretrained(FNN_PATH)
fnn_model = AutoModelForSequenceClassification.from_pretrained(FNN_PATH)

fnn_model.to(device)
fnn_model.eval()

# ================================
# LOAD LIAR CLAIM MODEL
# ================================
LIAR_PATH = os.path.join(BASE_DIR, "models", "liar_binary_model")

liar_tokenizer = AutoTokenizer.from_pretrained(LIAR_PATH)
liar_model = AutoModelForSequenceClassification.from_pretrained(LIAR_PATH)

liar_model.to(device)
liar_model.eval()


# ================================
# STYLE PREDICTION (FNN)
# ================================
def predict_style(text):

    inputs = fnn_tokenizer(
        text,
        truncation=True,
        padding=True,
        max_length=128,
        return_tensors="pt"
    ).to(device)

    with torch.no_grad():
        outputs = fnn_model(**inputs)
        probs = torch.softmax(outputs.logits, dim=1)

    fake_prob = probs[0][1].item()
    return fake_prob


# ================================
# CLAIM PREDICTION (LIAR)
# ================================
def predict_claim(text):

    inputs = liar_tokenizer(
        text,
        truncation=True,
        padding=True,
        max_length=128,
        return_tensors="pt"
    ).to(device)

    with torch.no_grad():
        outputs = liar_model(**inputs)
        probs = torch.softmax(outputs.logits, dim=1)

    fake_prob = probs[0][0].item()
    return fake_prob


# ================================
# COMBINED TEXT MODULE
# ================================
def predict_text_module(text):

    # Style-based fake probability
    style_fake = predict_style(text)

    # Claim-based fake probability
    claim_fake = predict_claim(text)

    # Weighted combination (60% claim, 40% style)
    combined_fake = (0.4 * style_fake) + (0.6 * claim_fake)

    # Emotion detection
    emotion_data = detect_emotion(text)

    return {
        "style_fake_probability": round(style_fake, 4),
        "claim_fake_probability": round(claim_fake, 4),
        "fake_probability": round(combined_fake, 4),  # For fusion compatibility
        "emotion": emotion_data["emotion"],
        "emotion_score": round(emotion_data["emotion_score"], 4),
        "top_emotions": emotion_data.get("top_emotions", [])
    }