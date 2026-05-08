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
        const roles = req.user.roles || [];
        const isCabinet = roles.includes('admincab') || roles.includes('comercialcab');
        
        // If cabinet, pass 0 to see all reclamations
        const userId = isCabinet ? 0 : id;
        
        const data = await Common.getDonnees(qry.getReclamations, [userId, source, token]);
        res.json(data[0] || []);
    } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

const getDetail = async (req, res) => {
    try {
        const { id, source, token } = ctx(req);
        const { reclamationId } = req.body;
        const roles = req.user.roles || [];
        const isCabinet = roles.includes('admincab') || roles.includes('comercialcab');
        
        // If cabinet, pass 0 to see any reclamation detail
        const userId = isCabinet ? 0 : id;
        
        const data = await Common.getDonnees(qry.getReclamationDetails, [userId, source, token, reclamationId]);
        res.json(data[0] || []);
    } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

const create = async (req, res) => {
    try {
        const { id, source, token } = ctx(req);
        const { sujet, nature, message } = req.body;
        const data = await Common.setDonnees(qry.createReclamation, [id, source, token, sujet, nature, message]);
        res.json({ success: true, id: data[0]?.[0]?.id });
    } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

const addMessage = async (req, res) => {
    try {
        const { id, source, token } = ctx(req);
        const { reclamationId, nature, message } = req.body;

        // Check if reclamation is closed
        const statusResult = await Common.getDonnees(qry.getReclamationStatut, [reclamationId]);
        const status = statusResult[0]?.[0]?.Statut;
        if (status === 'C') {
            return res.status(400).json({ success: false, message: 'La réclamation est clôturée. Impossible d\'ajouter un message.' });
        }

        await Common.setDonnees(qry.addMessageReclamation, [id, source, token, reclamationId, nature, message]);
        res.json({ success: true });
    } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

const deleteMessage = async (req, res) => {
    try {
        const { messageId, reclamationId } = req.body;
        const result = await Common.setDonnees(qry.deleteMessageReclamation, [messageId, reclamationId]);
        // result for DELETE might not be useful here depending on driver, but we'll assume it works if no error
        res.json({ success: true });
    } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

const updateStatut = async (req, res) => {
    try {
        const { id, source, token } = ctx(req);
        const { reclamationId, statut } = req.body;

        // Check if user is cabinet
        const roles = req.user.roles || [];
        const isCabinet = roles.includes('admincab') || roles.includes('comercialcab');
        if (!isCabinet) {
            return res.status(403).json({ success: false, message: 'Seul le cabinet peut changer le statut.' });
        }

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

module.exports = { getAll, getDetail, create, addMessage, deleteMessage, updateStatut, remove };