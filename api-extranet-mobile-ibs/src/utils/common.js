const Common = require('../../common/db.common');

const common = {
    getConfig: (req) => [
        req.body.Id || req.body.id || req.body.FK_User_Id || req.user?.id || 1,
        (req.body.Source || req.headers['x-source'] || 'M').charAt(0).toUpperCase(),
        req.body.Token || req.headers.authorization?.split(' ')[1] || ''
    ],

    execute: async (procedure, params = []) => {
        return await Common.execute(procedure, params);
    }
};

module.exports = common;
