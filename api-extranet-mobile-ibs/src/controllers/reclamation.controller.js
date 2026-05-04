const { poolPromise, sql } = require('../config/db');
const reclamationQueries = require('../chaines/reclamation.queries');

const handleError = (res, error) => {
    console.error('Reclamation Error:', error);
    res.status(500).json({ success: false, message: error.message });
};

const getReclamations = async (req, res) => {
    const { userId } = req.body;
    try {
        const pool = await poolPromise;
        const result = await pool.query(reclamationQueries.getReclamations, [userId]);
        res.json({ success: true, data: result.recordset });
    } catch (error) {
        handleError(res, error);
    }
};

const getReclamationDetail = async (req, res) => {
    const { reclamationId } = req.body;
    try {
        const pool = await poolPromise;
        const result = await pool.query(reclamationQueries.getReclamationDetail, [reclamationId]);
        
        if (result.recordset.length === 0) {
            return res.status(404).json({ success: false, message: 'Réclamation non trouvée' });
        }

        const reclamation = {
            id: result.recordset[0].IdReclamation,
            date: result.recordset[0].DateReclamation,
            sujet: result.recordset[0].Sujet,
            statut: result.recordset[0].Statut,
            nature: result.recordset[0].Nature,
            user: result.recordset[0].UserDeclarant,
            messages: result.recordset.map(row => ({
                id: row.IdMessage,
                date: row.DateMessage,
                nature: row.NatureMessage,
                message: row.Message,
                auteur: row.AuteurMessage
            })).filter(m => m.id !== null)
        };

        res.json({ success: true, data: reclamation });
    } catch (error) {
        handleError(res, error);
    }
};

const createReclamation = async (req, res) => {
    const { userId, sujet, nature, message } = req.body;

    if (!sujet || !nature) {
        return res.status(400).json({ success: false, message: 'Sujet et nature sont requis' });
    }

    try {
        const pool = await poolPromise;
        const result = await pool.query(reclamationQueries.createReclamation, [userId, sujet, nature]);
        const newId = result.recordset[0].NewId;

        if (message) {
            await pool.query(reclamationQueries.addMessage, [newId, userId, 'C', message]);
        }

        res.status(201).json({ success: true, data: { id: newId }, message: 'Réclamation créée avec succès' });
    } catch (error) {
        handleError(res, error);
    }
};

const addMessage = async (req, res) => {
    const { reclamationId, userId, message, nature } = req.body;

    if (!message) {
        return res.status(400).json({ success: false, message: 'Message requis' });
    }

    try {
        const pool = await poolPromise;
        await pool.query(reclamationQueries.addMessage, [reclamationId, userId, nature || 'C', message]);
        res.json({ success: true, message: 'Message ajouté' });
    } catch (error) {
        handleError(res, error);
    }
};

const updateStatut = async (req, res) => {
    const { reclamationId, statut } = req.body;

    if (!statut) {
        return res.status(400).json({ success: false, message: 'Nouveau statut requis' });
    }

    try {
        const pool = await poolPromise;
        await pool.query(reclamationQueries.updateStatut, [reclamationId, statut]);
        res.json({ success: true, message: 'Statut mis à jour' });
    } catch (error) {
        handleError(res, error);
    }
};

const deleteReclamation = async (req, res) => {
    const { reclamationId } = req.body;
    try {
        const pool = await poolPromise;
        await pool.query(reclamationQueries.deleteReclamation, [reclamationId]);
        res.json({ success: true, message: 'Réclamation supprimée' });
    } catch (error) {
        handleError(res, error);
    }
};

module.exports = {
    getReclamations,
    getReclamationDetail,
    createReclamation,
    addMessage,
    updateStatut,
    deleteReclamation
};
