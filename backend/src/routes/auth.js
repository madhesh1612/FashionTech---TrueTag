const router = require('express').Router();
const User = require('../models/User');
const TokenService = require('../services/tokenService');
const { body, validationResult } = require('express-validator');

// Register new user
router.post('/register',
    [
        body('email').isEmail().normalizeEmail(),
        body('password').isLength({ min: 8 })
    ],
    async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const { email, password } = req.body;

            // Check if user exists
            const existingUser = await User.findOne({ email });
            if (existingUser) {
                return res.status(400).json({ error: 'Email already registered' });
            }

            // Create user
            const user = new User({ email, password });
            await user.save();

            // Generate token
            const token = TokenService.generateJWT(user._id);

            res.status(201).json({
                message: 'User registered successfully',
                token,
                user: {
                    id: user._id,
                    email: user.email,
                    role: user.role
                }
            });
        } catch (error) {
            res.status(500).json({ error: 'Registration failed' });
        }
    });

// Login user
router.post('/login',
    [
        body('email').isEmail().normalizeEmail(),
        body('password').exists()
    ],
    async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const { email, password } = req.body;

            // Find user
            const user = await User.findOne({ email });
            if (!user) {
                return res.status(401).json({ error: 'Invalid credentials' });
            }

            // Check password
            const isMatch = await user.comparePassword(password);
            if (!isMatch) {
                return res.status(401).json({ error: 'Invalid credentials' });
            }

            // Update last login
            user.lastLogin = new Date();
            await user.save();

            // Generate token
            const token = TokenService.generateJWT(user._id);

            res.json({
                message: 'Login successful',
                token,
                user: {
                    id: user._id,
                    email: user.email,
                    role: user.role
                }
            });
        } catch (error) {
            res.status(500).json({ error: 'Login failed' });
        }
    });

module.exports = router;