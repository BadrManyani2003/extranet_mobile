const jwt  = require('jsonwebtoken');
const Common = require('../common/Common');
const qry    = require('../sql/qryExtranet');

/**
 * Middleware d'authentification.
 * Décode le token Keycloak (Bearer) et résout l'ID interne de l'utilisateur en base.
 * Expose req.user = { ...payload, id, token }
 */
module.exports = async (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
        return res.status(401).json({ success: false, message: 'Token manquant ou invalide.' });
    }

    const token   = authHeader.split(' ')[1];
    const decoded = jwt.decode(token);          // RS256 : pas de clé publique locale → decode uniquement

    if (!decoded?.sub) {
        return res.status(401).json({ success: false, message: 'Payload token invalide.' });
    }

    try {
        const result = await Common.getDonnees(qry.getUserByAuthId, [decoded.sub]);
        const row    = result[0]?.[0];

        // Synchroniser le token en base de données si différent
        if (row && row.token !== token) {
            await Common.setDonnees(qry.updateToken, [token, decoded.sub]);
        }

        req.user = {
            ...decoded,
            id:    row?.Id ?? 0,   // ID interne (table sysUser)
            token,                 // Token brut — transmis aux procédures stockées
            roles: decoded.realm_access?.roles || [],
            extranet: row?.Extranet || 'N'
        };

        // Bloquer l'accès si l'extranet est désactivé
        const extranetStatus = String(req.user.extranet).trim().toUpperCase();
        if (extranetStatus === 'N' && !req.path.includes('/auth/me')) {
            return res.status(403).json({ 
                success: false, 
                message: "Vous n'avez pas l'accès à l'extranet. Veuillez utiliser l'application mobile." 
            });
        }

        next();
    } catch (err) {
        console.error('❌ Auth Middleware Error:', err.message);
        return res.status(403).json({ success: false, message: 'Erreur de vérification du token.' });
    }
};

/**
 * Middleware factory pour vérifier les rôles.
 * @param {string|string[]} roles 
 */
module.exports.checkRole = (roles) => {
    return (req, res, next) => {
        if (!req.user) return res.status(401).json({ success: false, message: 'Non authentifié.' });
        
        const userRoles = req.user.roles || [];
        const allowedRoles = Array.isArray(roles) ? roles : [roles];
        
        const hasRole = allowedRoles.some(r => userRoles.includes(r));

        if (!hasRole) {
            return res.status(403).json({ success: false, message: 'Accès interdit : rôle insuffisant.' });
        }
        next();
    };
};
