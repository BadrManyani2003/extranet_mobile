const { verifyToken } = require('../services/jwt.service');

const authMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Token manquant ou format invalide' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);
    if (!decoded) {
        return res.status(401).json({ message: 'Token invalide ou expiré' });
    }

    // Resolve internal ID from Id_Auth (sub)
    const db = require('../utils/db');
    db.query('SELECT Id FROM sysUser WHERE Id_Auth = @0', [decoded.sub])
        .then(result => {
            const internalId = result.length > 0 ? result[0].Id : null;
            console.log(`🔑 Auth Middleware: Resolved ${decoded.sub} -> ${internalId}`);
            req.user = {
                ...decoded,
                id: internalId
            };
            next();
        })
        .catch(err => {
            console.error('Error resolving user ID:', err);
            req.user = decoded;
            next();
        });
};

module.exports = authMiddleware;
