const { error } = require('../common/response');

module.exports = (err, req, res, next) => {
    let status = err.status || 500;
    const message = err.message || 'Une erreur imprevue est survenue.';

    if (
        err.name === 'RequestError' ||
        err.code === 'EREQUEST' ||
        message.includes('Impossible de supprimer') ||
        message.includes('deja utilise') ||
        message.includes('expiree') ||
        message.includes('manquant') ||
        message.includes('non autorise')
    ) {
        status = 400;
    }

    if (status >= 500) {
        console.error(`[Erreur] ${req.method} ${req.path}:`, err.stack || err);
    }

    error(res, message, status);
};
