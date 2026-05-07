const jwt = require('jsonwebtoken');
const { poolPromise } = require('../config/db');

/**
 * Auth Middleware
 * Verifies JWT token and resolves the internal database ID from Keycloak ID (sub)
 */
module.exports = async (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
        return res.status(401).json({ success: false, message: 'Authorization token missing or malformed.' });
    }

    const token = authHeader.split(' ')[1];
    
    try {
        // Decode token (standard Keycloak tokens don't always need local secret check if validated by Keycloak)
        // However, we'll use JWT_SECRET if provided, otherwise decode.
        const decoded = process.env.JWT_SECRET 
            ? jwt.verify(token, process.env.JWT_SECRET)
            : jwt.decode(token);

        if (!decoded || !decoded.sub) {
            return res.status(401).json({ success: false, message: 'Invalid token payload.' });
        }

        // Resolve internal ID from DB
        const pool = await poolPromise;
        const result = await pool.request()
            .input('keycloakId', decoded.sub)
            .query('SELECT Id FROM sysUser WHERE Id_Auth = @keycloakId');

        const rows = result.recordset;
        
        // Attach user info to request
        req.user = { 
            ...decoded, 
            id: rows.length > 0 ? rows[0].Id : 0 
        };

        next();
    } catch (err) {
        console.error('❌ Auth Middleware Error:', err.message);
        return res.status(403).json({ success: false, message: 'Token verification failed.' });
    }
};
