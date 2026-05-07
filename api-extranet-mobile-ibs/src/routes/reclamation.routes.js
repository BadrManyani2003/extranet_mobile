const router = require('express').Router();
const ctrl   = require('../controllers/reclamation.controller');
const auth   = require('../middleware/auth');

router.use(auth);

router.post('/list',          ctrl.getAll);
router.post('/detail',        ctrl.getDetail);
router.post('/create',        ctrl.create);
router.post('/add-message',   ctrl.addMessage);
router.post('/update-statut', ctrl.updateStatut);
router.post('/delete',        ctrl.remove);

module.exports = router;
