const ActivityLog = require('../models/ActivityLog');

const logActivity = async (userId, action, description, ipAddress = '') => {
  try {
    await ActivityLog.create({ userId, action, description, ipAddress });
  } catch (error) {
    console.error('Activity log error:', error.message);
  }
};

module.exports = { logActivity };
