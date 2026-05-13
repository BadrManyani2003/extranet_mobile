const router = require('express').Router();
const auth = require('../middleware/auth');
const ctrl = require('../controllers/reclamation.controller');

router.use(auth);
// Tous les utilisateurs authentifiés peuvent accéder aux réclamations
router.use(auth.checkRole(['admin_cabinet', 'commercial_cabinet', 'client', 'adherent']));

router.post('/list',           ctrl.getReclamations);
router.post('/detail',         ctrl.getReclamationDetails);
router.post('/create',         ctrl.createReclamation);
router.post('/add-message',    ctrl.addMessage);
router.post('/update-statut',  ctrl.updateStatus);
router.post('/delete',         ctrl.deleteReclamation);
router.post('/delete-message', ctrl.deleteMessage);

module.exports = router;