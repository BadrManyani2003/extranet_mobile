const { poolPromise, sql } = require('../config/db');

const db = {
    execute: async (procedureName, params = {}) => {
        const pool = await poolPromise;
        const request = pool.request();
        
        Object.entries(params).forEach(([key, value]) => {
            if (value === null || value === undefined) {
                request.input(key, sql.VarChar, null);
            } else if (typeof value === 'number') {
                request.input(key, Number.isInteger(value) ? sql.Int : sql.Decimal, value);
            } else if (typeof value === 'boolean') {
                request.input(key, sql.Bit, value);
            } else if (value instanceof Date) {
                request.input(key, sql.DateTime, value);
            } else {
                request.input(key, sql.VarChar, value);
            }
        });

        const result = await request.execute(procedureName);
        return result.recordset || [];
    },

    query: async (queryString, params = []) => {
        const pool = await poolPromise;
        const request = pool.request();
        
        params.forEach((value, index) => {
            const paramName = `${index}`;
            if (value === null || value === undefined) request.input(paramName, sql.VarChar, null);
            else if (typeof value === 'number') request.input(paramName, Number.isInteger(value) ? sql.Int : sql.Decimal, value);
            else request.input(paramName, sql.VarChar, value);
        });

        const result = await request.query(queryString);
        return result.recordset || [];
    }
};

module.exports = db;
