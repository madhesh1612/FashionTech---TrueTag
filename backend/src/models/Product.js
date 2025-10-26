const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    serialNumber: {
        type: String,
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true
    },
    brand: {
        type: String,
        required: true
    },
    qrToken: {
        type: String,
        required: true,
        unique: true
    },
    status: {
        type: String,
        enum: ['created', 'activated', 'returned'],
        default: 'created'
    },
    activatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    activatedAt: {
        type: Date
    },
    labelCoordinates: {
        x: Number,
        y: Number,
        width: Number,
        height: Number
    },
    returnAttempts: [{
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        timestamp: Date,
        trustScore: Number,
        approved: Boolean,
        reason: String
    }],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Index for faster lookups
productSchema.index({ qrToken: 1 });
productSchema.index({ serialNumber: 1 });

module.exports = mongoose.model('Product', productSchema);