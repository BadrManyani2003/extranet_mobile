const Common = require('../common/Common');
const qry    = require('../sql/qryExtranet');

const ctx = (req) => ({
    id:     req.user.id,
    token:  req.user.token,
    source: req.headers['x-source']
});

const getAll = async (req, res) => {
    try {
        const { id, source, token } = ctx(req);
        const data = await Common.getDonnees(qry.getReclamations, [id, source, token]);
        res.json(data[0] || []);
    } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

const getDetail = async (req, res) => {
    try {
        const { id, source, token } = ctx(req);
        const { reclamationId } = req.body;
        const data = await Common.getDonnees(qry.getReclamationDetails, [id, source, token, reclamationId]);
        res.json(data[0] || []);
    } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

const create = async (req, res) => {
    try {
        const { id, source, token } = ctx(req);
        const { sujet, nature, message } = req.body;
        const data = await Common.setDonnees(qry.createReclamation, [id, source, token, sujet, nature, message]);
        res.json({ success: true, id: data[0]?.[0]?.Id });
    } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

const addMessage = async (req, res) => {
    try {
        const { id, source, token } = ctx(req);
        const { reclamationId, nature, message } = req.body;
        await Common.setDonnees(qry.addMessageReclamation, [id, source, token, reclamationId, nature, message]);
        res.json({ success: true });
    } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

const updateStatut = async (req, res) => {
    try {
        const { id, source, token } = ctx(req);
        const { reclamationId, statut } = req.body;
        await Common.setDonnees(qry.updateReclamationStatut, [id, source, token, reclamationId, statut]);
        res.json({ success: true });
    } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

const remove = async (req, res) => {
    try {
        const { id, source, token } = ctx(req);
        const { reclamationId } = req.body;
        await Common.setDonnees(qry.deleteReclamation, [id, source, token, reclamationId]);
        res.json({ success: true });
    } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

module.exports = { getAll, getDetail, create, addMessage, updateStatut, remove };