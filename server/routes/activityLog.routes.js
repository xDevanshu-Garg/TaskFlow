const express = require('express');
const router = express.Router();
const { getLogs } = require('../controllers/activityLog.controller');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');

router.get('/', protect, authorize('Admin'), getLogs);

module.exports = router;
