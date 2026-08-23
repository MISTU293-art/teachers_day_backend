const User = require('../models/user.model');
const Student = require('../models/student.model');
const Contribution = require('../models/contribution.model');
const Expense = require('../models/expense.model');
const Invitation = require('../models/invitation.model');
const AuditLog = require('../models/auditLog.model');
const env = require('../config/env.config');
const { ROLES, YEARS, CONTRIBUTION_STATUS, EXPENSE_CATEGORIES, EXPENSE_STATUS, PAYMENT_METHODS } = require('../config/constants');
const generateTransactionId = require('../utils/generateTransactionId');

/**
 * Initializes SuperAdmin from environment variables on app startup
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
        console.log(`[Seeder] SuperAdmin account created successfully: ${env.superAdmin.email}`);
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
        console.log(`[Seeder] SuperAdmin permissions synced.`);
      }
    }
  } catch (error) {
    if (error.code !== 11000) {
      console.error('[Seeder Error] Failed to initialize SuperAdmin:', error.message);
    }
  }
};

/**
 * Seeds sample realistic CSE dataset (students across years, teachers, sample admins)
 */
const seedSampleData = async () => {
  try {
    await initSuperAdmin();

    const studentCount = await Student.countDocuments();
    if (studentCount > 0) {
      console.log(`[Seeder] Dataset already exists (${studentCount} students found). Skipping full seed.`);
      return;
    }

    console.log('[Seeder] Populating comprehensive CSE Teachers\' Day demo dataset...');

    const superAdmin = await User.findOne({ role: ROLES.SUPERADMIN });

    // 1. Create sample Admin volunteers
    const volunteer1 = await User.create({
      name: 'Rahul Kumar',
      email: 'rahul.volunteer@example.com',
      password: 'Password@123',
      role: ROLES.ADMIN,
      department: 'Computer Science & Engineering',
      phone: '9876543210',
      isActive: true
    });

    const volunteer2 = await User.create({
      name: 'Priya Sharma',
      email: 'priya.volunteer@example.com',
      password: 'Password@123',
      role: ROLES.ADMIN,
      department: 'Computer Science & Engineering',
      phone: '9876543211',
      isActive: true
    });

    // 2. Create Students across 1st, 2nd, 3rd, 4th years
    const rawStudents = [
      // 1st Year (Restricted - Not Eligible)
      { name: 'Aarav Gupta', rollNumber: 'CSE-26-001', registrationNumber: 'REG2026001', email: 'aarav.g@cse.edu', year: YEARS.FIRST, section: 'A', semester: 1 },
      { name: 'Diya Patel', rollNumber: 'CSE-26-002', registrationNumber: 'REG2026002', email: 'diya.p@cse.edu', year: YEARS.FIRST, section: 'A', semester: 1 },
      { name: 'Kabir Verma', rollNumber: 'CSE-26-003', registrationNumber: 'REG2026003', email: 'kabir.v@cse.edu', year: YEARS.FIRST, section: 'B', semester: 1 },
      { name: 'Ananya Roy', rollNumber: 'CSE-26-004', registrationNumber: 'REG2026004', email: 'ananya.r@cse.edu', year: YEARS.FIRST, section: 'B', semester: 1 },

      // 2nd Year (Eligible)
      { name: 'Rohan Mehra', rollNumber: 'CSE-25-011', registrationNumber: 'REG2025011', email: 'rohan.m@cse.edu', year: YEARS.SECOND, section: 'A', semester: 3 },
      { name: 'Sneha Banerjee', rollNumber: 'CSE-25-012', registrationNumber: 'REG2025012', email: 'sneha.b@cse.edu', year: YEARS.SECOND, section: 'A', semester: 3 },
      { name: 'Vikram Seth', rollNumber: 'CSE-25-013', registrationNumber: 'REG2025013', email: 'vikram.s@cse.edu', year: YEARS.SECOND, section: 'B', semester: 3 },
      { name: 'Tanvi Joshi', rollNumber: 'CSE-25-014', registrationNumber: 'REG2025014', email: 'tanvi.j@cse.edu', year: YEARS.SECOND, section: 'B', semester: 3 },
      { name: 'Devansh Paul', rollNumber: 'CSE-25-015', registrationNumber: 'REG2025015', email: 'devansh.p@cse.edu', year: YEARS.SECOND, section: 'A', semester: 3 },

      // 3rd Year (Eligible)
      { name: 'Amit Chakraborty', rollNumber: 'CSE-24-021', registrationNumber: 'REG2024021', email: 'amit.c@cse.edu', year: YEARS.THIRD, section: 'A', semester: 5 },
      { name: 'Pooja Nair', rollNumber: 'CSE-24-022', registrationNumber: 'REG2024022', email: 'pooja.n@cse.edu', year: YEARS.THIRD, section: 'A', semester: 5 },
      { name: 'Siddharth Rao', rollNumber: 'CSE-24-023', registrationNumber: 'REG2024023', email: 'siddharth.r@cse.edu', year: YEARS.THIRD, section: 'B', semester: 5 },
      { name: 'Ishita Dutta', rollNumber: 'CSE-24-024', registrationNumber: 'REG2024024', email: 'ishita.d@cse.edu', year: YEARS.THIRD, section: 'B', semester: 5 },
      { name: 'Kunal Sen', rollNumber: 'CSE-24-025', registrationNumber: 'REG2024025', email: 'kunal.s@cse.edu', year: YEARS.THIRD, section: 'A', semester: 5 },

      // 4th Year (Eligible)
      { name: 'Arjun Singhania', rollNumber: 'CSE-23-031', registrationNumber: 'REG2023031', email: 'arjun.s@cse.edu', year: YEARS.FOURTH, section: 'A', semester: 7 },
      { name: 'Riya Mukherjee', rollNumber: 'CSE-23-032', registrationNumber: 'REG2023032', email: 'riya.m@cse.edu', year: YEARS.FOURTH, section: 'A', semester: 7 },
      { name: 'Farhan Akhtar', rollNumber: 'CSE-23-033', registrationNumber: 'REG2023033', email: 'farhan.a@cse.edu', year: YEARS.FOURTH, section: 'B', semester: 7 },
      { name: 'Megha Iyer', rollNumber: 'CSE-23-034', registrationNumber: 'REG2023034', email: 'megha.i@cse.edu', year: YEARS.FOURTH, section: 'B', semester: 7 },
      { name: 'Aditya Bose', rollNumber: 'CSE-23-035', registrationNumber: 'REG2023035', email: 'aditya.b@cse.edu', year: YEARS.FOURTH, section: 'A', semester: 7 }
    ];

    const createdStudents = await Student.insertMany(rawStudents);
    console.log(`[Seeder] Seeded ${createdStudents.length} CSE students.`);

    // 3. Create Sample Contributions for some 2nd, 3rd, 4th year students
    const eligibleStudents = createdStudents.filter(s => s.year !== YEARS.FIRST);

    // Contribution 1: Rohan Mehra (2nd Year) - collected by Rahul
    const c1 = await Contribution.create({
      student: eligibleStudents[0]._id,
      amount: 150,
      paymentMethod: PAYMENT_METHODS.CASH,
      transactionReference: generateTransactionId(),
      collectedBy: volunteer1._id,
      collectedByName: volunteer1.name,
      notes: 'Handed over cash during class break.'
    });
    eligibleStudents[0].contributionStatus = CONTRIBUTION_STATUS.PAID;
    eligibleStudents[0].totalContributed = 150;
    await eligibleStudents[0].save();

    // Contribution 2: Sneha Banerjee (2nd Year) - collected by Priya
    const c2 = await Contribution.create({
      student: eligibleStudents[1]._id,
      amount: 200,
      paymentMethod: PAYMENT_METHODS.UPI,
      transactionReference: generateTransactionId(),
      collectedBy: volunteer2._id,
      collectedByName: volunteer2.name,
      notes: 'UPI payment verified.'
    });
    eligibleStudents[1].contributionStatus = CONTRIBUTION_STATUS.PAID;
    eligibleStudents[1].totalContributed = 200;
    await eligibleStudents[1].save();

    // Contribution 3: Amit Chakraborty (3rd Year) - collected by SuperAdmin
    const c3 = await Contribution.create({
      student: eligibleStudents[5]._id,
      amount: 250,
      paymentMethod: PAYMENT_METHODS.UPI,
      transactionReference: generateTransactionId(),
      collectedBy: superAdmin._id,
      collectedByName: superAdmin.name,
      notes: 'Contribution via GPay.'
    });
    eligibleStudents[5].contributionStatus = CONTRIBUTION_STATUS.PAID;
    eligibleStudents[5].totalContributed = 250;
    await eligibleStudents[5].save();

    // Contribution 4: Arjun Singhania (4th Year) - collected by Rahul
    const c4 = await Contribution.create({
      student: eligibleStudents[10]._id,
      amount: 300,
      paymentMethod: PAYMENT_METHODS.CASH,
      transactionReference: generateTransactionId(),
      collectedBy: volunteer1._id,
      collectedByName: volunteer1.name,
      notes: '4th year batch contribution.'
    });
    eligibleStudents[10].contributionStatus = CONTRIBUTION_STATUS.PAID;
    eligibleStudents[10].totalContributed = 300;
    await eligibleStudents[10].save();

    console.log('[Seeder] Seeded initial contributions.');

    // 4. Create Sample Expenses
    await Expense.create([
      {
        title: 'Stage Decoration & LED Backdrops',
        category: 'Decoration',
        amount: 3500,
        description: 'Floral stage decoration, balloons, and LED CSE theme lighting.',
        paidTo: 'City Decorators & Event Planners',
        paymentMethod: PAYMENT_METHODS.CASH,
        addedBy: volunteer1._id,
        approvedBy: superAdmin._id,
        status: EXPENSE_STATUS.APPROVED,
        expenseDate: new Date()
      },
      {
        title: 'Gifts and Mementos for Teachers',
        category: 'Gifts',
        amount: 4200,
        description: 'Personalized engraved pens and customized wooden mementos for 15 faculty members.',
        paidTo: 'Royal Gift Shoppe',
        paymentMethod: PAYMENT_METHODS.UPI,
        addedBy: volunteer2._id,
        approvedBy: superAdmin._id,
        status: EXPENSE_STATUS.APPROVED,
        expenseDate: new Date()
      },
      {
        title: 'High Tea & Snacks Catering',
        category: 'Food',
        amount: 2800,
        description: 'Pastries, samosas, coffee, and dry fruits for faculty and guests.',
        paidTo: 'Campus Green Bakery & Caterers',
        paymentMethod: PAYMENT_METHODS.CASH,
        addedBy: volunteer1._id,
        status: EXPENSE_STATUS.PENDING,
        expenseDate: new Date()
      }
    ]);
    console.log('[Seeder] Seeded sample expenses.');

    // 5. Create Sample Teacher Invitations
    await Invitation.create([
      {
        teacherName: 'Dr. Anindita Sen',
        department: 'Department of Computer Science & Engineering',
        designation: 'Professor & Head of Department',
        message: 'Your inspirational leadership, profound research insights, and boundless encouragement have continually empowered us to reach new heights in computing and life.',
        joke: 'Why do programmers prefer dark mode? Because light attracts bugs! 😄',
        eventDate: '5th September 2026',
        eventTime: '11:00 AM - 04:00 PM',
        venue: 'CSE Department Main Seminar Hall',
        theme: 'cyber-gold',
        createdBy: superAdmin._id
      },
      {
        teacherName: 'Prof. Subhashis Mukherjee',
        department: 'Department of Computer Science & Engineering',
        designation: 'Associate Professor',
        message: 'Thank you for transforming complex algorithms and data structures into intuitive, joyful journeys of discovery.',
        joke: 'There are 10 types of people in this world: Those who understand binary, and those who do not! 🚀',
        eventDate: '5th September 2026',
        eventTime: '11:00 AM - 04:00 PM',
        venue: 'CSE Department Main Seminar Hall',
        theme: 'matrix-green',
        createdBy: superAdmin._id
      },
      {
        teacherName: 'Dr. Deblina Roy',
        department: 'Department of Computer Science & Engineering',
        designation: 'Assistant Professor',
        message: 'Your patience in debugging our doubts and nurturing our curiosity has made all the difference in our engineering journey.',
        joke: 'Why was the JavaScript developer sad? Because they didn\'t Node how to Express themselves! 💻',
        eventDate: '5th September 2026',
        eventTime: '11:00 AM - 04:00 PM',
        venue: 'CSE Department Main Seminar Hall',
        theme: 'tech-purple',
        createdBy: superAdmin._id
      }
    ]);
    console.log('[Seeder] Seeded sample teacher invitations.');

    // 6. Initial Audit Logs
    await AuditLog.create([
      {
        user: superAdmin._id,
        userName: superAdmin.name,
        userRole: superAdmin.role,
        action: 'SYSTEM_INITIALIZED',
        module: 'SYSTEM',
        description: 'System successfully initialized with CSE demo dataset.'
      }
    ]);

    console.log('[Seeder] Demo dataset seeded successfully!');
  } catch (error) {
    console.error('[Seeder Error] Seed failed:', error);
  }
};

module.exports = {
  initSuperAdmin,
  seedSampleData
};
