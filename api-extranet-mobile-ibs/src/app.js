const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();

const apiRoutes = require('./routes/index');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json()); // Parse JSON bodies
app.use(morgan('dev')); // Logging

// API Routes
app.use('/api', apiRoutes);

// Health Check
app.get('/health', (req, res) => {
    res.json({ status: 'OK', message: 'Server is running' });
});

// 404 Handler
app.use((req, res) => {
    res.status(404).json({ success: false, message: `Route ${req.method} ${req.path} not found.` });
});

// Error Handling Middleware
app.use((err, req, res, next) => {
    console.error('❌ Global Error:', err.stack);
    res.status(500).json({ 
        success: false, 
        message: 'Internal Server Error' 
    });
});

module.exports = app;
