const db  = require('../config/database');
const sql = require('mssql');

let poolPromise = null;

class Common {
    static async getPool() {
        try {
            if (!poolPromise) {
                poolPromise = sql.connect(db.sqlConfig);
            }
            return await poolPromise;
        } catch (error) {
            console.error('Database connection error:', error);
            poolPromise = null;
            throw error;
        }
    }

    static async executeQuery(mySql, params = []) {
        try {
            const pool = await this.getPool();
            const request = pool.request();
            params.forEach((v, i) => request.input(`${i}`, v));
            const result = await request.query(mySql);
            return result.recordsets;
        } catch (error) {
            console.error(`Query execution error: ${mySql}`, error);
            throw error;
        }
    }

    static async getDonnees(mySql, params = []) {
        return this.executeQuery(mySql, params);
    }

    static async setDonnees(mySql, params = []) {
        return this.executeQuery(mySql, params);
    }
}

module.exports = Common;