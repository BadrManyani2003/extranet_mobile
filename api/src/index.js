require('dotenv').config();
const app  = require('./app');
const db   = require('./services/db.service');
const PORT = process.env.PORT || 5000;

const startServer = async () => {
    const dbOk = await db.checkConnection();
    
    app.listen(PORT, () => {
        console.log(`🚀 Extranet API: http://localhost:${PORT}`);
        console.log(`🔗 Database: ${dbOk ? 'CONNECTED' : 'FAILED'}`);
        console.log(`🌍 Mode: ${process.env.NODE_ENV || 'development'}`);
    });
};

startServer();
