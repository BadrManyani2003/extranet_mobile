const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/data.controller');
const auth    = require('../middleware/auth');

router.use(auth);
router.use(auth.checkRole(['admin_cabinet', 'commercial_cabinet', 'client', 'adherent']));

// --- Routes de base ---
router.get('/polices',              auth.checkRole(['admin_cabinet', 'commercial_cabinet', 'client', 'adherent']), ctrl.getPolices);
router.get('/stats',                auth.checkRole(['admin_cabinet', 'commercial_cabinet', 'client', 'adherent']), ctrl.getStats);
router.get('/stats/police',         auth.checkRole(['admin_cabinet', 'commercial_cabinet', 'client', 'adherent']), ctrl.getStatsByPolice);

// --- Contrats & Risques ---
router.get('/risques',              auth.checkRole(['admin_cabinet', 'commercial_cabinet', 'client', 'adherent']), ctrl.getRisques);
router.get('/garanties',            auth.checkRole(['admin_cabinet', 'commercial_cabinet', 'client', 'adherent']), ctrl.getGaranties);
router.get('/quittances',           auth.checkRole(['admin_cabinet', 'commercial_cabinet', 'client']), ctrl.getQuittances);
router.get('/quittances/impayes',   auth.checkRole(['admin_cabinet', 'commercial_cabinet', 'client']), ctrl.getImpayes);
router.get('/adherents',            auth.checkRole(['admin_cabinet', 'commercial_cabinet', 'client', 'adherent']), ctrl.getAdherents);
router.get('/adherents/famille',    auth.checkRole(['admin_cabinet', 'commercial_cabinet', 'client', 'adherent']), ctrl.getPersACharge);
router.get('/sinistres',            auth.checkRole(['admin_cabinet', 'commercial_cabinet', 'client', 'adherent']), ctrl.getSinistres);
router.get('/sinistres/en-cours',   auth.checkRole(['admin_cabinet', 'commercial_cabinet', 'client', 'adherent']), ctrl.getSinistresEnCours);
router.get('/documents',            auth.checkRole(['admin_cabinet', 'commercial_cabinet', 'client', 'adherent']), ctrl.getDocumentsByPolice);

module.exports = router;