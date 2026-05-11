const authService = require('../services/auth.service');
const { success, error } = require('../common/response');

const getMe = async (req, res) => {
    try {
        const authId = req.user.sub;
        const result = await authService.getUserInfoByAuthId(authId);
        
        if (!result[0] || result[0].length === 0) {
            return error(res, 'Utilisateur introuvable dans la base locale.', 404);
        }

        const user = result[0][0];
        success(res, {
            ...user,
            roles: req.user.roles || []
        });
    } catch (e) { error(res, e.message); }
};

module.exports = {
    getMe
};