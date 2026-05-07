const { execSP } = require('./services/dbService');

/**
 * Extract standard parameters from request
 * Returns an object with keys matching SP parameters
 */
const getConfig = (req) => {
    return {
        FK_User_Id: req.user?.id || 0,
        Source: (req.headers['x-source'] || req.body?.Source || 'M').charAt(0).toUpperCase(),
        Token: req.headers.authorization?.split(' ')[1] || req.body?.Token || ''
    };
};

/**
 * Standard Success Response
 */
const ok = (res, data) => {
    res.json({
        success: true,
        data: data ?? []
    });
};

/**
 * Standard Error Response
 */
const fail = (res, err) => {
    console.error('❌ API Error:', err?.message || err);
    res.status(err?.status || 500).json({
        success: false,
        message: err?.message || 'Internal Server Error'
    });
};

module.exports = {
    execSP,
    getConfig,
    ok,
    fail
};
