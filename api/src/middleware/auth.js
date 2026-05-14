const jwt = require('jsonwebtoken');
const jwksClient = require('jwks-rsa');
const { promisify } = require('util');
const { error } = require('../common/response');
const keycloakConfig = require('../config/keycloak');
const authService = require('../services/auth.service');

// Configuration du client JWKS avec mise en cache et limitation de débit optimisées
console.log('🌐 JWKS URI:', keycloakConfig.jwksUri);
const client = jwksClient({
    jwksUri: keycloakConfig.jwksUri,
    cache: true,
    cacheMaxEntries: 5,
    cacheMaxAge: 600000, // 10 minutes
    rateLimit: true,
    jwksRequestsPerMinute: 10
});

/**
 * Récupère la clé de signature pour vérifier le JWT
 */
function getKey(header, callback) {
    client.getSigningKey(header.kid, (err, key) => {
        if (err) return callback(err);
        const signingKey = key.getPublicKey();
        callback(null, signingKey);
    });
}

const verifyToken = promisify(jwt.verify);

/**
 * MIDDLEWARE PRINCIPAL D'AUTHENTIFICATION
 */
module.exports = async (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
        return error(res, 'Authentification requise. Format: Bearer <token>', 401);
    }

    const token = authHeader.split(' ')[1];
    
    try {
        // Verification of the token with validation of issuer and audience (optional based on config)
        const decoded = await verifyToken(token, getKey, { 
            algorithms: ['RS256'] 
        });

        // 1. Get source from headers (M for Mobile, E for Extranet)
        const source = req.headers['x-source'] || 'E';

        // 2. Get user from database
        const result = await authService.getUserByAuthId(decoded.sub);
        const dbUser = result[0]?.[0];

        // 3. Construct user object for the request
        req.user = {
            ...decoded,
            id:     dbUser?.id || 0,
            token:  token, 
            roles:  decoded.realm_access?.roles || [],
            source: source 
        };

        // 4. Update token in database if necessary
        if (dbUser && dbUser.token !== token) {
            authService.updateToken(token, decoded.sub).catch(err => {
                // Non-blocking error
            });
        }
        
        next();

    } catch (err) {
        console.error('🔑 Auth Error:', err.message);
        let message = 'Token invalide.';
        if (err.name === 'TokenExpiredError') message = 'Session expirée.';
        if (err.name === 'JsonWebTokenError') message = `Erreur de signature: ${err.message}`;
        
        return error(res, message, 401);
    }
};

/**
 * MIDDLEWARE DE VÉRIFICATION DES RÔLES KEYCLOAK
 */
module.exports.checkRole = (roles) => {
    return (req, res, next) => {
        if (!req.user) return error(res, 'Utilisateur non authentifié.', 401);

        const userRoles = req.user.roles || [];
        const allowedRoles = Array.isArray(roles) ? roles : [roles];

        const hasRole = allowedRoles.some(role => userRoles.includes(role));

        if (!hasRole) {
            return error(res, "Accès refusé : permissions insuffisantes.", 403);
        }
        next();
    };
};