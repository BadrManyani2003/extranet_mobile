require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const morgan  = require('morgan');

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.use('/api', require('./routes/index'));

app.get('/health', (_, res) => res.json({ status: 'OK' }));

app.use((req, res) => res.status(404).json({ success: false, message: `Route ${req.method} ${req.path} introuvable.` }));

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ success: false, message: 'Erreur interne du serveur.' });
});

module.exports = app;
