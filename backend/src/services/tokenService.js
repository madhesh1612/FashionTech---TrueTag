const crypto = require('crypto');
const jwt = require('jsonwebtoken');

class TokenService {
    static generateJWT(userId) {
        return jwt.sign(
            { userId },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );
    }

    static generateProductToken(productId, timestamp) {
        const data = `${productId}-${timestamp}`;
        return crypto
            .createHmac('sha256', process.env.HMAC_SECRET)
            .update(data)
            .digest('hex');
    }

    static verifyProductToken(token, productId, timestamp) {
        const expectedToken = this.generateProductToken(productId, timestamp);
        return crypto.timingSafeEqual(
            Buffer.from(token),
            Buffer.from(expectedToken)
        );
    }

    static generateQRToken() {
        return crypto.randomBytes(32).toString('hex');
    }
}

module.exports = TokenService;