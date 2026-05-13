const { error } = require('../common/response');

/**
 * Global Error Handler Middleware
 */
module.exports = (err, req, res, next) => {
    const status  = err.status  || 500;
    const message = err.message || 'Une erreur imprévue est survenue.';

    // Log server errors for debugging
    if (status >= 500) {
        console.error(`[Error] ${req.method} ${req.path}:`, err.stack || err);
    }

    error(res, message, status);
};
