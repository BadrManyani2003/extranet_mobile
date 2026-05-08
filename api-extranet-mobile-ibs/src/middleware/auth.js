const jwt  = require('jsonwebtoken');
const Common = require('../common/Common');
const qry    = require('../sql/qryExtranet');

module.exports = async (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
        return res.status(401).json({ success: false, message: 'Token manquant ou invalide.' });
    }

    const token   = authHeader.split(' ')[1];
    const decoded = jwt.decode(token);          

    if (!decoded?.sub) {
        return res.status(401).json({ success: false, message: 'Payload token invalide.' });
    }

    try {
        const result = await Common.getDonnees(qry.getUserByAuthId, [decoded.sub]);
        const row    = result[0]?.[0];

        if (row && row.token !== token) {
            await Common.setDonnees(qry.updateToken, [token, decoded.sub]);
        }

        req.user = {
            ...decoded,
            id:    row?.id ?? 0,   
            token,                 
            roles: decoded.realm_access?.roles || [],
            extranet: row?.extranet || 'N'
        };

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