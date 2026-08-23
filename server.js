const app = require('./app');
const connectDB = require('./config/db.config');
const env = require('./config/env.config');
const seederService = require('./services/seeder.service');

const startServer = async () => {
  try {
    // 1. Connect to Database
    await connectDB();

    // 2. Initialize / Sync SuperAdmin from environment
    await seederService.initSuperAdmin();

    // 3. Seed demo dataset if database is empty
    await seederService.seedSampleData();

    // 4. Start HTTP Server
    const server = app.listen(env.port, () => {
      console.log(`\n========================================================`);
      console.log(`🚀 [CSE EventLedger] Server running in ${env.nodeEnv.toUpperCase()} mode`);
      console.log(`🌐 URL: http://localhost:${env.port}`);
      console.log(`🔐 SuperAdmin: ${env.superAdmin.email}`);
      console.log(`========================================================\n`);
    });

    // Graceful Shutdown
    process.on('SIGTERM', () => {
      console.log('SIGTERM received. Shutting down gracefully...');
      server.close(() => {
        console.log('Server closed.');
        process.exit(0);
      });
    });

    return server;
  } catch (error) {
    console.error('Fatal Server Startup Error:', error);
    process.exit(1);
  }
};

if (require.main === module) {
  startServer();
}

module.exports = { startServer };
