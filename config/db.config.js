const mongoose = require('mongoose');
const env = require('./env.config');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(env.mongodbUri, {
      autoIndex: true
    });
    console.log(`[Database] MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.error(`[Database Error] Failed to connect to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
