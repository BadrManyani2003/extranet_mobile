const router = require('express').Router();
const auth = require('../middleware/auth');
const ctrl = require('../controllers/auth.controller');

// Only /me is needed since Keycloak handles login/refresh
router.get('/me', auth, ctrl.getMe);

module.exports = router;