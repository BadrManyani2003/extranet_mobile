const jwt = require('jsonwebtoken');
const authService = require('../services/auth.service');
const { error } = require('../common/response');

/**
 * Authentication Middleware
 * Decodes Keycloak JWT and fetches local user info
 */
module.exports = async (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
        return error(res, 'Token manquant ou invalide.', 401);
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.decode(token);

    if (!decoded?.sub) {
        return error(res, 'Payload token invalide.', 401);
    }

    try {
        const result = await authService.getUserByAuthId(decoded.sub);
        const row = result[0]?.[0];

        if (row && row.token !== token) {
            await authService.updateToken(token, decoded.sub);
        }

        req.user = {
            ...decoded,
            id: row?.id ?? 0,
            token,
            roles: decoded.realm_access?.roles || [],
            extranet: row?.extranet || 'N'
        };

        // Extranet Access Check
        const extranetStatus = String(req.user.extranet).trim().toUpperCase();
        if (extranetStatus === 'N' && !req.path.includes('/auth/me')) {
            return error(res, "Vous n'avez pas l'accès à l'extranet. Veuillez utiliser l'application mobile.", 403);
        }

        next();
    } catch (err) {
        console.error('❌ Auth Middleware Error:', err.message);
        return error(res, 'Erreur de vérification du token.', 403);
    }
};

/**
 * Role-Based Access Control Middleware
 * @param {string|string[]} roles - Allowed roles
 */
module.exports.checkRole = (roles) => {
    return (req, res, next) => {
        if (!req.user) return error(res, 'Non authentifié.', 401);

        const userRoles = req.user.roles || [];
        const allowedRoles = Array.isArray(roles) ? roles : [roles];

        const hasRole = allowedRoles.some(r => userRoles.includes(r));

        if (!hasRole) {
            return error(res, 'Accès interdit : rôle insuffisant.', 403);
        }
        next();
    };
};