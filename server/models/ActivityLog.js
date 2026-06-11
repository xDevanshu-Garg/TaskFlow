const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    action: {
      type: String,
      enum: [
        'login',
        'task_create',
        'task_update',
        'task_delete',
        'user_status_change',
        'user_delete',
      ],
      required: true,
    },
    details: {
      type: String,
    },
    targetId: {
      type: mongoose.Schema.Types.ObjectId,
    },
    ip: {
      type: String,
    },
  },
  { timestamps: true }
);

activityLogSchema.index({ createdAt: -1 });

// Convenience static so controllers can just do ActivityLog.log({...})
activityLogSchema.statics.log = function ({ user, action, details, targetId, ip }) {
  return this.create({ user, action, details, targetId, ip });
};

module.exports = mongoose.model('ActivityLog', activityLogSchema);
