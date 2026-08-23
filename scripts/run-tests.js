process.env.NODE_ENV = 'test';
process.env.PORT = '3001';
process.env.MONGODB_URI = 'mongodb://127.0.0.1:27017/teachers_day_test';

const Mocha = require('mocha');
const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');

const runAllTests = async () => {
  try {
    console.log('Connecting to Test Database...');
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI);
    }
    console.log('Test Database Connected.');

    const mocha = new Mocha({
      timeout: 10000,
      color: true
    });

    const testDir = path.join(__dirname, '../tests');
    const testFiles = fs.readdirSync(testDir).filter(file => file.endsWith('.test.js'));

    testFiles.forEach(file => {
      mocha.addFile(path.join(testDir, file));
    });

    mocha.run(async (failures) => {
      console.log(`\nTests completed with ${failures} failures.`);
      if (mongoose.connection.readyState !== 0) {
        await mongoose.connection.dropDatabase();
        await mongoose.connection.close();
      }
      process.exit(failures ? 1 : 0);
    });
  } catch (err) {
    console.error('Test runner fatal error:', err);
    process.exit(1);
  }
};

runAllTests();
