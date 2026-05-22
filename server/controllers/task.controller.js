const Task = require('../models/Task');
const ActivityLog = require('../models/ActivityLog');
const ApiError = require('../utils/ApiError');

// @route   GET /api/tasks
const getTasks = async (req, res, next) => {
  try {
    const tasks = await Task.find({ createdBy: req.user.id }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: tasks.length, tasks });
  } catch (err) {
    next(err);
  }
};

// @route   POST /api/tasks
const createTask = async (req, res, next) => {
  try {
    const { title } = req.body;

    if (!title) {
      return next(new ApiError('Task title is required', 400));
    }

    const task = await Task.create({ ...req.body, createdBy: req.user.id });

    ActivityLog.log({
      user: req.user.id,
      action: 'task_create',
      details: `Created task: ${task.title}`,
      targetId: task._id,
      ip: req.ip,
    });

    res.status(201).json({ success: true, task });
  } catch (err) {
    next(err);
  }
};

// @route   PUT /api/tasks/:id
const updateTask = async (req, res, next) => {
  try {
    let task = await Task.findOne({ _id: req.params.id, createdBy: req.user.id });

    if (!task) {
      return next(new ApiError('Task not found', 404));
    }

    // Only allow updating specific fields
    const allowedFields = ['title', 'description', 'status', 'priority', 'dueDate'];
    const updates = {};
    const changes = [];

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        if (String(task[field]) !== String(req.body[field])) {
          changes.push(`${field}: ${task[field]} → ${req.body[field]}`);
        }
        updates[field] = req.body[field];
      }
    }

    task = await Task.findByIdAndUpdate(task._id, updates, {
      new: true,
      runValidators: true,
    });

    ActivityLog.log({
      user: req.user.id,
      action: 'task_update',
      details: changes.length ? changes.join(', ') : 'No visible changes',
      targetId: task._id,
      ip: req.ip,
    });

    res.status(200).json({ success: true, task });
  } catch (err) {
    next(err);
  }
};

// @route   DELETE /api/tasks/:id
const deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, createdBy: req.user.id });

    if (!task) {
      return next(new ApiError('Task not found', 404));
    }

    await task.deleteOne();

    ActivityLog.log({
      user: req.user.id,
      action: 'task_delete',
      details: `Deleted task: ${task.title}`,
      targetId: task._id,
      ip: req.ip,
    });

    res.status(200).json({ success: true, message: 'Task deleted' });
  } catch (err) {
    next(err);
  }
};

module.exports = { getTasks, createTask, updateTask, deleteTask };
