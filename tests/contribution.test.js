const { ensureDbConnected } = require('./setup');
const request = require('supertest');
const { expect } = require('chai');
const app = require('../app');
const User = require('../models/user.model');
const Student = require('../models/student.model');
const Contribution = require('../models/contribution.model');
const { generateToken } = require('../services/auth.service');
const { ROLES, YEARS, PAYMENT_METHODS, CONTRIBUTION_STATUS } = require('../config/constants');

describe('3. Contribution Logic, 1st-Year Restriction & Collector Security', () => {
  let adminUser, adminCookie;
  let firstYearStudent, secondYearStudent;

  before(async () => {
    await ensureDbConnected();
  });

  beforeEach(async () => {
    await User.deleteMany({});
    await Student.deleteMany({});
    await Contribution.deleteMany({});

    adminUser = await User.create({
      name: 'Rahul Kumar',
      email: 'rahul.test@cse.edu',
      password: 'Password@123',
      role: ROLES.ADMIN,
      isActive: true
    });
    adminCookie = `accessToken=${generateToken(adminUser)}`;

    firstYearStudent = await Student.create({
      name: 'Aarav FirstYear',
      rollNumber: 'CSE-26-001',
      registrationNumber: 'REG26001',
      year: YEARS.FIRST,
      department: 'CSE'
    });

    secondYearStudent = await Student.create({
      name: 'Sneha SecondYear',
      rollNumber: 'CSE-25-001',
      registrationNumber: 'REG25001',
      year: YEARS.SECOND,
      department: 'CSE'
    });
  });

  it('CRITICAL REQUIREMENT: First-year student contribution MUST be rejected by backend with 403 Forbidden', async () => {
    const res = await request(app)
      .post('/contributions')
      .set('Cookie', [adminCookie])
      .set('Accept', 'application/json')
      .send({
        studentId: firstYearStudent._id.toString(),
        amount: 100,
        paymentMethod: PAYMENT_METHODS.CASH
      });

    expect(res.status).to.equal(403);
    expect(res.body.success).to.be.false;
    expect(res.body.isFirstYear).to.be.true;
    expect(res.body.message).to.include('First-year students are not eligible');

    // Verify database has 0 contributions
    const count = await Contribution.countDocuments();
    expect(count).to.equal(0);
  });

  it('CRITICAL REQUIREMENT: Collector identity CANNOT be spoofed by frontend payload', async () => {
    // Attacker tries sending collectedBy: "Fake Impersonated Collector"
    const res = await request(app)
      .post('/contributions')
      .set('Cookie', [adminCookie])
      .set('Accept', 'application/json')
      .send({
        studentId: secondYearStudent._id.toString(),
        amount: 250,
        paymentMethod: PAYMENT_METHODS.UPI,
        collectedBy: 'Fake Impersonated User',
        collectedByName: 'Fake Impersonated User'
      });

    expect(res.status).to.equal(201);
    expect(res.body.success).to.be.true;

    const savedContribution = await Contribution.findById(res.body.data.contributionId);
    expect(savedContribution).to.exist;
    // Must match authenticated user, NOT the spoofed name
    expect(savedContribution.collectedBy.toString()).to.equal(adminUser._id.toString());
    expect(savedContribution.collectedByName).to.equal('Rahul Kumar');
  });

  it('Requirement: Valid contribution generates unique TD26-XXXXXX transaction ID and updates student balance', async () => {
    const res = await request(app)
      .post('/contributions')
      .set('Cookie', [adminCookie])
      .set('Accept', 'application/json')
      .send({
        studentId: secondYearStudent._id.toString(),
        amount: 150,
        paymentMethod: PAYMENT_METHODS.CASH
      });

    expect(res.status).to.equal(201);
    expect(res.body.data.transactionReference).to.match(/^TD26-[A-Z0-9]+$/);

    const updatedStudent = await Student.findById(secondYearStudent._id);
    expect(updatedStudent.totalContributed).to.equal(150);
    expect(updatedStudent.contributionStatus).to.equal(CONTRIBUTION_STATUS.PAID);
  });

  it('Requirement: Zero or negative contribution amounts are rejected with 400 Bad Request', async () => {
    const resNegative = await request(app)
      .post('/contributions')
      .set('Cookie', [adminCookie])
      .set('Accept', 'application/json')
      .send({
        studentId: secondYearStudent._id.toString(),
        amount: -50,
        paymentMethod: PAYMENT_METHODS.CASH
      });

    expect(resNegative.status).to.equal(400);

    const resZero = await request(app)
      .post('/contributions')
      .set('Cookie', [adminCookie])
      .set('Accept', 'application/json')
      .send({
        studentId: secondYearStudent._id.toString(),
        amount: 0,
        paymentMethod: PAYMENT_METHODS.CASH
      });

    expect(resZero.status).to.equal(400);
  });
});
