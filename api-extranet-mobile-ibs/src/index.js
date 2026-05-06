require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const routes = require('./routes');
const db = require('./utils/db');
const response = require('./utils/response');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.use('/api', routes);

app.get('/', (req, res) => {
    res.json({ message: 'IBS Extranet Mobile API v2' });
});

app.get('/health', async (req, res) => {
    try {
        await db.query('SELECT 1');
        res.json({ status: 'OK', database: 'Connected' });
    } catch (err) {
        res.status(503).json({ status: 'Error', message: err.message });
    }
});

app.use((err, req, res, next) => {
    response.error(res, err);
});

app.listen(PORT, () => {
    console.log(`🚀 API v2 running on http://localhost:${PORT}`);
});
