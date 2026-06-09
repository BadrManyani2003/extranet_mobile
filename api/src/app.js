const express     = require('express');
const cors        = require('cors');
const helmet      = require('helmet');
const compression = require('compression');
const rateLimit   = require('express-rate-limit');

const app = express();

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, 
    max: process.env.NODE_ENV === 'production' ? 100 : 1000, 
    message: { success: false, message: 'Trop de requetes. Veuillez reessayer plus tard.' },
    standardHeaders: true,
    legacyHeaders: false,
});

if (!process.env.ALLOWED_ORIGINS) {
    throw new Error("La variable d'environnement 'ALLOWED_ORIGINS' est manquante dans .env.");
}
const allowedOrigins = process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim().replace(/^['"]|['"]$/g, ''));

app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            console.warn(`[CORS Bloque] La requete depuis l'origine "${origin}" a ete bloquee. Origines autorisees:`, allowedOrigins);
            callback(new Error('Non autorise par CORS'));
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-source', 'x-impersonation', 'x-impersonated-user-id'],
    credentials: true
}));

app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));
app.use(compression());
app.use(limiter);
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ limit: '100mb', extended: true }));

const errorHandler = require('./middleware/errorHandler');

app.use('/api', require('./routes/index'));

app.get('/health', (_, res) => res.json({ status: 'OK', timestamp: new Date() }));

app.use((req, res) => res.status(404).json({ success: false, message: `Route ${req.method} ${req.path} introuvable.` }));

app.use(errorHandler);

module.exports = app;