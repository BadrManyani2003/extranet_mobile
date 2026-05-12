const { error } = require('../common/response');

/**
 * Global Error Handler Middleware
 */
module.exports = (err, req, res, next) => {
    const status  = err.status  || 500;
    const message = err.message || 'Une erreur imprévue est survenue.';
    error(res, message, status);
};
