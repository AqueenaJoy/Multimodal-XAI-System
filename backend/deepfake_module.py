import torch
import torch.nn as nn
from torchvision import models, transforms
import cv2
import numpy as np
from PIL import Image

class DeepfakeDetector:
    def __init__(self, model_path):
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        # Recreate the exact ResNet50 structure from your Colab
        self.model = models.resnet50(weights=None)
        num_features = self.model.fc.in_features
        self.model.fc = nn.Linear(num_features, 2)
        
        # Load the 95% accuracy weights
        self.model.load_state_dict(torch.load(model_path, map_location=self.device))
        self.model.to(self.device).eval()
        
        self.gradients = None
        self.activations = None
        self._register_hooks()

    def _register_hooks(self):
        # Target layer for ResNet50 heatmaps is layer4
        target_layer = self.model.layer4[-1]
        target_layer.register_forward_hook(lambda m, i, o: setattr(self, 'activations', o))
        target_layer.register_full_backward_hook(lambda m, gi, go: setattr(self, 'gradients', go[0]))

    def predict(self, image_path):
        img = Image.open(image_path).convert('RGB')
        preprocess = transforms.Compose([
            transforms.Resize((224, 224)),
            transforms.ToTensor(),
            transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
        ])
        input_tensor = preprocess(img).unsqueeze(0).to(self.device)

        with torch.enable_grad():
            logits = self.model(input_tensor)
            probs = torch.softmax(logits, dim=1)
            # Assuming Class 0 = Fake, Class 1 = Real
            fake_score = probs[0][0].item()
            
            # Generate Heatmap
            self.model.zero_grad()
            logits[0, 0].backward()
            weights = torch.mean(self.gradients, dim=(2, 3), keepdim=True)
            cam = torch.sum(weights * self.activations, dim=1).squeeze().detach().cpu().numpy()
            cam = np.maximum(cam, 0)
            cam = cv2.resize(cam, (224, 224))
            cam = (cam - cam.min()) / (cam.max() - cam.min() + 1e-8)

        return {
            "fake_probability": round(fake_score, 4),
            "is_deepfake": fake_score > 0.5,
            "heatmap": cam.tolist() 
        }