from flask import Flask, request, jsonify
from flask_cors import CORS
import os

from text_module import predict_text_module
from image_text_module import check_image_text_consistency
from fusion_module import multimodal_fusion

app = Flask(__name__)
CORS(app)

UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)


@app.route("/api/analyze", methods=["POST"])
def analyze():
    
    
    print("FORM DATA:", request.form)
    print("FILES:", request.files)
    text = request.form.get("text")
    image_file = request.files.get("image")
    # video_file = request.files.get("video")  # Add later

    response = {}

    # -------------------
    # TEXT MODULE
    # -------------------
    if text:
        text_result = predict_text_module(text)
        response["text"] = {
            "fake_probability": text_result["fake_probability"],
            "emotion": text_result["emotion"],
            "emotion_confidence": text_result["emotion_score"]
        }

    # -------------------
    # IMAGE-TEXT MODULE
    # -------------------
    if image_file and text:
        image_path = os.path.join(UPLOAD_FOLDER, image_file.filename)
        image_file.save(image_path)

        image_result = check_image_text_consistency(text, image_path)

        response["image"] = {
            "consistency_score": image_result["consistency_score"],
            "mismatch_probability": image_result["mismatch_probability"],
            "decision": image_result["decision"]
        }

    # -------------------
    # FUSION MODULE (Dynamic)
    # -------------------
    fusion_result = multimodal_fusion(
        text=response.get("text"),
        image=response.get("image"),
        video=None  # Add video later
    )

    if fusion_result:
        response["fusion"] = fusion_result

    return jsonify(response)


if __name__ == "__main__":
    app.run(debug=True)