const router = require('express').Router();
const Product = require('../models/Product');
const TokenService = require('../services/tokenService');
const { adminMiddleware } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');

// Register new product (admin only)
router.post('/register',
    adminMiddleware,
    [
        body('serialNumber').notEmpty(),
        body('name').notEmpty(),
        body('brand').notEmpty(),
        body('labelCoordinates').isObject()
    ],
    async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const { serialNumber, name, brand, labelCoordinates } = req.body;

            // Generate QR token
            const qrToken = TokenService.generateQRToken();

            const product = new Product({
                serialNumber,
                name,
                brand,
                qrToken,
                labelCoordinates
            });

            await product.save();

            res.status(201).json({
                message: 'Product registered successfully',
                product: {
                    id: product._id,
                    serialNumber: product.serialNumber,
                    qrToken: product.qrToken,
                    status: product.status
                }
            });
        } catch (error) {
            if (error.code === 11000) {
                return res.status(400).json({ error: 'Serial number already exists' });
            }
            res.status(500).json({ error: 'Product registration failed' });
        }
    });

// Get product details (admin only)
router.get('/:id', adminMiddleware, async (req, res) => {
    try {
        const product = await Product.findById(req.params.id)
            .populate('activatedBy', 'email')
            .populate('returnAttempts.userId', 'email');

        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }

        res.json({ product });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch product' });
    }
});

// List all products (admin only)
router.get('/', adminMiddleware, async (req, res) => {
    try {
        const { page = 1, limit = 10, status } = req.query;
        const query = status ? { status } : {};

        const products = await Product.find(query)
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .sort({ createdAt: -1 })
            .populate('activatedBy', 'email');

        const total = await Product.countDocuments(query);

        res.json({
            products,
            totalPages: Math.ceil(total / limit),
            currentPage: page
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch products' });
    }
});

module.exports = router;