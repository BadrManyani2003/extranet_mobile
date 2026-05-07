const jwt = require('jsonwebtoken');

/**
 * Middleware to verify JWT token
 */
const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer <token>

    if (!token) {
        return res.status(401).json({ 
            success: false, 
            message: 'Access Denied: No token provided' 
        });
    }

    try {
        // In a real app, use process.env.JWT_SECRET
        const secret = process.env.JWT_SECRET || 'your_default_secret';
        const verified = jwt.verify(token, secret);
        req.user = verified;
        next();
    } catch (err) {
        return res.status(403).json({ 
            success: false, 
            message: 'Invalid or Expired Token' 
        });
    }
};

module.exports = { verifyToken };
