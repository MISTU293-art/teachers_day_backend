process.env.NODE_ENV = 'test';
process.env.PORT = '3001';
process.env.MONGODB_URI = 'mongodb://127.0.0.1:27017/teachers_day_test';
process.env.ACCESS_TOKEN_SECRET = 'test_secret_jwt_key_2026';
process.env.SUPERADMIN_EMAIL = 'test.superadmin@example.com';
process.env.SUPERADMIN_PASSWORD = 'TestSuperAdmin@2026!';

const mongoose = require('mongoose');

const ensureDbConnected = async () => {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(process.env.MONGODB_URI);
  }
};

module.exports = { ensureDbConnected };
