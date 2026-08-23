const { ensureDbConnected } = require('./setup');
const request = require('supertest');
const { expect } = require('chai');
const app = require('../app');
const User = require('../models/user.model');
const { generateToken } = require('../services/auth.service');
const { ROLES } = require('../config/constants');

describe('2. Role-Based Authorization & Admin Creation Restrictions', () => {
  let superAdmin, superAdminCookie;
  let adminVolunteer, adminCookie;

  before(async () => {
    await ensureDbConnected();
  });

  beforeEach(async () => {
    await User.deleteMany({});

    superAdmin = await User.create({
      name: 'SuperAdmin Master',
      email: 'master@cse.edu',
      password: 'Password@123',
      role: ROLES.SUPERADMIN,
      isActive: true
    });
    const superToken = generateToken(superAdmin);
    superAdminCookie = `accessToken=${superToken}`;

    adminVolunteer = await User.create({
      name: 'Rahul Volunteer',
      email: 'rahul.vol@cse.edu',
      password: 'Password@123',
      role: ROLES.ADMIN,
      isActive: true
    });
    const adminToken = generateToken(adminVolunteer);
    adminCookie = `accessToken=${adminToken}`;
  });

  it('Requirement: SuperAdmin CAN create another Admin', async () => {
    const res = await request(app)
      .post('/admins')
      .set('Cookie', [superAdminCookie])
      .set('Accept', 'application/json')
      .send({
        name: 'New Admin Member',
        email: 'newadmin@cse.edu',
        password: 'Password@123',
        department: 'CSE'
      });

    expect(res.status).to.equal(201);
    expect(res.body.success).to.be.true;

    const created = await User.findOne({ email: 'newadmin@cse.edu' });
    expect(created).to.exist;
    expect(created.role).to.equal(ROLES.ADMIN);
  });

  it('Requirement: Admin CANNOT create another Admin (Backend MUST reject with 403 Forbidden)', async () => {
    const res = await request(app)
      .post('/admins')
      .set('Cookie', [adminCookie])
      .set('Accept', 'application/json')
      .send({
        name: 'Hacker Admin',
        email: 'hacker@cse.edu',
        password: 'Password@123'
      });

    expect(res.status).to.equal(403);
    expect(res.body.success).to.be.false;

    const notCreated = await User.findOne({ email: 'hacker@cse.edu' });
    expect(notCreated).to.be.null;
  });

  it('Requirement: Admin cannot elevate permissions to SuperAdmin via payload', async () => {
    // Attempting creation with role: superadmin
    const res = await request(app)
      .post('/admins')
      .set('Cookie', [adminCookie])
      .set('Accept', 'application/json')
      .send({
        name: 'Attacker',
        email: 'attacker@cse.edu',
        password: 'Password@123',
        role: 'superadmin'
      });

    expect(res.status).to.equal(403);
  });

  it('Requirement: Non-SuperAdmin cannot access /audit logs (403)', async () => {
    const res = await request(app)
      .get('/audit')
      .set('Cookie', [adminCookie])
      .set('Accept', 'application/json');

    expect(res.status).to.equal(403);
  });
});
