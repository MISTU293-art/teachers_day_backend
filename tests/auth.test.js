const { ensureDbConnected } = require('./setup');
const request = require('supertest');
const { expect } = require('chai');
const app = require('../app');
const User = require('../models/user.model');
const seederService = require('../services/seeder.service');
const env = require('../config/env.config');
const { ROLES } = require('../config/constants');

describe('1. Authentication & Security Tests', () => {
  before(async () => {
    await ensureDbConnected();
  });

  beforeEach(async () => {
    await User.deleteMany({});
    await seederService.initSuperAdmin();
  });

  it('Requirement: Public registration /register MUST NOT exist (404)', async () => {
    const res = await request(app).get('/register');
    expect(res.status).to.equal(404);

    const postRes = await request(app).post('/register').send({
      name: 'Hacker',
      email: 'hacker@example.com',
      password: 'password123'
    });
    expect(postRes.status).to.equal(404);
  });

  it('Requirement: SuperAdmin credentials initialized from environment configuration with bcrypt hashing', async () => {
    const superAdmin = await User.findOne({ email: env.superAdmin.email }).select('+password');
    expect(superAdmin).to.exist;
    expect(superAdmin.role).to.equal(ROLES.SUPERADMIN);
    expect(superAdmin.password).to.not.equal(env.superAdmin.password); // Hashed, not plaintext!
    expect(superAdmin.password.startsWith('$2')).to.be.true; // bcrypt hash prefix
  });

  it('Requirement: Valid login sets HTTP-Only secure cookie and redirects/authenticates', async () => {
    const res = await request(app)
      .post('/auth/login')
      .set('Accept', 'application/json')
      .send({
        email: env.superAdmin.email,
        password: env.superAdmin.password
      });

    expect(res.status).to.equal(200);
    expect(res.body.success).to.be.true;
    expect(res.headers['set-cookie']).to.exist;
    expect(res.headers['set-cookie'][0]).to.include('accessToken=');
    expect(res.headers['set-cookie'][0].toLowerCase()).to.include('httponly');
  });

  it('Requirement: Invalid password returns 401 Unauthorized', async () => {
    const res = await request(app)
      .post('/auth/login')
      .set('Accept', 'application/json')
      .send({
        email: env.superAdmin.email,
        password: 'wrong_password_123'
      });

    expect(res.status).to.equal(401);
    expect(res.body.success).to.be.false;
  });

  it('Requirement: Disabled administrator accounts cannot log in', async () => {
    const disabledEmail = `disabled_${Date.now()}@cse.edu`;
    const disabledAdmin = new User({
      name: 'Disabled Volunteer',
      email: disabledEmail,
      password: 'Password@123',
      role: ROLES.ADMIN,
      isActive: false
    });
    await disabledAdmin.save();

    const res = await request(app)
      .post('/auth/login')
      .set('Accept', 'application/json')
      .send({
        email: disabledEmail,
        password: 'Password@123'
      });

    expect(res.status).to.equal(401);
    expect(res.body.message).to.include('deactivated');
  });
});
