require('dotenv').config({ override: true });
const app  = require('./app');
const db   = require('./services/db.service');

if (!process.env.PORT) {
    throw new Error("La variable d'environnement 'PORT' est manquante dans .env.");
}
if (!process.env.NODE_ENV) {
    throw new Error("La variable d'environnement 'NODE_ENV' est manquante dans .env.");
}

const PORT = process.env.PORT;

const startServer = async () => {
    const dbOk = await db.checkConnection();
    
    app.listen(PORT, () => {
        console.log(`🚀 Extranet API: http://localhost:${PORT}`);
        console.log(`🔗 Database: ${dbOk ? 'CONNECTED' : 'FAILED'}`);
        console.log(`🌍 Mode: ${process.env.NODE_ENV}`);
        console.log(`🌐 CORS Allowed Origins: ${process.env.ALLOWED_ORIGINS}`);
    });
};

startServer();
