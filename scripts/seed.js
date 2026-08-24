const connectDB = require('../config/db.config');
const seederService = require('../services/seeder.service');
const mongoose = require('mongoose');

const runSeed = async () => {
  try {
    await connectDB();
    await seederService.initSuperAdmin();
    console.log('✅ SuperAdmin setup completed.');
    await mongoose.connection.close();
    process.exit(0);
  } catch (err) {
    console.error('❌ SuperAdmin setup failed:', err);
    process.exit(1);
  }
};

runSeed();
