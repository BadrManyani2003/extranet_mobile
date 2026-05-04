const express = require('express');
const router = express.Router();

const authRoutes = require('./auth.routes');
const dataRoutes = require('./data.routes');
const reclamationRoutes = require('./reclamation.routes');
const adminRoutes = require('./admin.routes');

router.use('/auth', authRoutes);
router.use('/data', dataRoutes);
router.use('/reclamations', reclamationRoutes);
router.use('/admin', adminRoutes);

module.exports = router;
