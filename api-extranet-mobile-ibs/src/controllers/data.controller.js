const dataService = require('../services/data.service');
const { success, error } = require('../common/response');

const getContext = (req) => ({
    userId: req.user.id,
    token:  req.user.token,
    source: req.headers['x-source'] || 'M' // Default to Mobile if not specified
});

const getPolices = async (req, res) => {
    try {
        const { userId, source, token } = getContext(req);
        const result = await dataService.getPolices(userId, source, token);
        success(res, result[0] || []);
    } catch (e) { error(res, e.message); }
};

const getSinistres = async (req, res) => {
    try {
        const { userId, source, token } = getContext(req);
        const policeId = req.query.policeId ? parseInt(req.query.policeId) : null;
        const result = await dataService.getSinistres(userId, source, token, policeId);
        success(res, result[0] || []);
    } catch (e) { error(res, e.message); }
};

const getSinistresEnCours = async (req, res) => {
    try {
        const { userId, source, token } = getContext(req);
        const policeId = req.query.policeId ? parseInt(req.query.policeId) : null;
        const result = await dataService.getSinistresEnCours(userId, source, token, policeId);
        success(res, result[0] || []);
    } catch (e) { error(res, e.message); }
};

const getRisques = async (req, res) => {
    try {
        const { userId, source, token } = getContext(req);
        const policeId = req.query.policeId ? parseInt(req.query.policeId) : null;
        const result = await dataService.getRisques(userId, source, token, policeId);
        success(res, result[0] || []);
    } catch (e) { error(res, e.message); }
};

const getGaranties = async (req, res) => {
    try {
        const { userId, source, token } = getContext(req);
        const risqueId = req.query.risqueId ? parseInt(req.query.risqueId) : null;
        const result = await dataService.getGaranties(userId, source, token, risqueId);
        success(res, result[0] || []);
    } catch (e) { error(res, e.message); }
};

const getQuittances = async (req, res) => {
    try {
        const { userId, source, token } = getContext(req);
        const policeId = req.query.policeId ? parseInt(req.query.policeId) : null;
        const result = await dataService.getQuittances(userId, source, token, policeId);
        success(res, result[0] || []);
    } catch (e) { error(res, e.message); }
};

const getImpayes = async (req, res) => {
    try {
        const { userId, source, token } = getContext(req);
        const { enCour = 'O' } = req.query;
        const policeId = req.query.policeId ? parseInt(req.query.policeId) : null;
        const result = await dataService.getImpayes(userId, source, token, policeId, enCour);
        success(res, result[0] || []);
    } catch (e) { error(res, e.message); }
};

const getAdherents = async (req, res) => {
    try {
        const { userId, source, token } = getContext(req);
        const policeId = req.query.policeId ? parseInt(req.query.policeId) : null;
        const result = await dataService.getAdherents(userId, source, token, policeId);
        success(res, result[0] || []);
    } catch (e) { error(res, e.message); }
};

const getPersACharge = async (req, res) => {
    try {
        const { userId, source, token } = getContext(req);
        const adherentId = req.query.adherentId ? parseInt(req.query.adherentId) : null;
        const result = await dataService.getPersACharge(userId, source, token, adherentId);
        success(res, result[0] || []);
    } catch (e) { error(res, e.message); }
};

const getStats = async (req, res) => {
    try {
        const { userId, source, token } = getContext(req);
        const result = await dataService.getStats(userId, source, token);
        success(res, result);
    } catch (e) { error(res, e.message); }
};

const getStatsByPolice = async (req, res) => {
    try {
        const { userId, source, token } = getContext(req);
        const policeId = req.query.policeId ? parseInt(req.query.policeId) : null;
        const result = await dataService.getStatsByPolice(userId, token, source, policeId);
        success(res, result[0]?.[0] || {});
    } catch (e) { error(res, e.message); }
};

module.exports = {
    getPolices,
    getSinistres,
    getSinistresEnCours,
    getRisques,
    getGaranties,
    getQuittances,
    getImpayes,
    getAdherents,
    getPersACharge,
    getStats,
    getStatsByPolice
};