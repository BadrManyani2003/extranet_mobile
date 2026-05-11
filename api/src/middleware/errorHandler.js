const { error } = require('../common/response');

/**
 * Global Error Handler Middleware
 */
module.exports = (err, req, res, next) => {
    const status = err.status || 500;
    const message = err.message || 'Une erreur imprévue est survenue.';
    
    // Log the error for debugging
    console.error(`[${new Date().toISOString()}] ❌ ${req.method} ${req.path}: ${message}`);
    if (status === 500) {
        console.error(err.stack);
    }

    error(res, message, status);
};
