import pytest
from fastapi.testclient import TestClient
import base64
import json
from datetime import datetime, timedelta
import os

from app import app
from label_analyzer import LabelAnalyzer
from trust_scorer import TrustScorer

# Initialize test client
client = TestClient(app)

# Test data
SAMPLE_IMAGE_BASE64 = base64.b64encode(b"dummy_image_data").decode()
SAMPLE_COORDINATES = {
    "x": 100,
    "y": 100,
    "width": 200,
    "height": 100
}

def test_health_check():
    """Test the health check endpoint."""
    response = client.get("/")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"

def test_label_analysis():
    """Test the label analysis endpoint."""
    request_data = {
        "productId": "TEST123",
        "image": SAMPLE_IMAGE_BASE64,
        "expectedCoordinates": SAMPLE_COORDINATES
    }
    
    response = client.post("/analyze/label", json=request_data)
    assert response.status_code == 200
    
    data = response.json()
    assert "labelMatch" in data
    assert "score" in data
    assert "confidence" in data
    assert "timestamp" in data

def test_trust_score():
    """Test the trust score endpoint."""
    request_data = {
        "productId": "TEST123",
        "userId": "USER456",
        "activationTime": datetime.now().isoformat(),
        "returnAttempts": 0,
        "image": SAMPLE_IMAGE_BASE64
    }
    
    response = client.post("/analyze/trust", json=request_data)
    assert response.status_code == 200
    
    data = response.json()
    assert "trustScore" in data
    assert "riskLevel" in data
    assert "riskFactors" in data
    assert "confidence" in data
    assert "timestamp" in data

def test_trust_score_high_risk():
    """Test trust score for suspicious return attempt."""
    request_data = {
        "productId": "TEST123",
        "userId": "USER456",
        "activationTime": datetime.now().isoformat(),  # Just activated
        "returnAttempts": 3,  # Multiple attempts
        "image": SAMPLE_IMAGE_BASE64
    }
    
    response = client.post("/analyze/trust", json=request_data)
    assert response.status_code == 200
    
    data = response.json()
    assert data["riskLevel"] == "high"
    assert len(data["riskFactors"]) > 0

def test_trust_score_low_risk():
    """Test trust score for legitimate return attempt."""
    request_data = {
        "productId": "TEST123",
        "userId": "USER456",
        "activationTime": (datetime.now() - timedelta(days=14)).isoformat(),  # 2 weeks ago
        "returnAttempts": 0,  # First attempt
        "image": SAMPLE_IMAGE_BASE64
    }
    
    response = client.post("/analyze/trust", json=request_data)
    assert response.status_code == 200
    
    data = response.json()
    assert data["riskLevel"] == "low"

if __name__ == "__main__":
    pytest.main([__file__])