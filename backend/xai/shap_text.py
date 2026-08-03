import torch
import shap
import numpy as np
from transformers import AutoTokenizer, AutoModelForSequenceClassification
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "..", "models", "text_model_isot")

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

tokenizer = AutoTokenizer.from_pretrained(MODEL_PATH, local_files_only=True)
model = AutoModelForSequenceClassification.from_pretrained(MODEL_PATH, local_files_only=True)

model.to(device)
model.eval()


def predict_proba(texts):

    # SHAP sometimes sends numpy arrays
    if not isinstance(texts, list):
        texts = list(texts)

    # Force everything to string
    texts = [str(t) for t in texts]

    batch_size = 16
    all_probs = []

    for i in range(0, len(texts), batch_size):
        batch_texts = texts[i:i + batch_size]
        inputs = tokenizer(
            batch_texts,
            padding=True,
            truncation=True,
            max_length=128,
            return_tensors="pt"
        ).to(device)

        with torch.no_grad():
            outputs = model(**inputs)
            probs = torch.softmax(outputs.logits, dim=1)
            all_probs.append(probs.cpu().numpy())

    return np.vstack(all_probs)


masker = None
explainer = None


def get_explainer():
    global masker, explainer

    if explainer is None:
        masker = shap.maskers.Text(tokenizer)
        explainer = shap.Explainer(predict_proba, masker)

    return explainer


def explain_text(text):
    explainer_instance = get_explainer()
    shap_values = explainer_instance([text])

    tokens = shap_values.data[0]
    values = shap_values.values[0][:, 1]

    # Normalize values by max absolute value to ensure frontend visibility
    max_val = np.max(np.abs(values))
    if max_val > 0:
        values = values / max_val

    explanation = []

    for token, value in zip(tokens, values):
        if token.strip() and token not in ["[CLS]", "[SEP]"]:
            if abs(value) >= 0.05:
                explanation.append({
                    "token": token,
                    "importance": round(float(value), 4)
                })

    return explanation