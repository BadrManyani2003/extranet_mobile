const sql       = require('mssql');
const dbConfig  = require('../config/database');

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
 * Upload un document dans StdDocument.
 * Utilise mssql directement pour gérer le type VARBINARY(MAX).
 */
const upload = async (userId, token, nature, identifiant, type, documentBuffer) => {
    const pool    = await getPool();
    const request = pool.request();

    request.input('userId',      sql.Int,            userId);
    request.input('token',       sql.VarChar(sql.MAX), token);
    request.input('nature',      sql.VarChar(50),    nature);
    request.input('identifiant', sql.Int,            identifiant);
    request.input('type',        sql.VarChar(255),   type);
    request.input('document',    sql.VarBinary(sql.MAX), documentBuffer);

    const result = await request.query(
        `exec dbo.sp_UploadDocument @userId, @token, @nature, @identifiant, @type, @document`
    );
    return result.recordsets;
};

/**
 * Récupère la liste des documents (admin uniquement).
 */
const getDocuments = async (userId, token, source, nature, identifiant, dateFrom, dateTo) => {
    const pool    = await getPool();
    const request = pool.request();

    request.input('userId',      sql.Int,              userId);
    request.input('token',       sql.VarChar(sql.MAX), token);
    request.input('source',      sql.VarChar(10),      source);
    request.input('nature',      sql.VarChar(50),      nature   || null);
    request.input('identifiant', sql.Int,              identifiant ? parseInt(identifiant) : null);
    request.input('dateFrom',    sql.Date,             dateFrom || null);
    request.input('dateTo',      sql.Date,             dateTo   || null);

    const result = await request.query(
        `exec dbo.sp_GetDocuments @userId, @token, @source, @nature, @identifiant, @dateFrom, @dateTo`
    );
    return result.recordsets;
};

/**
 * Récupère le contenu binaire d'un document par son Id.
 */
const getDocumentById = async (userId, token, source, documentId) => {
    const pool    = await getPool();
    const request = pool.request();

    request.input('userId',     sql.Int,              userId);
    request.input('token',      sql.VarChar(sql.MAX), token);
    request.input('source',     sql.VarChar(10),      source);
    request.input('documentId', sql.Int,              documentId);

    const result = await request.query(
        `exec dbo.sp_GetDocumentById @userId, @token, @source, @documentId`
    );
    return result.recordsets;
};

/**
 * Supprime un document par son Id.
 */
const deleteDocument = async (userId, token, source, documentId) => {
    const pool    = await getPool();
    const request = pool.request();

    request.input('userId',     sql.Int,              userId);
    request.input('token',      sql.VarChar(sql.MAX), token);
    request.input('source',     sql.VarChar(10),      source);
    request.input('documentId', sql.Int,              documentId);

    const result = await request.query(
        `exec dbo.sp_DeleteDocument @userId, @token, @source, @documentId`
    );
    return result.recordsets;
};

module.exports = { upload, getDocuments, getDocumentById, deleteDocument };
