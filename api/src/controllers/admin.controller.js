const adminService = require('../services/admin.service');
const { success } = require('../common/response');
const asyncHandler = require('../middleware/asyncHandler');

const getContext = (req) => ({
    userId: req.user.id,
    token:  req.user.token,
    source: req.headers['x-source'] || 'A'
});

const getUsers = asyncHandler(async (req, res) => {
    const { userId, source, token } = getContext(req);
    const result = await adminService.getUsers(userId, token, source);
    success(res, result[0] || []);
});

const saveUser = asyncHandler(async (req, res) => {
    const { userId, source, token } = getContext(req);
    const { id, targetId, idAuth, nom, telephone, email, nature, extranet, mobile } = req.body;
    const result = await adminService.saveUser(userId, token, source, id || targetId, idAuth, nom, telephone, email, nature, extranet, mobile);
    success(res, result[0]?.[0] || {}, 'Utilisateur enregistré');
});

const deleteUser = asyncHandler(async (req, res) => {
    const { userId, source, token } = getContext(req);
    const { deleteId, userId: idToDelete } = req.body;
    const targetId = deleteId || idToDelete;
    
    if (!targetId) throw new Error('ID utilisateur manquant.');

    await adminService.deleteUser(userId, token, source, targetId);
    success(res, null, 'Utilisateur supprimé');
});

const getClients = asyncHandler(async (req, res) => {
    const { userId, source, token } = getContext(req);
    const result = await adminService.getClients(userId, token, source);
    success(res, result[0] || []);
});

const createUserFromClient = asyncHandler(async (req, res) => {
    const { userId, source, token } = getContext(req);
    const { clientId } = req.body;
    const result = await adminService.createUserFromClient(userId, token, source, clientId);
    success(res, result[0]?.[0] || {}, 'Utilisateur créé depuis le client');
});

const getAdherents = asyncHandler(async (req, res) => {
    const { userId, source, token } = getContext(req);
    const { policeId = 0 } = req.body;
    const result = await adminService.getAdherents(userId, source, token, policeId);
    success(res, result[0] || []);
});

const createUserFromAdherent = asyncHandler(async (req, res) => {
    const { userId, source, token } = getContext(req);
    const { adherentId } = req.body;
    const result = await adminService.createUserFromAdherent(userId, token, source, adherentId);
    success(res, result[0]?.[0] || {}, 'Utilisateur créé depuis l\'adhérent');
});

const syncKeycloak = asyncHandler(async (req, res) => {
    const { userId, source, token } = getContext(req);
    const { id } = req.body;
    await adminService.syncKeycloak(userId, token, source, id);
    success(res, null, 'Synchronisation réussie');
});

const linkUserToClient = asyncHandler(async (req, res) => {
    const { userId, source, token } = getContext(req);
    const { targetUserId, clientId } = req.body;
    await adminService.linkUserToClient(userId, token, source, targetUserId, clientId);
    success(res, null, 'Liaison réussie');
});

const unlinkUserFromClient = asyncHandler(async (req, res) => {
    const { userId, source, token } = getContext(req);
    const { targetUserId, clientId } = req.body;
    await adminService.unlinkUserFromClient(userId, token, source, targetUserId, clientId);
    success(res, null, 'Liaison supprimée');
});

const linkUserToAdherent = asyncHandler(async (req, res) => {
    const { userId, source, token } = getContext(req);
    const { targetUserId, adherentId } = req.body;
    await adminService.linkUserToAdherent(userId, token, source, targetUserId, adherentId);
    success(res, null, 'Liaison réussie');
});

const getAvailableRoles = asyncHandler(async (req, res) => {
    const result = await adminService.getAvailableRoles();
    success(res, result);
});

const updateUserRoles = asyncHandler(async (req, res) => {
    const { userId, source, token } = getContext(req);
    const { targetUserId, authId, roles } = req.body;
    await adminService.updateUserRoles(userId, token, source, targetUserId, authId, roles);
    success(res, null, 'Rôles mis à jour');
});

module.exports = {
    getUsers,
    saveUser,
    deleteUser,
    getClients,
    createUserFromClient,
    getAdherents,
    createUserFromAdherent,
    syncKeycloak,
    linkUserToClient,
    unlinkUserFromClient,
    linkUserToAdherent,
    getAvailableRoles,
    updateUserRoles
};