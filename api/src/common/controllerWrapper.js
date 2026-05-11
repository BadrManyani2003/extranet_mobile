const { success, error } = require('./response');

// Wrapper pour les contrôleurs : gère le contexte (user, source, token) et les erreurs
const wrap = (serviceCall, isSingleObject = false) => async (req, res) => {
    try {
        const userId = req.user.id;
        const token  = req.user.token;
        const source = req.headers['x-source'] || 'M';

        // Extract potential query params commonly used
        const policeId   = req.query.policeId ? parseInt(req.query.policeId) : null;
        const risqueId   = req.query.risqueId ? parseInt(req.query.risqueId) : null;
        const adherentId = req.query.adherentId ? parseInt(req.query.adherentId) : null;
        
        // Prepare arguments based on the service call's needs
        // Most calls follow (userId, source, token, [extraId])
        let result;
        if (req.query.enCour !== undefined) {
             result = await serviceCall(userId, source, token, policeId, req.query.enCour);
        } else if (adherentId) {
             result = await serviceCall(userId, source, token, adherentId);
        } else if (risqueId) {
             result = await serviceCall(userId, source, token, risqueId);
        } else if (policeId) {
             result = await serviceCall(userId, source, token, policeId);
        } else {
             result = await serviceCall(userId, source, token);
        }

        const data = result[0] || [];
        success(res, isSingleObject ? (data[0] || {}) : data);
    } catch (e) {
        console.error('API Error:', e);
        error(res, e.message);
    }
};

module.exports = wrap;
