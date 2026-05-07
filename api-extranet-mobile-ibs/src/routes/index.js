const router = require('express').Router();

router.use('/auth',         require('./auth.routes'));
router.use('/data',         require('./data.routes'));
router.use('/reclamations', require('./reclamation.routes'));
router.use('/admin',        require('./admin.routes'));

module.exports = router;
