const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const authMiddleware = require('../middlewares/auth.middleware');


router.use(authMiddleware);


router.post('/users', adminController.getUsers);
router.post('/users/save', adminController.saveUser);
router.post('/users/delete', adminController.deleteUser);
router.post('/users/sync-keycloak', adminController.syncKeycloak);


router.post('/clients', adminController.getClients);
router.post('/clients/create-user', adminController.createUserFromClient);


router.post('/adherents', adminController.getAdherents);
router.post('/adherents/create-user', adminController.createUserFromAdherent);

router.post('/reclamations', adminController.getReclamations);
router.post('/reclamations/reply', adminController.sendReply);

module.exports = router;
