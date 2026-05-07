const db  = require('../config/database');
const sql = require('mssql');

/**
 * Utilitaire d'accès à la base de données.
 * Tous les paramètres sont passés par position : @0, @1, @2, ...
 */
class Common {

    /**
     * Lecture de données (SELECT / EXEC proc de lecture)
     * @param {string} mySql  - Requête SQL ou appel de procédure stockée
     * @param {Array}  params - Tableau de valeurs [val0, val1, ...]
     * @returns {Promise<Array[]>} - recordsets (tableau de tableaux)
     */
    static async getDonnees(mySql, params = []) {
        const pool    = await sql.connect(db.sqlConfig);
        const request = pool.request();
        params.forEach((v, i) => request.input(`${i}`, v));
        const result = await request.query(mySql);
        return result.recordsets;
    }

    /**
     * Écriture de données (INSERT / UPDATE / DELETE / EXEC proc d'écriture)
     * @param {string} mySql  - Requête SQL ou appel de procédure stockée
     * @param {Array}  params - Tableau de valeurs [val0, val1, ...]
     * @returns {Promise<Array[]>} - recordsets retournés par la procédure
     */
    static async setDonnees(mySql, params = []) {
        const pool    = await sql.connect(db.sqlConfig);
        const request = pool.request();
        params.forEach((v, i) => request.input(`${i}`, v));
        const result = await request.query(mySql);
        return result.recordsets;
    }
}

module.exports = Common;
