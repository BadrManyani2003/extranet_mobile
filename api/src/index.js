require('dotenv').config();
const app  = require('./app');
const db   = require('./services/db.service');
const PORT = process.env.PORT || 5000;

const startServer = async () => {
    // Check database connection
    const dbOk = await db.checkConnection();
    
    app.listen(PORT, () => {
        console.log(`\n🚀 Extranet API running on port ${PORT}`);
        console.log(`🔗 Database: ${dbOk ? 'CONNECTED' : 'CONNECTION FAILED'}`);
        console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}\n`);
    });
};

startServer();
