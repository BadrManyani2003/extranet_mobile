/**
 * controllers/reclamation.controller.js
 * Gestion des réclamations et messages.
 */

const { execSP, getConfig, ok, fail } = require('../common');
const proc = require('../procedures');

// POST /api/reclamations/list
const getAll = async (req, res) => {
    try { 
        const data = await execSP(proc.reclamations.getAll, getConfig(req));
        ok(res, data);
    } catch (err) { fail(res, err); }
};

// POST /api/reclamations/detail
const getDetail = async (req, res) => {
    try {
        const { Id = 0, id = 0 } = req.body;
        const data = await execSP(proc.reclamations.getDetail, { 
            ...getConfig(req), 
            FK_Reclamation_Id: Id || id 
        });
        ok(res, data);
    } catch (err) { fail(res, err); }
};

// POST /api/reclamations/create
const create = async (req, res) => {
    try {
        const { Sujet, sujet, Nature, nature, Message, message } = req.body;
        const data = await execSP(proc.reclamations.create, { 
            ...getConfig(req), 
            Sujet: Sujet || sujet, 
            Nature: Nature || nature, 
            Message: Message || message 
        });
        ok(res, data);
    } catch (err) { fail(res, err); }
};

// POST /api/reclamations/add-message
const addMessage = async (req, res) => {
    try {
        const { Id = 0, id = 0, Nature = 'C', nature = 'C', Message, message } = req.body;
        const data = await execSP(proc.reclamations.addMessage, { 
            ...getConfig(req), 
            FK_Reclamation_Id: Id || id, 
            Nature: Nature || nature, 
            Message: Message || message 
        });
        ok(res, data);
    } catch (err) { fail(res, err); }
};

// POST /api/reclamations/update-statut
const updateStatut = async (req, res) => {
    try {
        const { Id = 0, Statut } = req.body;
        const data = await execSP(proc.reclamations.updateStatut, { 
            ...getConfig(req), 
            FK_Reclamation_Id: Id, 
            Statut 
        });
        ok(res, data);
    } catch (err) { fail(res, err); }
};

// POST /api/reclamations/delete
const remove = async (req, res) => {
    try {
        const { Id = 0 } = req.body;
        const data = await execSP(proc.reclamations.delete, { 
            ...getConfig(req), 
            FK_Reclamation_Id: Id 
        });
        ok(res, data);
    } catch (err) { fail(res, err); }
};

module.exports = { getAll, getDetail, create, addMessage, updateStatut, remove };
