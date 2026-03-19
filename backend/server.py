from flask import Flask, request, jsonify
from flask_cors import CORS
import os

# Your existing modules
from text_module import predict_text_module
from image_text_module import check_image_text_consistency
from fusion_module import multimodal_fusion
from xai.shap_text import explain_text
from ocr_module import extract_text_from_image

# Deepfake Module
from deepfake_module import DeepfakeDetector

app = Flask(__name__)
CORS(app)

# Setup absolute paths to prevent "File Not Found" errors
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
UPLOAD_FOLDER = os.path.join(BASE_DIR, "uploads")
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# -------------------
# INITIALIZE MODELS
# -------------------
# Double-check this filename in your D:\FISAT\...\backend\models\ folder
MODEL_FILENAME = "deepfake_resnet50.pth" 
MODEL_PATH = os.path.join(BASE_DIR, "models", MODEL_FILENAME)

try:
    deepfake_detector = DeepfakeDetector(MODEL_PATH)
    print(f"✅ SUCCESS: Deepfake model loaded from {MODEL_PATH}")
except Exception as e:
    print(f"❌ ERROR: Could not load model. Check if {MODEL_FILENAME} exists in the models folder.")
    print(f"Technical details: {e}")
    deepfake_detector = None

@app.route("/api/analyze", methods=["POST"])
def analyze():
    text = request.form.get("text")
    image_file = request.files.get("image")
    check_deepfake = request.form.get("check_deepfake") == "true"

    response = {}
    image_path = None

    # 1. Handle Image Upload & Deepfake Scan
    if image_file:
        image_path = os.path.join(UPLOAD_FOLDER, image_file.filename)
        image_file.save(image_path)
        
        if check_deepfake and deepfake_detector:
            # Predict returns {fake_probability, is_deepfake, heatmap}
            response["deepfake_analysis"] = deepfake_detector.predict(image_path)

    # 2. OCR Fallback
    if not text and image_path:
        text = extract_text_from_image(image_path)

    # 3. Text Analysis
    if text:
        response["text"] = predict_text_module(text)

    # 4. Consistency Check
    if image_path and request.form.get("text"):
        image_result = check_image_text_consistency(request.form.get("text"), image_path)
        response["image"] = {
            "consistency_score": image_result["consistency_score"],
            "mismatch_probability": image_result["mismatch_probability"],
            "decision": image_result["decision"]
        }

    # 5. Multimodal Fusion
    fusion_result = multimodal_fusion(text=response.get("text"), image=response.get("image"))
    if fusion_result:
        response["fusion"] = fusion_result

    return jsonify(response)

@app.route("/api/explain", methods=["POST"])
def explain():
    text = request.form.get("text")
    image_file = request.files.get("image")
    check_deepfake = request.form.get("check_deepfake") == "true"

    explanation = {}
    image_path = None

    if image_file:
        image_path = os.path.join(UPLOAD_FOLDER, image_file.filename)
        # Note: In a production app, we'd avoid re-saving, but for local XAI it's fine.
        image_file.save(image_path)

    # Deepfake Heatmap (Grad-CAM)
    if check_deepfake and image_path and deepfake_detector:
        df_explanation = deepfake_detector.predict(image_path)
        explanation["deepfake_heatmap"] = df_explanation.get("heatmap")

    # Text SHAP Explanation
    if text and text.strip():
        explanation["text_explanation"] = explain_text(text.strip())
    elif image_path:
        ocr_text = extract_text_from_image(image_path)
        if ocr_text:
            explanation["ocr_text"] = ocr_text
            explanation["text_explanation"] = explain_text(ocr_text)

    return jsonify(explanation)

if __name__ == "__main__":
    # Port 5000 is standard for Flask/React setups
    app.run(debug=True, port=5000)