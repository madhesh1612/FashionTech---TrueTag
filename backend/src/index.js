require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

// Import routes
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const verifyRoutes = require('./routes/verify');
const activationRoutes = require('./routes/activation');
const returnsRoutes = require('./routes/returns');

// Import middleware
const { errorHandler } = require('./middleware/errorHandler');
const { authMiddleware } = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 4000;

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('Connected to MongoDB');
}).catch((err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
});

// Middleware
app.use(cors());
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW) || 900000, // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX) || 100
});
app.use('/api/', limiter);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', authMiddleware, productRoutes);
app.use('/api/verify', verifyRoutes);
app.use('/api/activation', authMiddleware, activationRoutes);
app.use('/api/returns', authMiddleware, returnsRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});