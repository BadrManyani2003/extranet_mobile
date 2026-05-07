/**
 * controllers/data.controller.js
 * Données utilisateur : polices, stats, impayés.
 * Pure relay DB → client. Zéro logique métier.
 */

const { execSP, getConfig, ok, fail } = require('../common');
const proc = require('../procedures');

// POST /api/data/polices
const polices = async (req, res) => {
    try { 
        const data = await execSP(proc.data.polices, getConfig(req));
        ok(res, data);
    } catch (err) { fail(res, err); }
};

// POST /api/data/stats
const stats = async (req, res) => {
    try { 
        const data = await execSP(proc.data.stats, getConfig(req));
        ok(res, data);
    } catch (err) { fail(res, err); }
};

// POST /api/data/quittances
const quittances = async (req, res) => {
    try {
        const { FK_Police_Id = 0 } = req.body;
        const data = await execSP(proc.data.quittances, { ...getConfig(req), FK_Police_Id });
        ok(res, data);
    } catch (err) { fail(res, err); }
};

// POST /api/data/sinistres
const sinistres = async (req, res) => {
    try {
        const { FK_Police_Id = 0 } = req.body;
        const data = await execSP(proc.data.sinistres, { ...getConfig(req), FK_Police_Id });
        ok(res, data);
    } catch (err) { fail(res, err); }
};

// POST /api/data/risques
const risques = async (req, res) => {
    try {
        const { FK_Police_Id = 0 } = req.body;
        const data = await execSP(proc.data.risques, { ...getConfig(req), FK_Police_Id });
        ok(res, data);
    } catch (err) { fail(res, err); }
};

// POST /api/data/adherents
const adherents = async (req, res) => {
    try {
        const { FK_Police_Id = 0 } = req.body;
        const data = await execSP(proc.data.adherents, { ...getConfig(req), FK_Police_Id });
        ok(res, data);
    } catch (err) { fail(res, err); }
};

// POST /api/data/garanties
const garanties = async (req, res) => {
    try {
        const { FK_Risque_Id = 0 } = req.body;
        const data = await execSP(proc.data.garanties, { ...getConfig(req), FK_Risque_Id });
        ok(res, data);
    } catch (err) { fail(res, err); }
};

module.exports = { polices, stats, quittances, sinistres, risques, adherents, garanties };
