from fastapi import FastAPI, HTTPException, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from datetime import datetime
import uvicorn
from typing import Dict, Optional
import os
from dotenv import load_dotenv

from label_analyzer import LabelAnalyzer
from trust_scorer import TrustScorer

# Load environment variables
load_dotenv()

app = FastAPI(
    title="TrueTag AI Service",
    description="AI service for product label verification and trust scoring",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize components
label_analyzer = LabelAnalyzer()
trust_scorer = TrustScorer(model_path=os.getenv('TRUST_MODEL_PATH'))

# Request/Response models
class LabelAnalysisRequest(BaseModel):
    productId: str
    image: str  # base64 encoded image
    expectedCoordinates: Dict[str, float]

class TrustScoreRequest(BaseModel):
    productId: str
    userId: str
    activationTime: datetime
    returnAttempts: int
    image: Optional[str] = None

@app.get("/")
async def root():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "service": "TrueTag AI",
        "version": "1.0.0"
    }

@app.post("/analyze/label")
async def analyze_label(request: LabelAnalysisRequest):
    """
    Analyze product label placement and authenticity.
    
    Args:
        productId: Unique product identifier
        image: Base64 encoded image
        expectedCoordinates: Expected label coordinates (x, y, width, height)
    
    Returns:
        Label analysis results including match score and confidence
    """
    try:
        result = label_analyzer.analyze_label(
            request.image,
            request.expectedCoordinates
        )
        
        return {
            "productId": request.productId,
            "labelMatch": result["labelMatch"],
            "score": result["score"],
            "confidence": result["confidence"],
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/analyze/trust")
async def analyze_trust(request: TrustScoreRequest):
    """
    Calculate trust score for product return request.
    
    Args:
        productId: Unique product identifier
        userId: User requesting the return
        activationTime: When the product was activated
        returnAttempts: Number of previous return attempts
        image: Optional base64 encoded image for label verification
    
    Returns:
        Trust score analysis including risk level and factors
    """
    try:
        # Get label match score if image provided
        label_match_score = 1.0
        if request.image:
            label_result = label_analyzer.analyze_label(
                request.image,
                {}  # Coordinates should be fetched from database
            )
            label_match_score = label_result["score"]
        
        # Calculate trust score
        result = trust_scorer.calculate_trust_score(
            activation_time=request.activationTime,
            return_timestamp=datetime.now(),
            return_attempts=request.returnAttempts,
            label_match_score=label_match_score
        )
        
        return {
            "productId": request.productId,
            "userId": request.userId,
            "trustScore": result["trustScore"],
            "riskLevel": result["riskLevel"],
            "riskFactors": result["riskFactors"],
            "confidence": result["confidence"],
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

if __name__ == "__main__":
    uvicorn.run(
        "app:app",
        host="0.0.0.0",
        port=int(os.getenv("AI_SERVICE_PORT", 8000)),
        reload=True
    )