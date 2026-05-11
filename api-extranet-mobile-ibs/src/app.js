require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const morgan  = require('morgan');
const helmet  = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');

const app = express();

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
});

app.use(helmet());
app.use(compression());
app.use(limiter);
app.use(cors({
    origin: '*', 
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-source'],
    credentials: true
}));
app.use(express.json());
app.use(morgan('combined')); // Better logging for production

app.use('/api', require('./routes/index'));

app.get('/health', (_, res) => res.json({ status: 'OK' }));

app.use((req, res) => res.status(404).json({ success: false, message: `Route ${req.method} ${req.path} introuvable.` }));

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ success: false, message: 'Erreur interne du serveur.' });
});

module.exports = app;