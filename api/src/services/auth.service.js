const db = require('./db.service');
const qry = require('../sql/qryExtranet');

const getUserByAuthId = (authId) => db.execute(qry.getUserByAuthId, [authId]);

const getUserInfoByAuthId = (authId) => db.execute(qry.getUserInfoByAuthId, [authId]);

const updateToken = (token, authId) => db.execute(qry.updateToken, [token, authId]);

module.exports = {
    getUserByAuthId,
    getUserInfoByAuthId,
    updateToken
};
