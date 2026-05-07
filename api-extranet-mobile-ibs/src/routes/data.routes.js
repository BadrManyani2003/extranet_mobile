const router = require('express').Router();
const ctrl   = require('../controllers/data.controller');
const auth   = require('../middleware/auth');

router.use(auth);

router.post('/polices',    ctrl.polices);
router.post('/stats',      ctrl.stats);
router.post('/quittances', ctrl.quittances);
router.post('/sinistres',  ctrl.sinistres);
router.post('/risques',    ctrl.risques);
router.post('/adherents',  ctrl.adherents);
router.post('/garanties',  ctrl.garanties);

module.exports = router;
