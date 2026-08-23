const connectDB = require('../config/db.config');
const seederService = require('../services/seeder.service');
const mongoose = require('mongoose');

const runSeed = async () => {
  try {
    await connectDB();
    await seederService.initSuperAdmin();
    await seederService.seedSampleData();
    console.log('✅ Seeding completed.');
    await mongoose.connection.close();
    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding failed:', err);
    process.exit(1);
  }
};

runSeed();
