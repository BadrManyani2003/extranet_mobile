const { poolPromise } = require('../src/config/db');

class Common {
    static execute = async (queryStr, values = []) => {
        const pool = await poolPromise;
        try {
            const result = await pool.query(queryStr, values);
            return result.recordset || [];
        } catch (error) {
            throw error;
        }
    };
}

module.exports = Common;
