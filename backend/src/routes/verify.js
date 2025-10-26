const router = require('express').Router();
const Product = require('../models/Product');
const TokenService = require('../services/tokenService');
const axios = require('axios');

// Verify product QR code
router.post('/scan', async (req, res) => {
    try {
        const { qrToken, image } = req.body;

        // Find product
        const product = await Product.findOne({ qrToken })
            .select('status activatedAt serialNumber labelCoordinates');

        if (!product) {
            return res.status(404).json({ error: 'Invalid QR code' });
        }

        // If image provided, verify label placement
        let labelMatch = null;
        if (image) {
            try {
                const aiResponse = await axios.post(`${process.env.AI_SERVICE_URL}/analyze/label`, {
                    productId: product._id,
                    image,
                    expectedCoordinates: product.labelCoordinates
                });
                labelMatch = aiResponse.data;
            } catch (error) {
                console.error('AI Service Error:', error);
                // Continue without label verification if AI service fails
            }
        }

        res.json({
            status: product.status,
            serialNumber: product.serialNumber,
            activatedAt: product.activatedAt,
            labelMatch: labelMatch ? labelMatch.score : null,
            isAuthentic: true
        });
    } catch (error) {
        res.status(500).json({ error: 'Verification failed' });
    }
});

module.exports = router;