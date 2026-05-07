const router = require('express').Router();
const auth   = require('../middleware/auth');
const ctrl   = require('../controllers/data.controller');

router.use(auth);
router.use(auth.checkRole(['admincab', 'comercialcab', 'client', 'adherent']));

router.post('/polices',              ctrl.getPolices);
router.post('/stats',                ctrl.getStats);
router.post('/stats/police',         ctrl.getStatsByPolice);
router.post('/sinistres',            ctrl.getSinistres);
router.post('/sinistres/en-cours',   ctrl.getSinistresEnCours);
router.post('/risques',              ctrl.getRisques);
router.post('/garanties',            ctrl.getGaranties);
router.post('/quittances',           ctrl.getQuittances);
router.post('/quittances/impayes',   ctrl.getImpayes);
router.post('/adherents',            ctrl.getAdherents);
router.post('/adherents/famille',    ctrl.getPersACharge);

module.exports = router;
