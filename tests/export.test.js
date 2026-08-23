const { ensureDbConnected } = require('./setup');
const request = require('supertest');
const { expect } = require('chai');
const app = require('../app');
const User = require('../models/user.model');
const Student = require('../models/student.model');
const Contribution = require('../models/contribution.model');
const Invitation = require('../models/invitation.model');
const { generateToken } = require('../services/auth.service');
const { ROLES, YEARS, PAYMENT_METHODS } = require('../config/constants');
const generateTransactionId = require('../utils/generateTransactionId');

describe('5. Reports, Excel, CSV & PDF Exports', () => {
  let superAdmin, superCookie;
  let contribution, invitation;

  before(async () => {
    await ensureDbConnected();
  });

  beforeEach(async () => {
    await User.deleteMany({});
    await Student.deleteMany({});
    await Contribution.deleteMany({});
    await Invitation.deleteMany({});

    superAdmin = await User.create({
      name: 'SuperAdmin Export',
      email: 'export.test@cse.edu',
      password: 'Password@123',
      role: ROLES.SUPERADMIN,
      isActive: true
    });
    superCookie = `accessToken=${generateToken(superAdmin)}`;

    const student = await Student.create({
      name: 'Aniket Roy',
      rollNumber: 'CSE-25-055',
      registrationNumber: 'REG25055',
      year: YEARS.SECOND,
      department: 'CSE'
    });

    contribution = await Contribution.create({
      student: student._id,
      amount: 500,
      paymentMethod: PAYMENT_METHODS.CASH,
      transactionReference: generateTransactionId(),
      collectedBy: superAdmin._id,
      collectedByName: superAdmin.name
    });

    invitation = await Invitation.create({
      teacherName: 'Dr. Sen',
      designation: 'Professor',
      department: 'CSE',
      createdBy: superAdmin._id
    });
  });

  it('Requirement: Export collections to Excel (.xlsx) returns proper Content-Type', async () => {
    const res = await request(app)
      .get('/reports/export/excel')
      .set('Cookie', [superCookie]);

    expect(res.status).to.equal(200);
    expect(res.headers['content-type']).to.include('spreadsheetml.sheet');
    expect(res.headers['content-disposition']).to.include('.xlsx');
  });

  it('Requirement: Export collections to CSV returns UTF-8 CSV with data rows', async () => {
    const res = await request(app)
      .get('/reports/export/csv')
      .set('Cookie', [superCookie]);

    expect(res.status).to.equal(200);
    expect(res.headers['content-type']).to.include('text/csv');
    expect(res.text).to.include('Aniket Roy');
    expect(res.text).to.include('CSE-25-055');
  });

  it('Requirement: Export Financial Report to PDF returns valid PDF stream', async () => {
    const res = await request(app)
      .get('/reports/export/pdf')
      .set('Cookie', [superCookie]);

    expect(res.status).to.equal(200);
    expect(res.headers['content-type']).to.include('application/pdf');
    // PDF Magic Number %PDF
    expect(res.body.slice(0, 4).toString()).to.equal('%PDF');
  });

  it('Requirement: Download Teacher Invitation PDF returns valid PDF stream', async () => {
    const res = await request(app)
      .get(`/invitations/${invitation._id}/pdf`)
      .set('Cookie', [superCookie]);

    expect(res.status).to.equal(200);
    expect(res.headers['content-type']).to.include('application/pdf');
    expect(res.body.slice(0, 4).toString()).to.equal('%PDF');
  });

  it('Requirement: Download Receipt PDF returns valid PDF stream', async () => {
    const res = await request(app)
      .get(`/contributions/${contribution._id}/receipt/pdf`)
      .set('Cookie', [superCookie]);

    expect(res.status).to.equal(200);
    expect(res.headers['content-type']).to.include('application/pdf');
    expect(res.body.slice(0, 4).toString()).to.equal('%PDF');
  });
});
