const Common  = require('../common/Common');
const qry     = require('../sql/qryExtranet');
const qs      = require('qs');
const axios   = require('axios');
const jwt     = require('jsonwebtoken');

const KEYCLOAK_TOKEN_URL = `${process.env.KEYCLOAK_AUTH_SERVER_URL}realms/${process.env.KEYCLOAK_REALM}/protocol/openid-connect/token`;

/**
 * POST /api/auth/login
 * Authentifie l'utilisateur via Keycloak puis stocke le token en base.
 */
const login = async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password)
        return res.status(400).json({ success: false, message: 'Identifiants requis.' });

    try {
        // 1. Authentification Keycloak
        const kcRes = await axios.post(KEYCLOAK_TOKEN_URL, qs.stringify({
            grant_type:    'password',
            client_id:     process.env.KEYCLOAK_CLIENT_ID,
            client_secret: process.env.KEYCLOAK_SECRET,
            scope:         'openid',
            username,
            password
        }), { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } });

        const { access_token, refresh_token, expires_in, token_type } = kcRes.data;

        // Décoder le token pour récupérer l'Id_Auth (le "sub" de Keycloak)
        const decoded = jwt.decode(access_token);
        const idAuth = decoded?.sub;
        console.log(idAuth);
        
        if (!idAuth) {
            return res.status(401).json({ success: false, message: 'Jeton invalide (sub manquant).' });
        }

        // 2. Stocker le token dans sysUser + récupérer l'utilisateur via Id_Auth
        await Common.setDonnees(qry.updateToken,    [access_token, idAuth]);
        const result = await Common.getDonnees(qry.getUserInfoByAuthId, [idAuth]);
        const user   = result[0]?.[0] ?? { username };

        res.json({ success: true, access_token, refresh_token, expires_in, token_type, user });

    } catch (err) {
        const status  = err.response?.status || 500;
        const message = err.response?.data?.error === 'invalid_grant'
            ? 'Identifiants invalides.'
            : err.response?.data?.error_description || 'Connexion échouée.';
        res.status(status).json({ success: false, message });
    }
};

/**
 * POST /api/auth/refresh
 * Rafraîchit le token Keycloak via le refresh_token.
 */
const refresh = async (req, res) => {
    const { refresh_token } = req.body;
    if (!refresh_token)
        return res.status(400).json({ success: false, message: 'Refresh token requis.' });

    try {
        const kcRes = await axios.post(KEYCLOAK_TOKEN_URL, qs.stringify({
            grant_type:    'refresh_token',
            client_id:     process.env.KEYCLOAK_CLIENT_ID,
            client_secret: process.env.KEYCLOAK_SECRET,
            refresh_token
        }), { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } });

        const { access_token, refresh_token: new_rt, expires_in, token_type } = kcRes.data;
        res.json({ success: true, access_token, refresh_token: new_rt, expires_in, token_type });

    } catch (err) {
        const status  = err.response?.status || 500;
        const message = err.response?.data?.error_description || 'Rafraîchissement échoué.';
        res.status(status).json({ success: false, message });
    }
};

/**
 * GET /api/auth/me
 * Retourne les infos de l'utilisateur connecté.
 */
const me = async (req, res) => {
    try {
        if (!req.user || !req.user.sub) {
            return res.status(401).json({ success: false, message: 'Non authentifié.' });
        }

        const result = await Common.getDonnees(qry.getUserInfoByAuthId, [req.user.sub]);
        const user   = result[0]?.[0];

        if (!user) {
            return res.status(404).json({ success: false, message: 'Utilisateur non trouvé en base.' });
        }

        res.json({ success: true, user });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

module.exports = { login, refresh, me };
