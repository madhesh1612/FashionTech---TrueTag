const router = require('express').Router();
const Product = require('../models/Product');
const TokenService = require('../services/tokenService');
const { body, validationResult } = require('express-validator');

// Activate product
router.post('/activate',
    [
        body('qrToken').notEmpty()
    ],
    async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const { qrToken } = req.body;
            const userId = req.user._id;

            // Find product
            const product = await Product.findOne({ qrToken });
            if (!product) {
                return res.status(404).json({ error: 'Invalid QR code' });
            }

            // Check if already activated
            if (product.status === 'activated') {
                return res.status(400).json({ error: 'Product already activated' });
            }

            // Update product status
            product.status = 'activated';
            product.activatedBy = userId;
            product.activatedAt = new Date();
            await product.save();

            res.json({
                message: 'Product activated successfully',
                product: {
                    id: product._id,
                    serialNumber: product.serialNumber,
                    status: product.status,
                    activatedAt: product.activatedAt
                }
            });
        } catch (error) {
            res.status(500).json({ error: 'Activation failed' });
        }
    });

// Get activation status
router.get('/:qrToken', async (req, res) => {
    try {
        const product = await Product.findOne({ qrToken: req.params.qrToken })
            .select('status activatedAt serialNumber')
            .populate('activatedBy', 'email');

        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }

        res.json({ product });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch activation status' });
    }
});

module.exports = router;