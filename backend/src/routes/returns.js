const router = require('express').Router();
const Product = require('../models/Product');
const axios = require('axios');
const { body, validationResult } = require('express-validator');

// Request return
router.post('/request',
    [
        body('qrToken').notEmpty(),
        body('reason').notEmpty()
    ],
    async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const { qrToken, reason, image } = req.body;
            const userId = req.user._id;

            // Find product
            const product = await Product.findOne({ qrToken });
            if (!product) {
                return res.status(404).json({ error: 'Product not found' });
            }

            // Check if user owns the product
            if (!product.activatedBy || product.activatedBy.toString() !== userId.toString()) {
                return res.status(403).json({ error: 'Not authorized to return this product' });
            }

            // Get trust score from AI service
            let trustScore = 0;
            try {
                const aiResponse = await axios.post(`${process.env.AI_SERVICE_URL}/analyze/trust`, {
                    productId: product._id,
                    userId: userId,
                    activationTime: product.activatedAt,
                    returnAttempts: product.returnAttempts.length,
                    image
                });
                trustScore = aiResponse.data.trustScore;
            } catch (error) {
                console.error('AI Service Error:', error);
                // Use default trust score if AI service fails
                trustScore = 0.5;
            }

            // Add return attempt
            const approved = trustScore >= 0.7; // Configurable threshold
            product.returnAttempts.push({
                userId,
                timestamp: new Date(),
                trustScore,
                approved,
                reason
            });

            if (approved) {
                product.status = 'returned';
            }

            await product.save();

            res.json({
                message: approved ? 'Return approved' : 'Return requires review',
                trustScore,
                approved,
                returnId: product.returnAttempts[product.returnAttempts.length - 1]._id
            });
        } catch (error) {
            res.status(500).json({ error: 'Return request failed' });
        }
    });

// Get return history (for authenticated user's products)
router.get('/history', async (req, res) => {
    try {
        const userId = req.user._id;
        
        const returns = await Product.find({
            'returnAttempts.userId': userId
        })
        .select('serialNumber status returnAttempts')
        .sort({ 'returnAttempts.timestamp': -1 });

        res.json({ returns });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch return history' });
    }
});

module.exports = router;