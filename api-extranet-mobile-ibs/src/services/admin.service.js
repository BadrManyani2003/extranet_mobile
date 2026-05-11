const db = require('./db.service');
const qry = require('../sql/qryExtranet');

const getUsers = (userId, token, source) => db.execute(qry.getUsers, [userId, token, source]);

const saveUser = (userId, token, source, targetId, authId, nom, tel, email, nature, extranet, mobile) => 
    db.execute(qry.saveUser, [userId, token, source, targetId, authId, nom, tel, email, nature, extranet, mobile]);

const deleteUser = (userId, token, source, deleteId) => db.execute(qry.deleteUser, [userId, token, source, deleteId]);

const getClients = (userId, token, source) => db.execute(qry.getClients, [userId, token, source]);

const createUserFromClient = (userId, token, source, clientId) => db.execute(qry.createUserFromClient, [userId, token, source, clientId]);

const getAdherents = (userId, source, token, policeId) => db.execute(qry.getAdherentsAdmin, [userId, source, token, policeId]);

const createUserFromAdherent = (userId, token, source, adherentId) => db.execute(qry.createUserFromAdherent, [userId, token, source, adherentId]);
const syncKeycloak = (userId, token, source, id) => db.execute(qry.syncKeycloak, [userId, token, source, id]);

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
