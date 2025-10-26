import numpy as np
from sklearn.ensemble import IsolationForest
from typing import Dict, List, Optional
import joblib
import os
from datetime import datetime

class TrustScorer:
    def __init__(self, model_path: Optional[str] = None):
        """
        Initialize TrustScorer with optional pre-trained model.
        """
        if model_path and os.path.exists(model_path):
            self.model = joblib.load(model_path)
        else:
            self.model = IsolationForest(
                contamination=0.1,
                random_state=42
            )
    
    def _extract_features(self, 
                         activation_time: datetime,
                         return_timestamp: datetime,
                         return_attempts: int,
                         label_match_score: float) -> np.ndarray:
        """
        Extract features for trust scoring.
        """
        # Calculate time difference in hours
        time_diff = (return_timestamp - activation_time).total_seconds() / 3600
        
        # Create feature vector
        features = np.array([
            time_diff,  # Time since activation
            return_attempts,  # Number of previous return attempts
            label_match_score,  # Label verification score
        ]).reshape(1, -1)
        
        return features

    def calculate_trust_score(self,
                            activation_time: datetime,
                            return_timestamp: datetime,
                            return_attempts: int,
                            label_match_score: float,
                            previous_returns: List[Dict] = None) -> Dict[str, float]:
        """
        Calculate trust score for a return request.
        
        Args:
            activation_time: When the product was activated
            return_timestamp: When the return was requested
            return_attempts: Number of previous return attempts
            label_match_score: Score from label verification (0-1)
            previous_returns: List of previous return attempts (optional)
            
        Returns:
            Dict containing trust score and risk factors
        """
        try:
            # Extract features
            features = self._extract_features(
                activation_time,
                return_timestamp,
                return_attempts,
                label_match_score
            )
            
            # Calculate anomaly score (-1 for anomalies, 1 for normal samples)
            anomaly_score = self.model.predict(features)[0]
            
            # Convert to trust score (0-1 range)
            trust_score = (anomaly_score + 1) / 2
            
            # Apply business rules
            risk_factors = []
            
            # Check time since activation
            hours_since_activation = features[0, 0]
            if hours_since_activation < 24:
                trust_score *= 0.7
                risk_factors.append("Very quick return")
            elif hours_since_activation > 720:  # 30 days
                trust_score *= 0.9
                risk_factors.append("Late return")
                
            # Check return attempts
            if return_attempts > 0:
                trust_score *= 0.8
                risk_factors.append("Multiple return attempts")
                
            # Check label verification
            if label_match_score < 0.7:
                trust_score *= 0.6
                risk_factors.append("Label verification failed")
                
            # Ensure score is in [0,1] range
            trust_score = max(0.0, min(1.0, trust_score))
            
            return {
                "trustScore": float(trust_score),
                "riskLevel": "high" if trust_score < 0.5 else "medium" if trust_score < 0.8 else "low",
                "riskFactors": risk_factors,
                "confidence": 0.8 if label_match_score > 0.8 else 0.6
            }
            
        except Exception as e:
            return {
                "trustScore": 0.0,
                "riskLevel": "high",
                "riskFactors": ["Error in trust calculation"],
                "confidence": 0.0,
                "error": str(e)
            }
    
    def train(self, training_data: List[Dict]):
        """
        Train the model on historical return data.
        """
        if not training_data:
            return
            
        features_list = []
        for data in training_data:
            features = self._extract_features(
                data["activation_time"],
                data["return_timestamp"],
                data["return_attempts"],
                data.get("label_match_score", 1.0)
            )
            features_list.append(features[0])
            
        X = np.array(features_list)
        self.model.fit(X)
    
    def save_model(self, model_path: str):
        """
        Save the trained model to disk.
        """
        joblib.dump(self.model, model_path)