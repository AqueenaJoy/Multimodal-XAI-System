import os
import sys

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
sys.path.append(BASE_DIR)

from xai.shap_text import get_explainer

if __name__ == "__main__":
    text = "BREAKING: Aliens land on Earth and steal the moon. Shocking evidence inside!"
    try:
        explainer = get_explainer()
        shap_values = explainer([text])
        print("shap_values.values[0].shape:", shap_values.values[0].shape)
        print("Tokens:", shap_values.data[0])
        print("Values:", shap_values.values[0])
    except Exception as e:
        import traceback
        traceback.print_exc()
