const express = require('express');
const router = express.Router();
const {
  getAllUsers,
  deleteUser,
  updateUserStatus,
  getAllTasks,
  deleteAnyTask,
  getAnalytics,
} = require('../controllers/admin.controller');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');

// Every admin route needs auth + Admin role
router.use(protect, authorize('Admin'));

router.get('/users', getAllUsers);
router.delete('/users/:id', deleteUser);
router.patch('/users/:id/status', updateUserStatus);

router.get('/tasks', getAllTasks);
router.delete('/tasks/:id', deleteAnyTask);

router.get('/analytics', getAnalytics);

module.exports = router;
