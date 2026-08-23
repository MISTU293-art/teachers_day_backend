const { ensureDbConnected } = require('./setup');
const request = require('supertest');
const { expect } = require('chai');
const app = require('../app');
const User = require('../models/user.model');
const Expense = require('../models/expense.model');
const Contribution = require('../models/contribution.model');
const Student = require('../models/student.model');
const { generateToken } = require('../services/auth.service');
const { ROLES, YEARS, EXPENSE_STATUS, PAYMENT_METHODS } = require('../config/constants');
const generateTransactionId = require('../utils/generateTransactionId');

describe('4. Expense Management & Financial Formula Calculations', () => {
  let superAdmin, superCookie;
  let adminVolunteer, adminCookie;
  let student;

  before(async () => {
    await ensureDbConnected();
  });

  beforeEach(async () => {
    await User.deleteMany({});
    await Expense.deleteMany({});
    await Contribution.deleteMany({});
    await Student.deleteMany({});

    superAdmin = await User.create({
      name: 'SuperAdmin Master',
      email: 'master.exp@cse.edu',
      password: 'Password@123',
      role: ROLES.SUPERADMIN,
      isActive: true
    });
    superCookie = `accessToken=${generateToken(superAdmin)}`;

    adminVolunteer = await User.create({
      name: 'Volunteer Admin',
      email: 'vol.exp@cse.edu',
      password: 'Password@123',
      role: ROLES.ADMIN,
      isActive: true
    });
    adminCookie = `accessToken=${generateToken(adminVolunteer)}`;

    student = await Student.create({
      name: 'Rohit Verma',
      rollNumber: 'CSE-25-099',
      registrationNumber: 'REG25099',
      year: YEARS.THIRD,
      department: 'CSE'
    });

    // Seed ₹10,000 collection
    await Contribution.create({
      student: student._id,
      amount: 10000,
      paymentMethod: PAYMENT_METHODS.UPI,
      transactionReference: generateTransactionId(),
      collectedBy: superAdmin._id,
      collectedByName: superAdmin.name
    });
  });

  it('Requirement: Volunteer Admin expense starts in "pending" status', async () => {
    const res = await request(app)
      .post('/expenses')
      .set('Cookie', [adminCookie])
      .set('Accept', 'application/json')
      .send({
        title: 'Stage Decor Lights',
        category: 'Decoration',
        amount: 2000,
        paidTo: 'City Events',
        paymentMethod: PAYMENT_METHODS.CASH
      });

    expect(res.status).to.equal(201);
    expect(res.body.data.status).to.equal(EXPENSE_STATUS.PENDING);
  });

  it('Requirement: Volunteer Admin cannot approve expenses (403 Forbidden)', async () => {
    const expense = await Expense.create({
      title: 'Sound System',
      category: 'Sound System',
      amount: 3000,
      paidTo: 'Audio Hub',
      addedBy: adminVolunteer._id,
      status: EXPENSE_STATUS.PENDING
    });

    const res = await request(app)
      .post(`/expenses/${expense._id}/approve`)
      .set('Cookie', [adminCookie])
      .set('Accept', 'application/json');

    expect(res.status).to.equal(403);
  });

  it('Requirement: SuperAdmin can approve expense and balance formula deducts ONLY approved expenses', async () => {
    const expense = await Expense.create({
      title: 'Sound System',
      category: 'Sound System',
      amount: 3000,
      paidTo: 'Audio Hub',
      addedBy: adminVolunteer._id,
      status: EXPENSE_STATUS.PENDING
    });

    // Before approval: Total Collected = ₹10,000, Approved Expenses = ₹0, Remaining Balance = ₹10,000
    let dashRes = await request(app)
      .get('/dashboard')
      .set('Cookie', [superCookie]);
    expect(dashRes.text).to.include('10,000');

    // SuperAdmin Approves
    const approveRes = await request(app)
      .post(`/expenses/${expense._id}/approve`)
      .set('Cookie', [superCookie])
      .set('Accept', 'application/json');

    expect(approveRes.status).to.equal(200);

    const updatedExpense = await Expense.findById(expense._id);
    expect(updatedExpense.status).to.equal(EXPENSE_STATUS.APPROVED);
    expect(updatedExpense.approvedBy.toString()).to.equal(superAdmin._id.toString());

    // After approval: Balance = ₹10,000 - ₹3,000 = ₹7,000
    dashRes = await request(app)
      .get('/dashboard')
      .set('Cookie', [superCookie]);
    expect(dashRes.text).to.include('7,000');
  });
});
