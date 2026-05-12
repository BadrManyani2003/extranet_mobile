const jwt = require('jsonwebtoken');
const jwksClient = require('jwks-rsa');
const { error } = require('../common/response');
const keycloakConfig = require('../config/keycloak');
const authService = require('../services/auth.service');

// Configuration du client JWKS pour récupérer les clés publiques de Keycloak
const client = jwksClient({
    jwksUri: keycloakConfig.jwksUri,
    cache: true,
    rateLimit: true,
});

/**
 * Récupère la clé de signature pour vérifier le JWT
 */
function getKey(header, callback) {
    client.getSigningKey(header.kid, (err, key) => {
        if (err) return callback(err);
        const signingKey = key.publicKey || key.rsaPublicKey;
        callback(null, signingKey);
    });
}

/**
 * MIDDLEWARE PRINCIPAL D'AUTHENTIFICATION
 */
module.exports = async (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
        return error(res, 'Authentification requise.', 401);
    }

    const token = authHeader.split(' ')[1];
    const issuer = `${keycloakConfig.authServerUrl.replace(/\/$/, '')}/realms/${keycloakConfig.realm}`;

    jwt.verify(token, getKey, { issuer, algorithms: ['RS256'] }, async (err, decoded) => {
        if (err) {
            const message = err.name === 'TokenExpiredError' ? 'Session expirée.' : 'Token invalide.';
            return error(res, message, 401);
        }

        try {
            // 1. Récupération de la source depuis le front (M pour Mobile, E pour Extranet)
            const source = req.headers['x-source'] || 'E';

            // 2. Récupération facultative de l'utilisateur en base pour avoir son ID interne
            const result = await authService.getUserByAuthId(decoded.sub);
            const dbUser = result[0]?.[0];

            // 3. Construction de l'objet utilisateur
            req.user = {
                ...decoded,
                id:     dbUser?.id || 0,
                token:  token, // Ajout indispensable pour les services SQL
                roles:  decoded.realm_access?.roles || [],
                source: source 
            };

            // 4. Mise à jour du token en base si l'utilisateur existe
            if (dbUser && dbUser.token !== token) {
                await authService.updateToken(token, decoded.sub);
            }
            
            next();

        } catch {
            return error(res, 'Erreur de liaison avec la base de données.', 500);
        }
    });
};

/**
 * MIDDLEWARE DE VÉRIFICATION DES RÔLES KEYCLOAK
 */
module.exports.checkRole = (roles) => {
    return (req, res, next) => {
        if (!req.user) return error(res, 'Non authentifié.', 401);

        const userRoles = req.user.roles || [];
        const allowedRoles = Array.isArray(roles) ? roles : [roles];

        const hasRole = allowedRoles.some(role => userRoles.includes(role));

        if (!hasRole) {
            return error(res, "Vous n'avez pas les permissions nécessaires (Rôle Keycloak manquant).", 403);
        }
        next();
    };
};