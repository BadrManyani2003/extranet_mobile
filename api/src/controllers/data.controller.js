const dataService = require('../services/data.service');
const { success } = require('../common/response');
const asyncHandler = require('../middleware/asyncHandler');

const getContext = (req) => ({
    userId: req.user.id,
    token:  req.user.token,
    source: req.headers['x-source'] || 'E'
});

const getPolices = asyncHandler(async (req, res) => {
    const { userId, source, token } = getContext(req);
    const result = await dataService.getPolices(userId, source, token);
    success(res, result[0] || []);
});

const getSinistres = asyncHandler(async (req, res) => {
    const { userId, source, token } = getContext(req);
    const { policeId } = req.query;
    const result = await dataService.getSinistres(userId, source, token, policeId);
    success(res, result[0] || []);
});

const getSinistresEnCours = asyncHandler(async (req, res) => {
    const { userId, source, token } = getContext(req);
    const { policeId } = req.query;
    const result = await dataService.getSinistresEnCours(userId, source, token, policeId);
    success(res, result[0] || []);
});

const getRisques = asyncHandler(async (req, res) => {
    const { userId, source, token } = getContext(req);
    const { policeId } = req.query;
    const result = await dataService.getRisques(userId, source, token, policeId);
    success(res, result[0] || []);
});

const getGaranties = asyncHandler(async (req, res) => {
    const { userId, source, token } = getContext(req);
    const { risqueId } = req.query;
    const result = await dataService.getGaranties(userId, source, token, risqueId);
    success(res, result[0] || []);
});

const getQuittances = asyncHandler(async (req, res) => {
    const { userId, source, token } = getContext(req);
    const { policeId } = req.query;
    const result = await dataService.getQuittances(userId, source, token, policeId);
    success(res, result[0] || []);
});

const getImpayes = asyncHandler(async (req, res) => {
    const { userId, source, token } = getContext(req);
    const { policeId, enCour } = req.query;
    const result = await dataService.getImpayes(userId, source, token, policeId, enCour);
    success(res, result[0] || []);
});

const getAdherents = asyncHandler(async (req, res) => {
    const { userId, source, token } = getContext(req);
    const { policeId } = req.query || null;
    const result = await dataService.getAdherents(userId, source, token, policeId);
    success(res, result[0] || []);
});

const getPersACharge = asyncHandler(async (req, res) => {
    const { userId, source, token } = getContext(req);
    const { adherentId } = req.query;
    const result = await dataService.getPersACharge(userId, source, token, adherentId);
    success(res, result[0] || []);
});

const getStats = asyncHandler(async (req, res) => {
    const { userId, source, token } = getContext(req);
    const result = await dataService.getStats(userId, source, token);
    success(res, result || []);
});

const getStatsByPolice = asyncHandler(async (req, res) => {
    const { userId, source, token } = getContext(req);
    const { policeId } = req.query;
    const result = await dataService.getStatsByPolice(userId, source, token, policeId);
    success(res, result[0]?.[0] || {});
});

const getDocumentsByPolice = asyncHandler(async (req, res) => {
    const { userId, source, token } = getContext(req);
    const { policeId } = req.query;
    const result = await dataService.getDocumentsByPolice(userId, source, token, policeId);
    success(res, result[0] || []);
});

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
    getStatsByPolice,
    getDocumentsByPolice
};
