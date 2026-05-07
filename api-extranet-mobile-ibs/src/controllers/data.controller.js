const Common = require('../common/Common');
const qry    = require('../sql/qryExtranet');

/**
 * Aide : extrait l'utilisateur connecté et la source depuis la requête.
 * @param {Request} req
 * @param {string} defaultSource - source par défaut ('M' | 'E' | 'A')
 */
const ctx = (req) => ({
    id:     req.user.id,
    token:  req.user.token,
    source: req.headers['x-source']
});

// ─── Polices ────────────────────────────────────────────────────────────────

const getPolices = async (req, res) => {
    try {
        const { id,source, token } = ctx(req);
        const data = await Common.getDonnees(qry.getPolices, [id, source, token]);
        res.json(data[0] || []);
    } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

// ─── Sinistres ───────────────────────────────────────────────────────────────

const getSinistres = async (req, res) => {
    try {
        const { id, source, token } = ctx(req);
        const { policeId } = req.body;
        const data = await Common.getDonnees(qry.getSinistres, [id, source, token, policeId]);
        res.json(data[0] || []);
    } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

const getSinistresEnCours = async (req, res) => {
    try {
        const { id, source, token } = ctx(req);
        const { policeId } = req.body;
        const data = await Common.getDonnees(qry.getSinistresEnCours, [id, source, token, policeId]);
        res.json(data[0] || []);
    } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

// ─── Risques & Garanties ─────────────────────────────────────────────────────

const getRisques = async (req, res) => {
    try {
        const { id, source, token } = ctx(req);
        const { policeId } = req.body;
        const data = await Common.getDonnees(qry.getRisques, [id, source, token, policeId]);
        res.json(data[0] || []);
    } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

const getGaranties = async (req, res) => {
    try {
        const { id, source, token } = ctx(req);
        const { risqueId } = req.body;
        const data = await Common.getDonnees(qry.getGarantiesByRisque, [id, source, token, risqueId]);
        res.json(data[0] || []);
    } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

// ─── Quittances ──────────────────────────────────────────────────────────────

const getQuittances = async (req, res) => {
    try {
        const { id, source, token } = ctx(req);
        const { policeId } = req.body;
        const data = await Common.getDonnees(qry.getQuittances, [id, source, token, policeId]);
        res.json(data[0] || []);
    } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

const getImpayes = async (req, res) => {
    try {
        const { id, source, token } = ctx(req);
        const { policeId, enCour = 'O' } = req.body;
        const data = await Common.getDonnees(qry.getImpayes, [id, source, token, policeId, enCour]);
        res.json(data[0] || []);
    } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

// ─── Adhérents ───────────────────────────────────────────────────────────────

const getAdherents = async (req, res) => {
    try {
        const { id, source, token } = ctx(req);
        const { policeId } = req.body;
        const data = await Common.getDonnees(qry.getAdherents, [id, source, token, policeId]);
        res.json(data[0] || []);
    } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

const getPersACharge = async (req, res) => {
    try {
        const { id, source, token } = ctx(req);
        const { adherentId } = req.body;
        const data = await Common.getDonnees(qry.getPersACharge, [id, source, token, adherentId]);
        res.json(data[0] || []);
    } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

// ─── Statistiques ────────────────────────────────────────────────────────────

const getStats = async (req, res) => {
    try {
        const { id, source, token } = ctx(req);
        const data = await Common.getDonnees(qry.getStats, [id, source, token]);
        res.json(data[0] || []);
    } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

const getStatsByPolice = async (req, res) => {
    try {
        const { id, source, token } = ctx(req);
        const { policeId } = req.body;
        const data = await Common.getDonnees(qry.getStatsByPolice, [id, token, source, policeId]);
        res.json(data[0]?.[0] || {});
    } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

module.exports = {
    getPolices,
    getSinistres, getSinistresEnCours,
    getRisques,   getGaranties,
    getQuittances, getImpayes,
    getAdherents,  getPersACharge,
    getStats,      getStatsByPolice
};
