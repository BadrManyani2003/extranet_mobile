const Common = require('../common/Common');
const qry    = require('../sql/qryExtranet');
const axios  = require('axios');
const qs     = require('qs');

const ctx = (req) => ({
    id:     req.user.id,
    token:  req.user.token,
    source: req.headers['x-source']
});

const getUsers = async (req, res) => {
    try {
        const { id, source, token } = ctx(req);
        const data = await Common.getDonnees(qry.getUsers, [id, token, source]);
        res.json(data[0] || []);
    } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

const saveUser = async (req, res) => {
    try {
        const { id, source, token } = ctx(req);
        const { id: userId = 0, idAuth = '', nom, telephone = '', email = '', nature = 'P', extranet = 'N', mobile = 'N' } = req.body;
        const data = await Common.setDonnees(qry.saveUser, [id, token, source, userId, idAuth, nom, telephone, email, nature, extranet, mobile]);
        res.json({ success: true, id: data[0]?.[0]?.newId });
    } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

const deleteUser = async (req, res) => {
    try {
        const { id, source, token } = ctx(req);
        const { userId } = req.body;
        await Common.setDonnees(qry.deleteUser, [id, token, source, userId]);
        res.json({ success: true });
    } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

const getClients = async (req, res) => {
    try {
        const { id, source, token } = ctx(req);
        const data = await Common.getDonnees(qry.getClients, [id, token, source]);
        res.json(data[0] || []);
    } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

const createUserFromClient = async (req, res) => {
    try {
        const { id, source, token } = ctx(req);
        const { clientId } = req.body;
        const data = await Common.setDonnees(qry.createUserFromClient, [id, token, source, clientId]);
        res.json(data[0]?.[0]);
    } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

const getAdherents = async (req, res) => {
    try {
        const { id, source, token } = ctx(req);
        const data = await Common.getDonnees(qry.getAdherentsAdmin, [id, source, token, 0]);
        res.json(data[0] || []);
    } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

const createUserFromAdherent = async (req, res) => {
    try {
        const { id, source, token } = ctx(req);
        const { adherentId } = req.body;
        const data = await Common.setDonnees(qry.createUserFromAdherent, [id, token, source, adherentId]);
        res.json(data[0]?.[0]);
    } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

const syncKeycloak = async (req, res) => {
    try {
        const { id: userId } = req.body;
        if (!userId) return res.status(400).json({ success: false, message: 'ID utilisateur requis.' });

        const userResult = await Common.getDonnees("SELECT Id, Nom, Email FROM sysUser WHERE Id = @0", [userId]);
        const user = userResult[0]?.[0];
        if (!user) return res.status(404).json({ success: false, message: 'Utilisateur non trouvé.' });
        if (!user.Email) return res.status(400).json({ success: false, message: 'L\'utilisateur n\'a pas d\'email.' });

        const tokenRes = await axios.post(`${process.env.KEYCLOAK_AUTH_SERVER_URL}realms/${process.env.KEYCLOAK_REALM}/protocol/openid-connect/token`, qs.stringify({
            grant_type:    'client_credentials',
            client_id:     process.env.KEYCLOAK_CLIENT_ID,
            client_secret: process.env.KEYCLOAK_SECRET
        }), { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } });

        const adminToken = tokenRes.data.access_token;
        const kcUrl = `${process.env.KEYCLOAK_AUTH_SERVER_URL}admin/realms/${process.env.KEYCLOAK_REALM}/users`;

        const kcUsersRes = await axios.get(`${kcUrl}?email=${user.Email}`, {
            headers: { Authorization: `Bearer ${adminToken}` }
        });

        let kcUser = kcUsersRes.data.find(u => u.email?.toLowerCase() === user.Email.toLowerCase());

        if (!kcUser) {
            const names = (user.Nom || '').split(' ');
            const firstName = names[0] || '';
            const lastName = names.slice(1).join(' ') || '-';

            const newUser = {
                username:      user.Email,
                email:         user.Email,
                firstName:     firstName,
                lastName:      lastName,
                enabled:       true,
                emailVerified: true,
                credentials: [{
                    type:      'password',
                    value:     'Ibs@2026',
                    temporary: true
                }]
            };

            await axios.post(kcUrl, newUser, {
                headers: { Authorization: `Bearer ${adminToken}`, 'Content-Type': 'application/json' }
            });

            const kcUsersRetry = await axios.get(`${kcUrl}?email=${user.Email}`, {
                headers: { Authorization: `Bearer ${adminToken}` }
            });
            kcUser = kcUsersRetry.data.find(u => u.email?.toLowerCase() === user.Email.toLowerCase());
        }

        if (!kcUser) {
            return res.status(500).json({ success: false, message: 'Erreur lors de la création/récupération sur Keycloak.' });
        }

        await Common.setDonnees("UPDATE sysUser SET Id_Auth = @0, UpdatedAt = GETDATE() WHERE Id = @1", [kcUser.id, userId]);

        res.json({ success: true, message: 'Synchronisation et connexion réussies.' });

    } catch (e) {
        console.error('Sync Error:', e.response?.data || e.message);
        const status = e.response?.status || 500;
        const msg = e.response?.data?.error || e.response?.data?.errorMessage || e.message;
        res.status(status).json({ success: false, message: `Erreur Keycloak: ${msg}` });
    }
};

module.exports = {
    getUsers, saveUser, deleteUser,
    getClients, createUserFromClient,
    getAdherents, createUserFromAdherent,
    syncKeycloak
};