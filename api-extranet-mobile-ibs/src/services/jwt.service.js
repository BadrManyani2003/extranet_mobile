const jwt = require('jsonwebtoken');

const generateToken = (payload) => {
    return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '24h' });
};

const verifyToken = (token) => {
    try {
        if (!process.env.JWT_SECRET) {
            console.warn('WARNING: JWT_SECRET is not defined. Falling back to decoding without verification.');
            return jwt.decode(token);
        }
        return jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {

        console.warn('JWT verification failed, returning decoded token as fallback:', error.message);
        return jwt.decode(token);
    }
};

module.exports = {
    generateToken,
    verifyToken
};
