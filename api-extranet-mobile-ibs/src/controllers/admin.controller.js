const Common = require('../common/Common');
const qry    = require('../sql/qryExtranet');

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
    
    res.json({ success: true });
};

module.exports = {
    getUsers, saveUser, deleteUser,
    getClients, createUserFromClient,
    getAdherents, createUserFromAdherent,
    syncKeycloak
};