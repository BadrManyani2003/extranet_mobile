require('dotenv').config();
const express     = require('express');
const cors        = require('cors');
const helmet      = require('helmet');
const compression = require('compression');
const rateLimit   = require('express-rate-limit');

const app = express();






const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, 
    max: process.env.NODE_ENV === 'production' ? 100 : 1000, 
    message: { success: false, message: 'Trop de requêtes. Veuillez réessayer plus tard.' },
    standardHeaders: true,
    legacyHeaders: false,
});

const allowedOrigins = process.env.ALLOWED_ORIGINS 
    ? process.env.ALLOWED_ORIGINS.split(',') 
    : ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:8081'];

app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-source'],
    credentials: true
}));

app.use(helmet()); // Protection standard par défaut
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));
app.use(compression());
app.use(limiter);
app.use(express.json());

const errorHandler = require('./middleware/errorHandler');

app.use('/api', require('./routes/index'));

app.get('/health', (_, res) => res.json({ status: 'OK', timestamp: new Date() }));

app.use((req, res) => res.status(404).json({ success: false, message: `Route ${req.method} ${req.path} introuvable.` }));

app.use(errorHandler);


module.exports = app;