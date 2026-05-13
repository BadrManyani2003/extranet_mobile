const db = require('./db.service');
const qry = require('../sql/qryExtranet');
const keycloakService = require('./keycloak.service');

const getUsers = (userId, token, source) => db.execute(qry.getUsers, [userId, token, source]);

const saveUser = (userId, token, source, targetId, authId, nom, tel, email, nature, extranet, mobile) => 
    db.execute(qry.saveUser, [userId, token, source, targetId, authId, nom, tel, email, nature, extranet, mobile]);

const deleteUser = (userId, token, source, deleteId) => db.execute(qry.deleteUser, [userId, token, source, deleteId]);

const getClients = (userId, token, source) => db.execute(qry.getClients, [userId, token, source]);

const createUserFromClient = (userId, token, source, clientId) => db.execute(qry.createUserFromClient, [userId, token, source, clientId]);

const getAdherents = (userId, source, token, policeId) => db.execute(qry.getAdherentsAdmin, [userId, source, token, policeId]);

const createUserFromAdherent = (userId, token, source, adherentId) => db.execute(qry.createUserFromAdherent, [userId, token, source, adherentId]);
const syncKeycloak = (userId, token, source, id) => db.execute(qry.syncKeycloak, [userId, token, source, id]);
const linkUserToClient = (userId, token, source, targetUserId, clientId) => db.execute(qry.linkUserToClient, [userId, token, source, targetUserId, clientId]);
const unlinkUserFromClient = (userId, token, source, targetUserId, clientId) => db.execute(qry.unlinkUserFromClient, [userId, token, source, targetUserId, clientId]);
const linkUserToAdherent = (userId, token, source, targetUserId, adherentId) => db.execute(qry.linkUserToAdherent, [userId, token, source, targetUserId, adherentId]);

const getAvailableRoles = () => keycloakService.getAvailableRoles();

const updateUserRoles = async (userId, token, source, targetUserId, authId, roles) => {
    // 1. Synchronisation Keycloak
    const currentRoles = await keycloakService.getUserRoles(authId);
    if (currentRoles.length > 0) await keycloakService.removeUserRoles(authId, currentRoles);
    if (roles.length > 0) await keycloakService.assignUserRoles(authId, roles);

    // 2. Synchronisation BDD
    const rolesCSV = roles.map(r => r.name).join(',');
    return db.execute(qry.updateUserRoles, [userId, token, source, targetUserId, rolesCSV]);
};

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
