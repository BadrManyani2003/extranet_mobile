const db  = require('../config/database');
const sql = require('mssql');

let poolPromise = null;

class Common {
    static async getPool() {
        if (!poolPromise) {
            poolPromise = sql.connect(db.sqlConfig);
        }
        return poolPromise;
    }

    static async getDonnees(mySql, params = []) {
        const pool    = await this.getPool();
        const request = pool.request();
        params.forEach((v, i) => request.input(`${i}`, v));
        const result = await request.query(mySql);
        return result.recordsets;
    }

    static async setDonnees(mySql, params = []) {
        const pool    = await this.getPool();
        const request = pool.request();
        params.forEach((v, i) => request.input(`${i}`, v));
        const result = await request.query(mySql);
        return result.recordsets;
    }
}

module.exports = Common;