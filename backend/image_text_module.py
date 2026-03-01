import torch
from PIL import Image
from transformers import CLIPProcessor, CLIPModel

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

# Load once
model = CLIPModel.from_pretrained("openai/clip-vit-base-patch32").to(device)
processor = CLIPProcessor.from_pretrained("openai/clip-vit-base-patch32")


def check_image_text_consistency(text, image_path):

    try:
        image = Image.open(image_path).convert("RGB")
    except Exception as e:
        return {
            "error": f"Unable to open image: {str(e)}"
        }

    candidate_texts = [
        text,
        "This image does not match the given text description"
    ]

    inputs = processor(
        text=candidate_texts,
        images=image,
        return_tensors="pt",
        padding=True
    ).to(device)

    with torch.no_grad():
        outputs = model(**inputs)

    logits = outputs.logits_per_image
    probs = torch.softmax(logits, dim=1)

    match_score = probs[0][0].item()
    mismatch_prob = 1 - match_score

    # Decision Threshold
    if match_score > 0.75:
        decision = "Strong Match"
    elif match_score > 0.4:
        decision = "Moderate Match"
    else:
        decision = "Potential Mismatch"

    return {
        "consistency_score": round(match_score, 4),
        "mismatch_probability": round(mismatch_prob, 4),
        "decision": decision
    }