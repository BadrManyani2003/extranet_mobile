require('dotenv').config();
const sql = require('mssql');

const requiredDbEnv = ['DB_USER', 'DB_PASSWORD', 'DB_DATABASE', 'DB_SERVER', 'DB_PORT'];
for (const envVar of requiredDbEnv) {
    if (!process.env[envVar]) {
        throw new Error(`La variable d'environnement de base de données '${envVar}' est manquante dans .env.`);
    }
}

const sqlConfig = {
    user:     process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    server:   process.env.DB_SERVER,
    port:     parseInt(process.env.DB_PORT, 10),
    pool:     { max: 10, min: 0, idleTimeoutMillis: 30000 },
    options:  { encrypt: false, trustServerCertificate: true }
};

module.exports = { sqlConfig };