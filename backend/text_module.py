import torch
import os
from transformers import AutoTokenizer, AutoModelForSequenceClassification
from emotion_module import detect_emotion

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "models", "text_model_fnn")

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

# Load once
tokenizer = AutoTokenizer.from_pretrained(MODEL_PATH, local_files_only=True)
model = AutoModelForSequenceClassification.from_pretrained(MODEL_PATH, local_files_only=True)

model.to(device)
model.eval()


def predict_text_module(text):

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
        model_fake_prob = probs[0][1].item()

    # -------- Short Text Stabilization --------
    if len(text.split()) <= 7:
        fake_prob = 0.5
    else:
        fake_prob = model_fake_prob

    emotion_data = detect_emotion(text)

    return {
        "fake_probability": round(fake_prob, 4),
        "emotion": emotion_data["emotion"],
        "emotion_score": round(emotion_data["emotion_score"], 4)
    }