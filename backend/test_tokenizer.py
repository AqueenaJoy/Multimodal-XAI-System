import os
import sys

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
sys.path.append(BASE_DIR)

from xai.shap_text import get_explainer

if __name__ == "__main__":
    text = "Swedish DJ Avicii Tried To Expose Pedophile Ring In Video Before He Died"
    try:
        explainer = get_explainer()
        shap_values = explainer([text])
        print("Tokens data:", shap_values.data[0])
    except Exception as e:
        import traceback
        traceback.print_exc()
