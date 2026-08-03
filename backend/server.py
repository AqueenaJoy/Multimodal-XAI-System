from flask import Flask, request, jsonify
from flask_cors import CORS
import os

# Modules
from text_module import predict_text_module
from image_text_module import check_image_text_consistency
from fusion_module import multimodal_fusion
from xai.shap_text import explain_text
from ocr_module import extract_text_from_image
from deepfake_module import DeepfakeDetector

app = Flask(__name__)
CORS(app)

# ================================
# PATH SETUP
# ================================
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
UPLOAD_FOLDER = os.path.join(BASE_DIR, "uploads")
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# ================================
# LOAD DEEPFAKE MODEL
# ================================
MODEL_FILENAME = "deepfake_resnet50.pth"
MODEL_PATH = os.path.join(BASE_DIR, "models", MODEL_FILENAME)

try:
    deepfake_detector = DeepfakeDetector(MODEL_PATH)
    print(f"✅ Deepfake model loaded from {MODEL_PATH}")
except Exception as e:
    print(f"❌ Failed to load deepfake model: {e}")
    deepfake_detector = None


# ================================
# MAIN ANALYSIS API
# ================================
@app.route("/api/analyze", methods=["POST"])
def analyze():
    text = request.form.get("text")
    image_file = request.files.get("image")
    check_deepfake = request.form.get("check_deepfake") == "true"

    response = {}
    image_path = None

    # -------------------------------
    # 1. HANDLE IMAGE UPLOAD
    # -------------------------------
    if image_file:
        image_path = os.path.join(UPLOAD_FOLDER, image_file.filename)
        image_file.save(image_path)

        # Deepfake Analysis
        if check_deepfake and deepfake_detector:
            response["deepfake_analysis"] = deepfake_detector.predict(image_path)

    # -------------------------------
    # 2. OCR FALLBACK (if no text)
    # -------------------------------
    if not text and image_path:
        ocr_text = extract_text_from_image(image_path)
        if ocr_text:
            text = ocr_text
            response["ocr_text"] = ocr_text 

    # -------------------------------
    # 3. TEXT ANALYSIS
    # -------------------------------
    if text:
        response["text"] = predict_text_module(text)

    # -------------------------------
    # 4. IMAGE-TEXT CONSISTENCY
    # -------------------------------
    if image_path and text:
        image_result = check_image_text_consistency(text, image_path)

        response["image"] = {
            "consistency_score": image_result["consistency_score"],
            "mismatch_probability": image_result["mismatch_probability"],
            "decision": image_result["decision"]
        }

    # -------------------------------
    # 5. MULTIMODAL FUSION (UPDATED)
    # -------------------------------
    fusion_result = multimodal_fusion(
        text=response.get("text"),
        image=response.get("image"),
        deepfake=response.get("deepfake_analysis")
    )

    if fusion_result:
        response["fusion"] = fusion_result

    return jsonify(response)


# ================================
# EXPLAINABILITY API
# ================================
@app.route("/api/explain", methods=["POST"])
def explain():
    text = request.form.get("text")
    image_file = request.files.get("image")
    check_deepfake = request.form.get("check_deepfake") == "true"

    explanation = {}
    image_path = None

    # -------------------------------
    # SAVE IMAGE
    # -------------------------------
    if image_file:
        image_path = os.path.join(UPLOAD_FOLDER, image_file.filename)
        image_file.save(image_path)

    # -------------------------------
    # DEEPFAKE HEATMAP (Grad-CAM)
    # -------------------------------
    if check_deepfake and image_path and deepfake_detector:
        df_result = deepfake_detector.predict(image_path)
        explanation["deepfake_heatmap"] = df_result.get("heatmap")

    # -------------------------------
    # TEXT SHAP EXPLANATION
    # -------------------------------
    if text and text.strip():
        explanation["text_explanation"] = explain_text(text.strip())

    elif image_path:
        ocr_text = extract_text_from_image(image_path)
        if ocr_text:
            explanation["ocr_text"] = ocr_text
            explanation["text_explanation"] = explain_text(ocr_text)

    return jsonify(explanation)


# ================================
# RUN SERVER
# ================================
if __name__ == "__main__":
    app.run(debug=True, port=5000)