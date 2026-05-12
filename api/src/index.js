require('dotenv').config();
const app  = require('./app');
const db   = require('./services/db.service');
const PORT = process.env.PORT || 5000;

const startServer = async () => {
    console.log('--- SYSTEM STARTUP ---');
    
    // Check DB
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