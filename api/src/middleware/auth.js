const jwt = require('jsonwebtoken');
const jwksClient = require('jwks-rsa');
const { promisify } = require('util');
const { error } = require('../common/response');
const keycloakConfig = require('../config/keycloak');
const authService = require('../services/auth.service');

const client = jwksClient({
    jwksUri: keycloakConfig.jwksUri,
    cache: true,
    cacheMaxEntries: 5,
    cacheMaxAge: 600000,
    rateLimit: true,
    jwksRequestsPerMinute: 10
});

function getKey(header, callback) {
    client.getSigningKey(header.kid, (err, key) => {
        if (err) return callback(err);
        callback(null, key.getPublicKey());
    });
}

const verifyToken = promisify(jwt.verify);

module.exports = async (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
        return error(res, 'Authentification requise. Format: Bearer <token>', 401);
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = await verifyToken(token, getKey, {
            algorithms: ['RS256'],
            clockTolerance: 86400
        });

        const source = req.headers['x-source'] || 'E';
        const result = await authService.getUserByAuthId(decoded.sub);
        const dbUser = result[0]?.[0];

        req.user = {
            ...decoded,
            id:     dbUser?.id || 0,
            token,
            roles:  decoded.realm_access?.roles || [],
            source
        };

        if (dbUser && dbUser.token !== token) {
            try {
                await authService.updateToken(token, decoded.sub);
            } catch (err) {
                console.error('❌ Failed to update token in DB:', err.message);
            }
        }

        next();

    } catch (err) {
        let message = 'Token invalide.';
        if (err.name === 'TokenExpiredError') message = 'Session expirée.';
        if (err.name === 'JsonWebTokenError') message = `Erreur de signature: ${err.message}`;
        return error(res, message, 401);
    }
};

module.exports.checkRole = (roles) => {
    return (req, res, next) => {
        if (!req.user) return error(res, 'Utilisateur non authentifié.', 401);

        const allowedRoles = Array.isArray(roles) ? roles : [roles];
        const hasRole = allowedRoles.some(role => (req.user.roles || []).includes(role));

        if (!hasRole) return error(res, 'Accès refusé : permissions insuffisantes.', 403);
        next();
    };
};