const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/data.controller');
const auth    = require('../middleware/auth');

router.use(auth);
router.use(auth.checkRole(['admin_cabinet', 'commercial_cabinet', 'client', 'adherent', 'expert']));

// --- Routes de base ---
router.get('/polices',              auth.checkRole(['admin_cabinet', 'commercial_cabinet', 'client', 'adherent', 'expert']), ctrl.getPolices);
router.get('/stats',                auth.checkRole(['admin_cabinet', 'commercial_cabinet', 'client', 'adherent', 'expert']), ctrl.getStats);
router.get('/stats/police',         auth.checkRole(['admin_cabinet', 'commercial_cabinet', 'client', 'adherent', 'expert']), ctrl.getStatsByPolice);

// --- Contrats & Risques ---
router.get('/risques',              auth.checkRole(['admin_cabinet', 'commercial_cabinet', 'client', 'adherent', 'expert']), ctrl.getRisques);
router.get('/garanties',            auth.checkRole(['admin_cabinet', 'commercial_cabinet', 'client', 'adherent', 'expert']), ctrl.getGaranties);
router.get('/quittances',           auth.checkRole(['admin_cabinet', 'commercial_cabinet', 'client', 'expert']), ctrl.getQuittances);
router.get('/quittances/impayes',   auth.checkRole(['admin_cabinet', 'commercial_cabinet', 'client', 'expert']), ctrl.getImpayes);
router.get('/adherents',            auth.checkRole(['admin_cabinet', 'commercial_cabinet', 'client', 'adherent', 'expert']), ctrl.getAdherents);
router.get('/adherents/famille',    auth.checkRole(['admin_cabinet', 'commercial_cabinet', 'client', 'adherent', 'expert']), ctrl.getPersACharge);
router.get('/sinistres',            auth.checkRole(['admin_cabinet', 'commercial_cabinet', 'client', 'adherent', 'expert']), ctrl.getSinistres);
router.get('/sinistres/en-cours',   auth.checkRole(['admin_cabinet', 'commercial_cabinet', 'client', 'adherent', 'expert']), ctrl.getSinistresEnCours);
router.get('/documents',            auth.checkRole(['admin_cabinet', 'commercial_cabinet', 'client', 'adherent', 'expert']), ctrl.getDocumentsByPolice);

module.exports = router;