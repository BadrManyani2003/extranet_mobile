const express = require('express');
const router = express.Router();
const dataController = require('../controllers/data.controller');
const authMiddleware = require('../middlewares/auth.middleware');



router.get('/policies', authMiddleware, dataController.getPolices);
router.get('/unpaid', authMiddleware, dataController.getUnpaid);
router.get('/stats', authMiddleware, dataController.getGlobalStats);


router.get('/reclamations', authMiddleware, dataController.getReclamations);
router.get('/reclamations/:id/messages', authMiddleware, dataController.getMessages);
router.post('/reclamations', authMiddleware, dataController.createReclamation);
router.post('/reclamations/:id/messages', authMiddleware, dataController.sendMessage);

module.exports = router;
