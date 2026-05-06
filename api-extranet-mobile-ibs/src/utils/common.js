const db = require('./db');

const common = {
    executeps: async (procedureName, data = {}, config = {}) => {
        return await db.execute(procedureName, { ...data, ...config });
    }
};

module.exports = common;
