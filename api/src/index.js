require('dotenv').config();
const app  = require('./app');
const db   = require('./services/db.service');
const PORT = process.env.PORT || 5000;

const startServer = async () => {
    require('fs').appendFileSync('C:/PRJ/extranet_mobile/api/startup.log', 'SERVER STARTING\n');
    console.log('--- SYSTEM STARTUP ---');

    
    // Vérification de la base de données
    const dbOk = await db.checkConnection();
    if (dbOk) {
        console.log('✅ Database: CONNECTED');
    } else {
        console.warn('⚠️  Database: CONNECTION FAILED (Verify SQL Server)');
    }

    app.listen(PORT, () => {
        console.log(`🚀 Server ready on port ${PORT}`);
        console.log('-----------------------');
    });
};

startServer();