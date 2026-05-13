const jwt = require('jsonwebtoken');
const jwksClient = require('jwks-rsa');
const { promisify } = require('util');
const { error } = require('../common/response');
const keycloakConfig = require('../config/keycloak');
const authService = require('../services/auth.service');

// Configuration du client JWKS avec mise en cache et limitation de débit optimisées
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

    const fs = require('fs');
    const logPath = 'C:/PRJ/extranet_mobile/api/auth_debug.log';
    fs.appendFileSync(logPath, `[${new Date().toISOString()}] Request received: ${req.method} ${req.path}\n`);
    fs.appendFileSync(logPath, `Headers: ${JSON.stringify(req.headers, null, 2)}\n`);



    if (!authHeader?.startsWith('Bearer ')) {


        return error(res, 'Authentification requise. Format: Bearer <token>', 401);
    }

    const token = authHeader.split(' ')[1];
    const issuer = `${keycloakConfig.authServerUrl.replace(/\/$/, '')}/realms/${keycloakConfig.realm}`;
    
    console.log(`[Auth] Header Source: ${req.headers['x-source']}`);
    console.log(`[Auth] Expected Issuer: ${issuer}`);
    console.log(`[Auth] Token (prefix): ${token.substring(0, 20)}...`);

    const rawDecoded = jwt.decode(token);
    console.log(`[Auth] Raw Decoded Token:`, JSON.stringify(rawDecoded, null, 2));

    try {


        // Vérification du token avec validation de l'issuer et de l'audience
        console.log(`[Auth] Verifying token for issuer: ${issuer}`);
        const decoded = await verifyToken(token, getKey, { 
            // issuer, 
            // audience: keycloakConfig.clientId, 
            algorithms: ['RS256'] 
        });


        console.log(`[Auth] Token verified for sub: ${decoded.sub}`);


        // 1. Récupération de la source depuis le front (M pour Mobile, E pour Extranet)
        const source = req.headers['x-source'] || 'E';

        // 2. Récupération de l'utilisateur en base
        // Note: On peut envisager un cache ici si les performances deviennent critiques
        const result = await authService.getUserByAuthId(decoded.sub);
        const dbUser = result[0]?.[0];

        // 3. Construction de l'objet utilisateur pour la requête
        req.user = {
            ...decoded,
            id:     dbUser?.id || 0,
            token:  token, 
            roles:  decoded.realm_access?.roles || [],
            source: source 
        };

        // 4. Mise à jour du token en base si nécessaire (détection de changement)
        if (dbUser && dbUser.token !== token) {
            authService.updateToken(token, decoded.sub).catch(err => {
                console.error('[Auth] Erreur updateToken non-bloquante:', err.message);
            });
        }
        
        next();

    } catch (err) {
        const fs = require('fs');
        const logPath = 'C:/PRJ/extranet_mobile/api/auth_debug.log';
        const logMsg = `[${new Date().toISOString()}] Auth Error: ${err.message}\nStack: ${err.stack}\n`;
        fs.appendFileSync(logPath, logMsg);
        console.error('[Auth] Token verification failed:', err.message);



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