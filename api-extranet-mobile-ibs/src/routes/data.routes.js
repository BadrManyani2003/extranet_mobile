const router = require('express').Router();
const auth   = require('../middleware/auth');
const ctrl   = require('../controllers/data.controller');

router.use(auth);
router.use(auth.checkRole(['admincab', 'comercialcab', 'client', 'adherent']));

router.get('/polices',              ctrl.getPolices);
router.get('/stats',                ctrl.getStats);
router.get('/stats/police',         ctrl.getStatsByPolice);
router.get('/sinistres',            ctrl.getSinistres);
router.get('/sinistres/en-cours',   ctrl.getSinistresEnCours);
router.get('/risques',              ctrl.getRisques);
router.get('/garanties',            ctrl.getGaranties);
router.get('/quittances',           ctrl.getQuittances);
router.get('/quittances/impayes',   ctrl.getImpayes);
router.get('/adherents',            ctrl.getAdherents);
router.get('/adherents/famille',    ctrl.getPersACharge);

module.exports = router;