const sql = require('mssql');
const dbConfig = require('../config/database');

let poolPromise = null;

const getPool = async () => {
    if (!poolPromise) {
        poolPromise = sql.connect(dbConfig.sqlConfig).catch(err => {
            poolPromise = null;
            throw err;
        });
    }
    return poolPromise;
};

/**
 * Executes a stored procedure call or a query.
 * @param {string} query - The SQL query (e.g., "exec sp_Name @0, @1")
 * @param {Array} params - The parameters to pass
 * @returns {Promise<any[]>} - The first recordset
 */
const execute = async (query, params = []) => {
    const pool    = await getPool();
    const request = pool.request();
    params.forEach((val, idx) => request.input(`${idx}`, val));
    const result = await request.query(query);
    return result.recordsets;
};

module.exports = {
    execute
};
