import pytesseract
from PIL import Image

# Windows explicit path (safe even if PATH is set)
pytesseract.pytesseract.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"


def extract_text_from_image(image_path):
    try:
        image = Image.open(image_path)
        text = pytesseract.image_to_string(image)

        cleaned_text = text.strip()

        # Ignore very small detections
        if len(cleaned_text) < 5:
            return None

        return cleaned_text

    except Exception:
        return None