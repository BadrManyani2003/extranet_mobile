const router = require('express').Router();
const auth = require('../middleware/auth');
const ctrl = require('../controllers/admin.controller');

router.use(auth);
// Only admins and commercials can access admin routes
router.use(auth.checkRole(['admincab', 'comercialcab']));

router.post('/users',                   ctrl.getUsers);
router.post('/users/save',              ctrl.saveUser);
router.post('/users/delete',            ctrl.deleteUser);
router.post('/users/sync-keycloak',    ctrl.syncKeycloak);

router.post('/clients',                 ctrl.getClients);
router.post('/clients/create-user',     ctrl.createUserFromClient);

router.post('/adherents',               ctrl.getAdherents);
router.post('/adherents/create-user',   ctrl.createUserFromAdherent);

module.exports = router;