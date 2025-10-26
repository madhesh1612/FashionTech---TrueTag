import cv2
import numpy as np
from PIL import Image
import base64
import io
from typing import Dict, Tuple

class LabelAnalyzer:
    def __init__(self):
        # Initialize feature detector
        self.sift = cv2.SIFT_create()
        
        # FLANN matcher parameters
        FLANN_INDEX_KDTREE = 1
        index_params = dict(algorithm=FLANN_INDEX_KDTREE, trees=5)
        search_params = dict(checks=50)
        self.flann = cv2.FlannBasedMatcher(index_params, search_params)

    def _preprocess_image(self, image: np.ndarray) -> np.ndarray:
        """Preprocess image for feature detection."""
        # Convert to grayscale if needed
        if len(image.shape) == 3:
            gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        else:
            gray = image
        
        # Apply adaptive histogram equalization
        clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8,8))
        return clahe.apply(gray)

    def _decode_base64_image(self, base64_string: str) -> np.ndarray:
        """Decode base64 image to numpy array."""
        # Remove data URL prefix if present
        if ',' in base64_string:
            base64_string = base64_string.split(',')[1]
        
        # Decode base64 to image
        img_data = base64.b64decode(base64_string)
        img = Image.open(io.BytesIO(img_data))
        return cv2.cvtColor(np.array(img), cv2.COLOR_RGB2BGR)

    def _extract_label_region(self, image: np.ndarray, coordinates: Dict[str, float]) -> np.ndarray:
        """Extract label region using provided coordinates."""
        x, y = int(coordinates['x']), int(coordinates['y'])
        w, h = int(coordinates['width']), int(coordinates['height'])
        return image[y:y+h, x:x+w]

    def analyze_label(self, image_base64: str, expected_coordinates: Dict[str, float]) -> Dict[str, float]:
        """
        Analyze label placement and authenticity.
        
        Args:
            image_base64: Base64 encoded image
            expected_coordinates: Dict with x, y, width, height of expected label position
            
        Returns:
            Dict with match score and confidence
        """
        try:
            # Decode and preprocess image
            image = self._decode_base64_image(image_base64)
            processed_image = self._preprocess_image(image)
            
            # Extract label region
            label_region = self._extract_label_region(processed_image, expected_coordinates)
            
            # Detect features in label region
            keypoints, descriptors = self.sift.detectAndCompute(label_region, None)
            
            if descriptors is None or len(keypoints) < 10:
                return {
                    "labelMatch": False,
                    "score": 0.0,
                    "confidence": 1.0,
                    "error": "Insufficient features detected"
                }
            
            # Compare with surrounding region
            surrounding_region = processed_image[
                max(0, int(expected_coordinates['y'] - expected_coordinates['height'])):
                min(processed_image.shape[0], int(expected_coordinates['y'] + 2 * expected_coordinates['height'])),
                max(0, int(expected_coordinates['x'] - expected_coordinates['width'])):
                min(processed_image.shape[1], int(expected_coordinates['x'] + 2 * expected_coordinates['width']))
            ]
            
            # Detect features in surrounding region
            surr_keypoints, surr_descriptors = self.sift.detectAndCompute(surrounding_region, None)
            
            if surr_descriptors is None:
                return {
                    "labelMatch": True,
                    "score": 0.8,  # High score since no competing features found
                    "confidence": 0.7
                }
            
            # Match features
            matches = self.flann.knnMatch(descriptors, surr_descriptors, k=2)
            
            # Apply ratio test
            good_matches = []
            for m, n in matches:
                if m.distance < 0.7 * n.distance:
                    good_matches.append(m)
            
            # Calculate score
            match_score = len(good_matches) / len(keypoints) if keypoints else 0
            
            # Calculate confidence based on number of features
            confidence = min(1.0, len(keypoints) / 100)
            
            return {
                "labelMatch": match_score > 0.5,
                "score": float(match_score),
                "confidence": float(confidence)
            }
            
        except Exception as e:
            return {
                "labelMatch": False,
                "score": 0.0,
                "confidence": 0.0,
                "error": str(e)
            }