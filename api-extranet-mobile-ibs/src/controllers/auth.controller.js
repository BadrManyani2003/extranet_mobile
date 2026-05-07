/**
 * controllers/auth.controller.js
 * Gestion de l'authentification via Keycloak.
 */

const { execSP, getConfig, ok, fail } = require('../common');
const proc   = require('../procedures');
const kc     = require('../services/keycloak.service');
const qs     = require('qs');
const axios  = require('axios');
const { poolPromise } = require('../config/db');

// POST /api/auth/login
const login = async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ success: false, message: 'Identifiants requis.' });

    try {
        // 1. Obtenir le token Keycloak
        const data = qs.stringify({
            grant_type:    'password',
            client_id:     process.env.KEYCLOAK_CLIENT_ID,
            client_secret: process.env.KEYCLOAK_SECRET,
            username, password,
            scope: 'openid'
        });
        const kcRes = await axios.post(
            `${process.env.KEYCLOAK_AUTH_SERVER_URL}realms/${process.env.KEYCLOAK_REALM}/protocol/openid-connect/token`,
            data, { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
        );

        // 2. Récupérer l'utilisateur depuis la DB
        const pool = await poolPromise;
        const result = await pool.request()
            .input('username', username)
            .query('SELECT Id, Nom, Email, Mobile FROM sysUser WHERE Email = @username OR Nom = @username');
            
        const users = result.recordset;

        ok(res, { ...kcRes.data, user: users[0] || { username } });
    } catch (err) {
        const status  = err.response?.status || 500;
        const message = err.response?.data?.error === 'invalid_grant'
            ? 'Identifiants invalides.'
            : err.response?.data?.error_description || 'Connexion échouée.';
        res.status(status).json({ success: false, message });
    }
};

// POST /api/auth/refresh
const refresh = async (req, res) => {
    const { refresh_token } = req.body;
    if (!refresh_token) return res.status(400).json({ success: false, message: 'Refresh token requis.' });

    try {
        const data = qs.stringify({
            grant_type:    'refresh_token',
            client_id:     process.env.KEYCLOAK_CLIENT_ID,
            client_secret: process.env.KEYCLOAK_SECRET,
            refresh_token
        });
        const kcRes = await axios.post(
            `${process.env.KEYCLOAK_AUTH_SERVER_URL}realms/${process.env.KEYCLOAK_REALM}/protocol/openid-connect/token`,
            data, { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
        );
        ok(res, kcRes.data);
    } catch (err) { fail(res, err); }
};

// POST /api/auth/me  (authentifié)
const me = async (req, res) => {
    try {
        const rows = await execSP(proc.auth.getMe, getConfig(req));
        if (!rows.length) return res.status(404).json({ success: false, message: 'Utilisateur non trouvé.' });
        ok(res, rows[0]);
    } catch (err) { fail(res, err); }
};

module.exports = { login, refresh, me };
