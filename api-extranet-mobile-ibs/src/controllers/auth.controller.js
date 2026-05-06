const db = require('../utils/db');
const response = require('../utils/response');
const keycloakService = require('../services/keycloak.service');

const login = async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return response.error(res, 'Identifiants requis', 400);
    }

    try {
        const tokenData = await keycloakService.getToken(username, password);
        const result = await db.query('SELECT Id, Nom, Email, Mobile FROM sysUser WHERE Email = @0 OR Nom = @0', [username]);

        if (result.length === 0) {
            return response.success(res, {
                ...tokenData,
                user: { username, status: 'external' }
            });
        }

        const user = result[0];
        response.success(res, {
            ...tokenData,
            user: {
                id: user.Id,
                nom: user.Nom,
                email: user.Email,
                mobile: user.Mobile
            }
        });
    } catch (error) {
        handleAuthError(res, error, 'La connexion a échoué');
    }
};

const refreshToken = async (req, res) => {
    const { refresh_token } = req.body;
    if (!refresh_token) {
        return response.error(res, 'Refresh token requis', 400);
    }

    try {
        const data = await keycloakService.refreshToken(refresh_token);
        response.success(res, data);
    } catch (error) {
        handleAuthError(res, error, 'La mise à jour du token a échoué');
    }
};

const getMe = async (req, res) => {
    try {
        const id = req.body.id || req.body.Id || req.user?.id;
        const result = await db.query('SELECT * FROM sysUser WHERE Id = @0', [id]);
        
        if (result.length === 0) {
            return response.error(res, 'Utilisateur non trouvé', 404);
        }

        response.success(res, result[0]);
    } catch (error) { response.error(res, error); }
};

const handleAuthError = (res, err, defaultMsg) => {
    if (err.code === 'ECONNREFUSED' || err.code === 'ENOTFOUND') {
        return response.error(res, 'Le serveur d\'authentification (Keycloak) est injoignable.', 503);
    }
    
    const status = err.response?.status || 500;
    let message = defaultMsg;
    if (err.response?.data) {
        message = err.response.data.error === 'invalid_grant' ? 'Identifiants invalides' : err.response.data.error_description || message;
    }
    response.error(res, message, status);
};

module.exports = { login, refreshToken, getMe };
