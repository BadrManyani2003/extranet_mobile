const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { verifyToken } = require('../middlewares/auth');

/**
 * User Routes
 * All routes here are prefixed with /api/user (see app.js)
 */

// Public routes (if any)
// router.post('/login', userController.login);

// Protected routes
router.post('/getuser', verifyToken, userController.getUser);
router.post('/save', verifyToken, userController.saveUser);

module.exports = router;
