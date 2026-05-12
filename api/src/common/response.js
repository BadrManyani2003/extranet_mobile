/**
 * Standardizes API responses
 */

/**
 * Envoie une réponse de succès (200 OK)
 * @param {Response} res Objet de réponse Express
 * @param {any} data Données à envoyer (défaut: [])
 */
const success = (res, data = []) => {
    res.status(200).json(data);
};

/**
 * Envoie une réponse d'erreur sécurisée
 * @param {Response} res 
 * @param {any} err Message ou objet d'erreur
 * @param {number} status 
 */
const error = (res, err, status = 500) => {
    const isDev = process.env.NODE_ENV === 'development';
    const message = (typeof err === 'string') ? err : err.message;
    
    // Log interne détaillé
    console.error(`[API ERROR] ${new Date().toISOString()}:`, err);

    res.status(status).json({ 
        success: false, 
        // En production, on ne renvoie pas le message d'erreur technique si c'est une 500
        message: (status === 500 && !isDev) ? 'Une erreur interne est survenue.' : message,
        timestamp: new Date().toISOString()
    });
};

module.exports = { success, error };

