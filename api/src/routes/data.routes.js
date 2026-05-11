const router = require('express').Router();
const auth   = require('../middleware/auth');
const ctrl   = require('../controllers/data.controller');

router.use(auth);

// Generic check: at least one of these roles is required for ANY data access
router.use(auth.checkRole(['admincab', 'comercialcab', 'client', 'adherent']));

// Specific restrictions
router.get('/polices',              auth.checkRole(['admincab', 'comercialcab', 'client']), ctrl.getPolices);
router.get('/stats',                auth.checkRole(['admincab', 'comercialcab', 'client']), ctrl.getStats);
router.get('/stats/police',         auth.checkRole(['admincab', 'comercialcab', 'client']), ctrl.getStatsByPolice);
router.get('/sinistres',            ctrl.getSinistres); // Allowed for all (adherent & client)
router.get('/sinistres/en-cours',   ctrl.getSinistresEnCours);
router.get('/risques',              auth.checkRole(['admincab', 'comercialcab', 'client']), ctrl.getRisques);
router.get('/garanties',            auth.checkRole(['admincab', 'comercialcab', 'client']), ctrl.getGaranties);
router.get('/quittances',           auth.checkRole(['admincab', 'comercialcab', 'client']), ctrl.getQuittances);
router.get('/quittances/impayes',   auth.checkRole(['admincab', 'comercialcab', 'client']), ctrl.getImpayes);
router.get('/adherents',            auth.checkRole(['admincab', 'comercialcab', 'client']), ctrl.getAdherents);
router.get('/adherents/famille',    ctrl.getPersACharge); // Allowed for all

module.exports = router;