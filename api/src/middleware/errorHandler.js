const { error } = require('../common/response');

module.exports = (err, req, res, next) => {
    let status = err.status || 500;
    const message = err.message || 'Une erreur imprévue est survenue.';

    if (
        err.name === 'RequestError' ||
        err.code === 'EREQUEST' ||
        message.includes('Impossible de supprimer') ||
        message.includes('déjà utilisé') ||
        message.includes('expirée') ||
        message.includes('manquant') ||
        message.includes('non autorisé')
    ) {
        status = 400;
    }

    if (status >= 500) {
        console.error(`[Error] ${req.method} ${req.path}:`, err.stack || err);
    }

    error(res, message, status);
};
