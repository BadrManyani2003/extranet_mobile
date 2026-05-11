const adminService = require('../services/admin.service');
const { success, error } = require('../common/response');

const getContext = (req) => ({
    userId: req.user.id,
    token:  req.user.token,
    source: req.headers['x-source'] || 'A'
});

const getUsers = async (req, res) => {
    try {
        const { userId, source, token } = getContext(req);
        const result = await adminService.getUsers(userId, token, source);
        success(res, result[0] || []);
    } catch (e) { error(res, e.message); }
};

const saveUser = async (req, res) => {
    try {
        const { userId, source, token } = getContext(req);
        const { id, targetId, idAuth, nom, telephone, email, nature, extranet, mobile } = req.body;
        const result = await adminService.saveUser(userId, token, source, id || targetId, idAuth, nom, telephone, email, nature, extranet, mobile);
        success(res, result[0]?.[0] || {});
    } catch (e) { error(res, e.message); }
};

const deleteUser = async (req, res) => {
    try {
        const { userId, source, token } = getContext(req);
        const { deleteId, userId: idToDelete } = req.body;
        const targetId = deleteId || idToDelete;
        
        if (!targetId) {
            return error(res, 'ID utilisateur manquant.');
        }

        await adminService.deleteUser(userId, token, source, targetId);
        success(res, { success: true });
    } catch (e) { error(res, e.message); }
};

const getClients = async (req, res) => {
    try {
        const { userId, source, token } = getContext(req);
        const result = await adminService.getClients(userId, token, source);
        success(res, result[0] || []);
    } catch (e) { error(res, e.message); }
};

const createUserFromClient = async (req, res) => {
    try {
        const { userId, source, token } = getContext(req);
        const { clientId } = req.body;
        const result = await adminService.createUserFromClient(userId, token, source, clientId);
        success(res, result[0]?.[0] || {});
    } catch (e) { error(res, e.message); }
};

const getAdherents = async (req, res) => {
    try {
        const { userId, source, token } = getContext(req);
        const { policeId = 0 } = req.body;
        const result = await adminService.getAdherents(userId, source, token, policeId);
        success(res, result[0] || []);
    } catch (e) { error(res, e.message); }
};

const createUserFromAdherent = async (req, res) => {
    try {
        const { userId, source, token } = getContext(req);
        const { adherentId } = req.body;
        const result = await adminService.createUserFromAdherent(userId, token, source, adherentId);
        success(res, result[0]?.[0] || {});
    } catch (e) { error(res, e.message); }
};

const syncKeycloak = async (req, res) => {
    try {
        const { userId, source, token } = getContext(req);
        const { id } = req.body;
        await adminService.syncKeycloak(userId, token, source, id);
        success(res, { success: true });
    } catch (e) { error(res, e.message); }
};

module.exports = {
    getUsers,
    saveUser,
    deleteUser,
    getClients,
    createUserFromClient,
    getAdherents,
    createUserFromAdherent,
    syncKeycloak
};