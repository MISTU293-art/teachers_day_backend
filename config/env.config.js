require('dotenv').config();

const isTest = process.env.NODE_ENV === 'test';

module.exports = {
  port: parseInt(process.env.PORT, 10) || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  mongodbUri: isTest 
    ? (process.env.MONGODB_TEST_URI || 'mongodb://127.0.0.1:27017/teachers_day_test') 
    : (process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/teachers_day'),
  accessTokenSecret: process.env.ACCESS_TOKEN_SECRET || 'cse_teachers_day_fallback_super_secret_jwt_key_2026',
  accessTokenExpiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN || '1d',
  cookieSecret: process.env.COOKIE_SECRET || 'cse_cookie_secret_fallback_key_2026',
  superAdmin: {
    name: process.env.SUPERADMIN_NAME || 'CSE Super Administrator',
    email: (isTest ? (process.env.SUPERADMIN_EMAIL || 'test.superadmin@example.com') : (process.env.SUPERADMIN_EMAIL || 'superadmin@example.com')).toLowerCase().trim(),
    password: process.env.SUPERADMIN_PASSWORD || 'SuperAdmin@2026!',
    department: process.env.SUPERADMIN_DEPARTMENT || 'Computer Science & Engineering'
  },
  imagekit: {
    publicKey: process.env.IMAGEKIT_PUBLIC_KEY || '',
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY || '',
    urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT || ''
  },
  reactFrontendUrl: process.env.REACT_FRONTEND_URL || 'http://localhost:5173'
};
