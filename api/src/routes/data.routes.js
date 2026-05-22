const router = require('express').Router();
const auth   = require('../middleware/auth');
const ctrl   = require('../controllers/data.controller');

const allRoles = auth.checkRole(['admin_cabinet', 'commercial_cabinet', 'client', 'adherent', 'expert']);
const staffRoles = auth.checkRole(['admin_cabinet', 'commercial_cabinet', 'client', 'expert']);

router.use(auth);
router.use(allRoles);

router.get('/polices',            ctrl.getPolices);
router.get('/stats',              ctrl.getStats);
router.get('/stats/police',       ctrl.getStatsByPolice);
router.get('/risques',            ctrl.getRisques);
router.get('/garanties',          ctrl.getGaranties);
router.get('/adherents',          ctrl.getAdherents);
router.get('/adherents/famille',  ctrl.getPersACharge);
router.get('/sinistres',          ctrl.getSinistres);
router.get('/sinistres/en-cours', ctrl.getSinistresEnCours);
router.get('/documents',          ctrl.getDocumentsByPolice);
router.get('/quittances',         staffRoles, ctrl.getQuittances);
router.get('/quittances/impayes', staffRoles, ctrl.getImpayes);

module.exports = router;