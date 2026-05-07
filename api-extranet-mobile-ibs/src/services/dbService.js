const { poolPromise, sql } = require('../config/db');

/**
 * Generic function to execute a stored procedure
 * @param {string} spName - Name of the stored procedure
 * @param {object} params - Object containing parameters { paramName: value }
 * @returns {Promise<Array>} - Returns the recordset
 */
const execSP = async (spName, params = {}) => {
    try {
        const pool = await poolPromise;
        const request = pool.request();

        // Dynamically add inputs
        Object.entries(params).forEach(([key, value]) => {
            request.input(key, value);
        });

        const result = await request.execute(spName);
        
        // Return the first recordset (most common use case)
        return result.recordset || [];
    } catch (err) {
        console.error(`❌ Error executing SP [${spName}]:`, err.message);
        throw err; // Re-throw to be handled by controller
    }
};

module.exports = {
    execSP
};
