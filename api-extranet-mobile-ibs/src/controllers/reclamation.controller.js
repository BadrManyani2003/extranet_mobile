const reclamationService = require('../services/reclamation.service');
const { success, error } = require('../common/response');

const getContext = (req) => ({
    userId: req.user.id,
    token:  req.user.token,
    source: req.headers['x-source'] || 'M'
});

const getReclamations = async (req, res) => {
    try {
        const { userId, source, token } = getContext(req);
        const result = await reclamationService.getReclamations(userId, source, token);
        success(res, result[0] || []);
    } catch (e) { error(res, e.message); }
};

const getReclamationDetails = async (req, res) => {
    try {
        const { userId, source, token } = getContext(req);
        const { reclamationId } = req.body;
        const result = await reclamationService.getReclamationDetails(userId, source, token, reclamationId);
        success(res, result[0] || []);
    } catch (e) { error(res, e.message); }
};

const createReclamation = async (req, res) => {
    try {
        const { userId, source, token } = getContext(req);
        const { sujet, nature, message } = req.body;
        const result = await reclamationService.createReclamation(userId, source, token, sujet, nature, message);
        success(res, result[0]?.[0] || {});
    } catch (e) { error(res, e.message); }
};

const addMessage = async (req, res) => {
    try {
        const { userId, source, token } = getContext(req);
        const { reclamationId, nature, message } = req.body;
        await reclamationService.addMessage(userId, source, token, reclamationId, nature, message);
        success(res, { success: true });
    } catch (e) { error(res, e.message); }
};

const updateStatus = async (req, res) => {
    try {
        const { userId, source, token } = getContext(req);
        const { reclamationId, status, statut } = req.body;
        await reclamationService.updateStatus(userId, source, token, reclamationId, status || statut);
        success(res, { success: true });
    } catch (e) { error(res, e.message); }
};

const deleteReclamation = async (req, res) => {
    try {
        const { userId, source, token } = getContext(req);
        const { reclamationId } = req.body;
        await reclamationService.deleteReclamation(userId, source, token, reclamationId);
        success(res, { success: true });
    } catch (e) { error(res, e.message); }
};

const deleteMessage = async (req, res) => {
    try {
        const { userId, token } = getContext(req);
        const { messageId } = req.body;
        await reclamationService.deleteMessage(userId, token, messageId);
        success(res, { success: true });
    } catch (e) { error(res, e.message); }
};

module.exports = {
    getReclamations,
    getReclamationDetails,
    createReclamation,
    addMessage,
    updateStatus,
    deleteReclamation,
    deleteMessage
};