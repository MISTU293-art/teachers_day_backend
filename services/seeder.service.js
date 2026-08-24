const User = require('../models/user.model');
const env = require('../config/env.config');
const { ROLES } = require('../config/constants');

/**
 * Initializes SuperAdmin strictly from environment variables on app startup.
 * NO dummy or demo content is seeded.
 */
const initSuperAdmin = async () => {
  try {
    const existingSuperAdmin = await User.findOne({ email: env.superAdmin.email });
    
    if (!existingSuperAdmin) {
      try {
        const superAdminUser = new User({
          name: env.superAdmin.name,
          email: env.superAdmin.email,
          password: env.superAdmin.password,
          role: ROLES.SUPERADMIN,
          department: env.superAdmin.department,
          isActive: true
        });
        await superAdminUser.save();
        console.log(`[Seeder] SuperAdmin account initialized: ${env.superAdmin.email}`);
      } catch (insertErr) {
        if (insertErr.code !== 11000) {
          throw insertErr;
        }
      }
    } else {
      let updated = false;
      if (existingSuperAdmin.role !== ROLES.SUPERADMIN) {
        existingSuperAdmin.role = ROLES.SUPERADMIN;
        updated = true;
      }
      if (!existingSuperAdmin.isActive) {
        existingSuperAdmin.isActive = true;
        updated = true;
      }
      if (updated) {
        await existingSuperAdmin.save();
        console.log(`[Seeder] SuperAdmin account synced with environment settings.`);
      }
    }
  } catch (error) {
    if (error.code !== 11000) {
      console.error('[Seeder Error] Failed to initialize SuperAdmin:', error.message);
    }
  }
};

module.exports = {
  initSuperAdmin
};
