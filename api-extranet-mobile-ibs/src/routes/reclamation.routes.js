const router = require('express').Router();
const auth   = require('../middleware/auth');
const ctrl   = require('../controllers/reclamation.controller');

router.use(auth);
router.use(auth.checkRole(['admincab', 'comercialcab', 'client', 'adherent']));

router.post('/list',          ctrl.getAll);
router.post('/detail',        ctrl.getDetail);
router.post('/create',        ctrl.create);
router.post('/add-message',   ctrl.addMessage);
router.post('/delete-message',ctrl.deleteMessage);
router.post('/update-statut', ctrl.updateStatut);
router.post('/delete',        ctrl.remove);

module.exports = router;