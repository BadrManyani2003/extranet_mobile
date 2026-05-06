const express = require('express');
const router = express.Router();
const dataController = require('../controllers/data.controller');
const authMiddleware = require('../middlewares/auth.middleware');

router.post('/policies', authMiddleware, dataController.getPolices);
router.post('/unpaid', authMiddleware, dataController.getUnpaid);
router.post('/stats', authMiddleware, dataController.getGlobalStats);
router.post('/reclamations', authMiddleware, dataController.getReclamations);
router.post('/messages', authMiddleware, dataController.getMessages);
router.post('/reclamation/create', authMiddleware, dataController.createReclamation);
router.post('/reclamation/send-message', authMiddleware, dataController.sendMessage);

module.exports = router;
