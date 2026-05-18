const router = require('express').Router();
const auth = require('../middleware/auth');
const ctrl = require('../controllers/admin.controller');

router.use(auth);
// Only admins and commercials can access admin routes
router.use(auth.checkRole(['admin_cabinet', 'commercial_cabinet']));

router.post('/users',                   ctrl.getUsers);
router.post('/users/save',              ctrl.saveUser);
router.post('/users/delete',            ctrl.deleteUser);
router.post('/users/sync-keycloak',    ctrl.syncKeycloak);
router.get('/roles',                    ctrl.getAvailableRoles);
router.post('/users/roles',             ctrl.updateUserRoles);

router.post('/clients',                 ctrl.getClients);
router.post('/clients/create-user',     ctrl.createUserFromClient);
router.post('/clients/link-user',       ctrl.linkUserToClient);
router.post('/clients/unlink-user',     ctrl.unlinkUserFromClient);
router.post('/clients/options',         ctrl.updateClientOptions);

router.post('/adherents',               ctrl.getAdherents);
router.post('/adherents/create-user',   ctrl.createUserFromAdherent);
router.post('/adherents/link-user',     ctrl.linkUserToAdherent);

module.exports = router;