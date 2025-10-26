# TrueTag - Smart Fashion Product Authentication System

> Authenticate Once. Trust Forever.

TrueTag is a comprehensive solution that combines digital and physical verification to eliminate counterfeit fashion products and fraudulent returns.

## 🎯 Project Overview

TrueTag prevents counterfeit fashion products and fraudulent returns using a multi-layer security model:
1. Unique authentication ID + dynamic QR/NFC token per product
2. One-time activation tied to buyer account
3. AI-driven return trust scoring
4. Label placement verification
5. Secure token management with HMAC

## 🏗 Architecture

```
backend (Node.js + Express) → MongoDB
         ↑
         ↓
AI Service (FastAPI + OpenCV) 
         ↑
         ↓
frontend (React + Vite)
```

## 🚀 Quick Start

### Method 1: Running with Docker (Recommended)

1. Install Docker and Docker Compose on your system

2. Clone the repository and navigate to the project folder

3. Set up environment variables:
```bash
cp backend/.env.example backend/.env
cp ai/.env.example ai/.env
```

4. Start all services using Docker Compose:
```bash
docker-compose -f infra/docker-compose.yml up --build
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:4000
- AI Service: http://localhost:8000
- MongoDB: localhost:27017

### Method 2: Running Locally (Development)

1. Prerequisites:
   - Node.js 18+
   - Python 3.10+
   - MongoDB 6+

2. Install dependencies:
```bash
# Backend
cd backend
npm install

# Frontend
cd frontend
npm install

# AI Service
cd ai
pip install -r requirements.txt
```

3. Set up environment variables:
```bash
# Copy and configure environment files
cp backend/.env.example backend/.env
cp ai/.env.example ai/.env
```

4. Start MongoDB (if not running):
```bash
# Windows (if installed as a service)
net start MongoDB

# Or use MongoDB Compass to start a local instance
```

5. Start each service in separate terminals:

```bash
# Terminal 1: Start Backend
cd backend
npm run dev

# Terminal 2: Start Frontend
cd frontend
npm run dev

# Terminal 3: Start AI Service
cd ai
python app.py
```

The services will be available at the same ports as the Docker setup.

## 💻 Admin Setup

1. Register a new user at http://localhost:3000/register
2. Use MongoDB Compass or shell to update the user's role:
```javascript
db.users.updateOne(
  { email: "your-email@example.com" },
  { $set: { role: "admin" } }
)
```

## 🧪 Testing the Application

1. Log in as an admin and create a test product
2. Use the generated QR code to test:
   - Product activation
   - Verification
   - Return processing

## 📝 Environment Variables

### Backend (.env)
```
PORT=4000
MONGODB_URI=mongodb://localhost:27017/truetag
JWT_SECRET=your-jwt-secret-key
HMAC_SECRET=your-hmac-secret-key
TOKEN_EXPIRY=300
RATE_LIMIT_WINDOW=900000
RATE_LIMIT_MAX=100
AI_SERVICE_URL=http://localhost:8000
```

### AI Service (.env)
```
AI_SERVICE_PORT=8000
MODEL_PATH=models/label_detector.pkl
TRUST_MODEL_PATH=models/trust_scorer.pkl
MIN_TRUST_SCORE=0.7
MAX_IMAGE_SIZE=5242880
MONGODB_URI=mongodb://localhost:27017/truetag
```

## 🔑 Example Workflow

1. Admin registers product in system
2. System generates unique QR code
3. Buyer scans and activates product
4. For returns:
   - Buyer initiates return request
   - System verifies authenticity
   - AI calculates trust score
   - System approves/flags return

## 🧪 Testing

```bash
# Backend tests
cd backend && npm test

# AI service tests
cd ai && pytest

# Frontend tests
cd frontend && npm test
```

## 🔒 Security Features

- HMAC SHA-256 token signing
- JWT authentication
- Rate limiting
- Input sanitization
- Secure image processing
- Token expiration (5 min)

## 🎯 Future Scope

- [ ] Blockchain integration for immutable tracking
- [ ] NFC tag support
- [ ] AI-powered counterfeit detection
- [ ] Material origin and sustainability tracing
- [ ] Mobile app development
- [ ] Multi-brand support

## 📝 License

MIT

---

Built with ❤️ for authentic fashion