const jwt = require('jsonwebtoken');
const jwksClient = require('jwks-rsa');
const { error } = require('../common/response');
const keycloakConfig = require('../config/keycloak');
const authService = require('../services/auth.service');

const client = jwksClient({
    jwksUri: keycloakConfig.jwksUri,
    cache: true,
    rateLimit: true,
});

function getKey(header, callback) {
    client.getSigningKey(header.kid, (err, key) => {
        if (err) {
            callback(err);
        } else {
            const signingKey = key.publicKey || key.rsaPublicKey;
            callback(null, signingKey);
        }
    });
}

/**
 * Expert Authentication Middleware
 * Verifies JWT signature using Keycloak Public Keys (JWKS)
 */
module.exports = async (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
        return error(res, 'Token manquant ou invalide.', 401);
    }

    const token = authHeader.split(' ')[1];

    const issuer = `${keycloakConfig.authServerUrl.replace(/\/$/, '')}/realms/${keycloakConfig.realm}`;

    jwt.verify(token, getKey, {
        issuer: issuer,
        algorithms: ['RS256']
    }, async (err, decoded) => {
        if (err) {
            console.error('❌ JWT Verification Error:', err.message);
            if (err.name === 'TokenExpiredError') {
                return error(res, 'Token expiré.', 401);
            }
            return error(res, `Token invalide : ${err.message}`, 401);
        }

        try {
            // Fetch or update local user info
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
                return error(res, "Accès extranet non autorisé pour ce profil.", 403);
            }

            next();
        } catch (dbErr) {
            console.error('❌ Database Auth Error:', dbErr.message);
            return error(res, 'Erreur de synchronisation utilisateur.', 500);
        }
    });
};

/**
 * Role-Based Access Control
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