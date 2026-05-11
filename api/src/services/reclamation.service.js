const db = require('./db.service');
const qry = require('../sql/qryExtranet');

const getReclamations = (userId, source, token) => db.execute(qry.getReclamations, [userId, source, token]);

const getReclamationDetails = (userId, source, token, reclamationId) => db.execute(qry.getReclamationDetails, [userId, source, token, reclamationId]);

const createReclamation = (userId, source, token, sujet, nature, message) => db.execute(qry.createReclamation, [userId, source, token, sujet, nature, message]);

const addMessage = (userId, source, token, reclamationId, nature, message) => db.execute(qry.addMessageReclamation, [userId, source, token, reclamationId, nature, message]);

const updateStatus = (userId, source, token, reclamationId, status) => db.execute(qry.updateReclamationStatut, [userId, source, token, reclamationId, status]);

const deleteReclamation = (userId, source, token, reclamationId) => db.execute(qry.deleteReclamation, [userId, source, token, reclamationId]);

const deleteMessage = (userId, token, messageId) => db.execute(qry.deleteMessageReclamation, [userId, token, messageId]);

module.exports = {
    getReclamations,
    getReclamationDetails,
    createReclamation,
    addMessage,
    updateStatus,
    deleteReclamation,
    deleteMessage
};
