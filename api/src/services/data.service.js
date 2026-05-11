const db = require('./db.service');
const qry = require('../sql/qryExtranet');

const getPolices = (userId, source, token) => db.execute(qry.getPolices, [userId, source, token]);

const getSinistres = (userId, source, token, policeId) => db.execute(qry.getSinistres, [userId, source, token, policeId]);

const getSinistresEnCours = (userId, source, token, policeId) => db.execute(qry.getSinistresEnCours, [userId, source, token, policeId]);

const getRisques = (userId, source, token, policeId) => db.execute(qry.getRisques, [userId, source, token, policeId]);

const getGaranties = (userId, source, token, risqueId) => db.execute(qry.getGarantiesByRisque, [userId, source, token, risqueId]);

const getQuittances = (userId, source, token, policeId) => db.execute(qry.getQuittances, [userId, source, token, policeId]);

const getImpayes = (userId, source, token, policeId, enCour) => db.execute(qry.getImpayes, [userId, source, token, policeId, enCour]);

const getAdherents = (userId, source, token, policeId) => db.execute(qry.getAdherents, [userId, source, token, policeId]);

const getPersACharge = (userId, source, token, adherentId) => db.execute(qry.getPersACharge, [userId, source, token, adherentId]);

const getStats = (userId, source, token) => db.execute(qry.getStats, [userId, source, token]);

const getStatsByPolice = (userId, token, source, policeId) => db.execute(qry.getStatsByPolice, [userId, token, source, policeId]);

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
