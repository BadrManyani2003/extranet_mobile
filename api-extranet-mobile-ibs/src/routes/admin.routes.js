const router = require('express').Router();
const ctrl   = require('../controllers/admin.controller');
const auth   = require('../middleware/auth');

router.use(auth);

router.post('/users',                    ctrl.getUsers);
router.post('/users/save',               ctrl.saveUser);
router.post('/users/delete',             ctrl.deleteUser);
router.post('/users/sync-keycloak',      ctrl.syncKeycloak);

router.post('/clients',                  ctrl.getClients);
router.post('/clients/create-user',      ctrl.createUserFromClient);

router.post('/adherents',                ctrl.getAdherents);
router.post('/adherents/create-user',    ctrl.createUserFromAdherent);

module.exports = router;
