require('dotenv').config();

const requiredEnvVars = [
  'SUPERADMIN_EMAIL',
  'SUPERADMIN_PASSWORD'
];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.warn(`[WARNING] Required environment variable ${envVar} is not set! Using fallback or exiting.`);
  }
}

module.exports = {
  port: parseInt(process.env.PORT, 10) || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  mongodbUri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/teachers_day',
  accessTokenSecret: process.env.ACCESS_TOKEN_SECRET || 'cse_teachers_day_fallback_super_secret_jwt_key_2026',
  accessTokenExpiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN || '1d',
  cookieSecret: process.env.COOKIE_SECRET || 'cse_cookie_secret_fallback_key_2026',
  superAdmin: {
    name: process.env.SUPERADMIN_NAME || 'CSE Super Administrator',
    email: (process.env.SUPERADMIN_EMAIL || 'superadmin@example.com').toLowerCase().trim(),
    password: process.env.SUPERADMIN_PASSWORD || 'SuperAdmin@2026!',
    department: process.env.SUPERADMIN_DEPARTMENT || 'Computer Science & Engineering'
  }
};
