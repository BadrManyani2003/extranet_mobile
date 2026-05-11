const sql = require('mssql');
const dbConfig = require('../config/database');

let poolPromise = null;

const getPool = async () => {
    try {
        if (!poolPromise) {
            poolPromise = sql.connect(dbConfig.sqlConfig);
        }
        return await poolPromise;
    } catch (error) {
        console.error('❌ Database Connection Error:', error);
        poolPromise = null;
        throw error;
    }
};

/**
 * Executes a stored procedure call or a query.
 * @param {string} query - The SQL query (e.g., "exec sp_Name @0, @1")
 * @param {Array} params - The parameters to pass
 * @returns {Promise<any[]>} - The first recordset
 */
const execute = async (query, params = []) => {
    try {
        const pool = await getPool();
        const request = pool.request();
        
        params.forEach((val, idx) => {
            request.input(`${idx}`, val);
        });

        const result = await request.query(query);
        return result.recordsets;
    } catch (error) {
        console.error(`❌ Query Execution Error: ${query}`, error);
        throw error;
    }
};

module.exports = {
    execute
};
