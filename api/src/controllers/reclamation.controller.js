const reclamationService = require('../services/reclamation.service');
const { success } = require('../common/response');
const asyncHandler = require('../middleware/asyncHandler');

const getContext = (req) => ({
    userId: req.user.id,
    token:  req.user.token,
    source: req.headers['x-source'] || 'M'
});

const getReclamations = asyncHandler(async (req, res) => {
    const { userId, source, token } = getContext(req);
    const result = await reclamationService.getReclamations(userId, source, token);
    success(res, result[0] || []);
});

const getReclamationDetails = asyncHandler(async (req, res) => {
    const { userId, source, token } = getContext(req);
    const { reclamationId } = req.body;
    const result = await reclamationService.getReclamationDetails(userId, source, token, reclamationId);
    success(res, result[0] || []);
});

const createReclamation = asyncHandler(async (req, res) => {
    const { userId, source, token } = getContext(req);
    const { sujet, nature, message } = req.body;
    const result = await reclamationService.createReclamation(userId, source, token, sujet, nature, message);
    success(res, result[0]?.[0] || {}, 'Réclamation créée avec succès');
});

const addMessage = asyncHandler(async (req, res) => {
    const { userId, source, token } = getContext(req);
    const { reclamationId, nature, message } = req.body;
    await reclamationService.addMessage(userId, source, token, reclamationId, nature, message);
    success(res, null, 'Message ajouté');
});

const updateStatus = asyncHandler(async (req, res) => {
    const { userId, source, token } = getContext(req);
    const { reclamationId, status, statut } = req.body;
    await reclamationService.updateStatus(userId, source, token, reclamationId, status || statut);
    success(res, null, 'Statut mis à jour');
});

const deleteReclamation = asyncHandler(async (req, res) => {
    const { userId, source, token } = getContext(req);
    const { reclamationId } = req.body;
    await reclamationService.deleteReclamation(userId, source, token, reclamationId);
    success(res, null, 'Réclamation supprimée');
});

const deleteMessage = asyncHandler(async (req, res) => {
    const { userId, token } = getContext(req);
    const { messageId } = req.body;
    await reclamationService.deleteMessage(userId, token, messageId);
    success(res, null, 'Message supprimé');
});

module.exports = {
    getReclamations,
    getReclamationDetails,
    createReclamation,
    addMessage,
    updateStatus,
    deleteReclamation,
    deleteMessage
};