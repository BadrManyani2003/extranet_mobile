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

const execute = async (query, params = []) => {
    const pool    = await getPool();
    const request = pool.request();
    params.forEach((val, idx) => request.input(`${idx}`, val));
    const result = await request.query(query);
    return result.recordsets;
};

const checkConnection = async () => {
    try {
        await getPool();
        return true;
    } catch (err) {
        console.error('[DB] Connection check failed:', err.message);
        return false;
    }
};

module.exports = { execute, checkConnection };
