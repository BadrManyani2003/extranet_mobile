const common = require('../utils/common');
const response = require('../utils/response');

const getConfig = (req) => ({
    Source: (req.body.Source || req.headers['x-source'] || 'M').charAt(0).toUpperCase(),
    Token: req.body.Token || req.headers.authorization?.split(' ')[1] || ''
});

const getReclamations = async (req, res) => {
    try {
        const data = await common.executeps('sp_GetReclamations', req.body, getConfig(req));
        response.success(res, data.map(r => ({
            id: r.Id,
            client: r.Client,
            date: r.DateReclamation,
            sujet: r.Sujet,
            statut: r.Statut === 'E' ? 'En cours' : r.Statut === 'T' ? 'Traité' : 'Clôturé',
            nature: r.Nature
        })));
    } catch (error) { response.error(res, error); }
};

const getReclamationDetail = async (req, res) => {
    try {
        const targetId = req.body.id || req.body.Id || req.body.reclamationId || req.params.id;
        const data = await common.executeps('sp_GetReclamationDetails', { FK_Reclamation_Id: targetId, ...req.body }, getConfig(req));
        
        if (data.length === 0) {
            return response.error(res, 'Réclamation non trouvée', 404);
        }

        response.success(res, {
            id: targetId,
            messages: data.map(m => ({
                id: m.Id,
                date: m.DateMessage,
                nature: m.Nature,
                message: m.Message,
                auteur: m.Envoyeur
            }))
        });
    } catch (error) { response.error(res, error); }
};

const createReclamation = async (req, res) => {
    try {
        const { sujet, nature, message } = req.body;
        const result = await common.executeps('sp_CreateReclamation', { Sujet: sujet, Nature: nature, Message: message, ...req.body }, getConfig(req));
        response.success(res, { id: result[0].Id }, 'Réclamation créée avec succès.');
    } catch (error) { response.error(res, error); }
};

const addMessage = async (req, res) => {
    try {
        const targetId = req.body.id || req.body.Id || req.body.reclamationId || req.params.id;
        const { message, nature } = req.body;
        await common.executeps('sp_AddMessageReclamation', { FK_Reclamation_Id: targetId, Nature: nature || 'C', Message: message, ...req.body }, getConfig(req));
        response.success(res, null, 'Message ajouté.');
    } catch (error) { response.error(res, error); }
};

const updateStatut = async (req, res) => {
    try {
        const targetId = req.body.id || req.body.Id || req.body.reclamationId || req.params.id;
        const { statut } = req.body;
        await common.executeps('sp_UpdateReclamationStatus', { FK_Reclamation_Id: targetId, Statut: statut, ...req.body }, getConfig(req));
        response.success(res, null, 'Statut mis à jour.');
    } catch (error) { response.error(res, error); }
};

const deleteReclamation = async (req, res) => {
    try {
        const targetId = req.body.id || req.body.Id || req.body.reclamationId;
        await common.executeps('sp_DeleteReclamation', { FK_Reclamation_Id: targetId, ...req.body }, getConfig(req));
        response.success(res, null, 'Réclamation supprimée.');
    } catch (error) { response.error(res, error); }
};

module.exports = {
    getReclamations,
    getReclamationDetail,
    createReclamation,
    addMessage,
    updateStatut,
    deleteReclamation
};
