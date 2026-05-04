const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const authMiddleware = require('../middlewares/auth.middleware');

router.post('/login', authController.login);
router.post('/refresh', authController.refreshToken);
router.post('/me', authMiddleware, authController.getMe);


module.exports = router;
