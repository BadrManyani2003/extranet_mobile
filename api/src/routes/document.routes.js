const router = require('express').Router();
const auth   = require('../middleware/auth');
const ctrl   = require('../controllers/document.controller');

// Authentification obligatoire sur toutes les routes
router.use(auth);

const allRoles   = auth.checkRole(['admin_cabinet', 'commercial_cabinet', 'client', 'adherent', 'expert']);
const adminRoles = auth.checkRole(['admin_cabinet', 'commercial_cabinet']);

// Upload : accessible à tous les rôles authentifiés
router.post('/upload', allRoles, ctrl.uploadDocument);

// Liste des documents : admin uniquement
router.post('/list',   adminRoles, ctrl.getDocuments);

// Suppression d'un document par son Id : admin uniquement
router.post('/delete', adminRoles, ctrl.deleteDocument);

// Consultation d'un document par son Id : admin et propriétaire du document
router.post('/view',   allRoles, ctrl.getDocumentById);

module.exports = router;
