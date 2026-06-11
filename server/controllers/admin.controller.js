const User = require('../models/User');
const Task = require('../models/Task');
const ActivityLog = require('../models/ActivityLog');
const ApiError = require('../utils/ApiError');

// @route   GET /api/admin/users
const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find();
    res.status(200).json({ success: true, count: users.length, users });
  } catch (err) {
    next(err);
  }
};

// @route   DELETE /api/admin/users/:id
const deleteUser = async (req, res, next) => {
  try {
    if (req.params.id === req.user.id) {
      return next(new ApiError('You cannot delete your own account', 400));
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return next(new ApiError('User not found', 404));
    }

    // Cascade — remove all tasks belonging to this user
    await Task.deleteMany({ createdBy: user._id });
    await user.deleteOne();

    ActivityLog.log({
      user: req.user.id,
      action: 'user_delete',
      details: `Deleted user: ${user.name} (${user.email})`,
      targetId: user._id,
      ip: req.ip,
    });

    res.status(200).json({ success: true, message: 'User and their tasks deleted' });
  } catch (err) {
    next(err);
  }
};

// @route   PATCH /api/admin/users/:id/status
const updateUserStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    if (!['Active', 'Inactive'].includes(status)) {
      return next(new ApiError('Status must be Active or Inactive', 400));
    }

    if (req.params.id === req.user.id) {
      return next(new ApiError('You cannot change your own status', 400));
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return next(new ApiError('User not found', 404));
    }

    const oldStatus = user.status;
    user.status = status;
    await user.save();

    ActivityLog.log({
      user: req.user.id,
      action: 'user_status_change',
      details: `Changed status of ${user.name}: ${oldStatus} → ${status}`,
      targetId: user._id,
      ip: req.ip,
    });

    res.status(200).json({ success: true, user });
  } catch (err) {
    next(err);
  }
};

// @route   GET /api/admin/tasks
const getAllTasks = async (req, res, next) => {
  try {
    const tasks = await Task.find()
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: tasks.length, tasks });
  } catch (err) {
    next(err);
  }
};

// @route   DELETE /api/admin/tasks/:id
const deleteAnyTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return next(new ApiError('Task not found', 404));
    }

    await task.deleteOne();

    ActivityLog.log({
      user: req.user.id,
      action: 'task_delete',
      details: `Admin deleted task: ${task.title}`,
      targetId: task._id,
      ip: req.ip,
    });

    res.status(200).json({ success: true, message: 'Task deleted' });
  } catch (err) {
    next(err);
  }
};

// @route   GET /api/admin/analytics
const getAnalytics = async (req, res, next) => {
  try {
    const [totalUsers, activeUsers, inactiveUsers, totalTasks, completedTasks, pendingTasks, inProgressTasks] =
      await Promise.all([
        User.countDocuments(),
        User.countDocuments({ status: 'Active' }),
        User.countDocuments({ status: 'Inactive' }),
        Task.countDocuments(),
        Task.countDocuments({ status: 'completed' }),
        Task.countDocuments({ status: 'pending' }),
        Task.countDocuments({ status: 'in-progress' }),
      ]);

    res.status(200).json({
      success: true,
      analytics: {
        totalUsers,
        activeUsers,
        inactiveUsers,
        totalTasks,
        completedTasks,
        pendingTasks,
        inProgressTasks,
      },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAllUsers,
  deleteUser,
  updateUserStatus,
  getAllTasks,
  deleteAnyTask,
  getAnalytics,
};
