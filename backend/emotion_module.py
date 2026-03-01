import torch
from transformers import AutoTokenizer, AutoModelForSequenceClassification

# Device
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

# Load model and tokenizer manually
model_name = "bhadresh-savani/bert-base-go-emotion"

tokenizer = AutoTokenizer.from_pretrained(model_name)
model = AutoModelForSequenceClassification.from_pretrained(model_name)

model.to(device)
model.eval()

# Emotion labels (GoEmotions 27 labels)
labels = model.config.id2label


def detect_emotion(text):

    inputs = tokenizer(
        text,
        return_tensors="pt",
        truncation=True,
        padding=True
    ).to(device)

    with torch.no_grad():
        outputs = model(**inputs)
        probs = torch.sigmoid(outputs.logits)[0]   # IMPORTANT: sigmoid for multi-label

    # Convert to list of {label, score}
    emotion_scores = []
    for i, score in enumerate(probs):
        emotion_scores.append({
            "label": labels[i],
            "score": score.item()
        })

    # Sort descending
    sorted_scores = sorted(
        emotion_scores,
        key=lambda x: x["score"],
        reverse=True
    )

    top_emotions = sorted_scores[:3]

    return {
        "emotion": top_emotions[0]["label"],
        "emotion_score": round(top_emotions[0]["score"], 4),
        "top_emotions": [
            {
                "label": emo["label"],
                "score": round(emo["score"], 4)
            }
            for emo in top_emotions
        ]
    }


# Test
if __name__ == "__main__":
    sample_text = "I absolutely hate what they have done."
    result = detect_emotion(sample_text)
    print(result)