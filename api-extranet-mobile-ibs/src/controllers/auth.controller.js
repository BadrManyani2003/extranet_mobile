const { poolPromise, sql } = require('../config/db');
const authQueries = require('../chaines/auth.queries');
const keycloakService = require('../services/keycloak.service');

const login = async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ success: false, message: 'Identifiants requis' });
    }

    try {
        // 1. Authenticate with Keycloak
        const tokenData = await keycloakService.getToken(username, password);

        // 2. Fetch user details from database to get our local Id
        // Assuming username is either email or some field in sysUser
        const pool = await poolPromise;
        const result = await pool.query(authQueries.getUserByEmail, [username]);

        if (result.recordset.length === 0) {
            // Option 1: Reject if not in our DB
            // return res.status(401).json({ success: false, message: 'Utilisateur Keycloak valide mais inconnu dans la base IBS.' });
            
            // Option 2: Allow but with limited data (or just return the token)
            return res.json({
                success: true,
                data: {
                    ...tokenData,
                    user: { username, status: 'external' }
                }
            });
        }

        const user = result.recordset[0];

        res.json({
            success: true,
            data: {
                ...tokenData,
                user: {
                    id: user.Id,
                    nom: user.Nom,
                    email: user.Email,
                    mobile: user.Mobile
                }
            }
        });
    } catch (error) {
        handleAuthError(res, error, 'La connexion a échoué');
    }
};

const refreshToken = async (req, res) => {
    const { refresh_token } = req.body;
    if (!refresh_token) {
        return res.status(400).json({ success: false, message: 'Refresh token requis' });
    }

    try {
        const data = await keycloakService.refreshToken(refresh_token);
        res.json({ success: true, data });
    } catch (error) {
        handleAuthError(res, error, 'La mise à jour du token a échoué');
    }
};

const getMe = async (req, res) => {
    const { id } = req.body; 
    try {
        const pool = await poolPromise;
        const result = await pool.query(authQueries.getUserById, [id]);
        
        if (result.recordset.length === 0) {
            return res.status(404).json({ success: false, message: 'Utilisateur non trouvé' });
        }

        res.json({ success: true, data: result.recordset[0] });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const handleAuthError = (res, err, defaultMsg) => {
    if (err.code === 'ECONNREFUSED' || err.code === 'ENOTFOUND') {
        return res.status(503).json({ 
            success: false,
            message: 'Le serveur d\'authentification (Keycloak) est injoignable.' 
        });
    }
    
    const status = err.response?.status || 500;
    let message = defaultMsg;
    if (err.response?.data) {
        message = err.response.data.error === 'invalid_grant' ? 'Identifiants invalides' : err.response.data.error_description || message;
    }
    res.status(status).json({ success: false, message });
};

module.exports = {
    login,
    refreshToken,
    getMe
};
