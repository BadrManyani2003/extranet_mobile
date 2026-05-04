const express = require('express');
const router = express.Router();
const reclamationController = require('../controllers/reclamation.controller');
const authMiddleware = require('../middlewares/auth.middleware');

// All routes require authentication
router.use(authMiddleware);

// All methods changed to POST to support parameters in req.body
router.post('/list', reclamationController.getReclamations);
router.post('/detail', reclamationController.getReclamationDetail);
router.post('/create', reclamationController.createReclamation);
router.post('/add-message', reclamationController.addMessage);
router.post('/update-statut', reclamationController.updateStatut);
router.post('/delete', reclamationController.deleteReclamation);

module.exports = router;
