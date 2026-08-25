const ExcelJS = require('exceljs');

/**
 * Generates an Excel workbook for contributions
 */
const exportContributionsToExcel = async (contributions, summary = {}) => {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'CSE Teachers\' Day Management System';
  workbook.created = new Date();

  const worksheet = workbook.addWorksheet('Contributions Ledger', {
    properties: { tabColor: { argb: '2563EB' } },
    pageSetup: { fitToPage: true, fitToWidth: 1, fitToHeight: 0 }
  });

  // Header styling
  worksheet.columns = [
    { header: '#', key: 'index', width: 6 },
    { header: 'Transaction ID', key: 'transactionReference', width: 18 },
    { header: 'Student Name', key: 'studentName', width: 22 },
    { header: 'Roll Number', key: 'rollNumber', width: 16 },
    { header: 'Reg. Number', key: 'registrationNumber', width: 18 },
    { header: 'Department', key: 'department', width: 16 },
    { header: 'Year', key: 'year', width: 14 },
    { header: 'Amount (INR)', key: 'amount', width: 16 },
    { header: 'Payment Method', key: 'paymentMethod', width: 16 },
    { header: 'Collected By', key: 'collectedByName', width: 20 },
    { header: 'Collected At', key: 'collectedAt', width: 22 },
    { header: 'Notes', key: 'notes', width: 25 }
  ];

  // Title block
  worksheet.insertRow(1, ['DEPARTMENT OF COMPUTER SCIENCE & ENGINEERING']);
  worksheet.insertRow(2, ['TEACHERS\' DAY CELEBRATION 2026 - CONTRIBUTIONS REPORT']);
  worksheet.insertRow(3, [`Generated On: ${new Date().toLocaleString('en-IN')}`]);
  worksheet.insertRow(4, []); // empty spacer

  worksheet.mergeCells('A1:L1');
  worksheet.mergeCells('A2:L2');
  worksheet.mergeCells('A3:L3');

  const titleRow1 = worksheet.getRow(1);
  titleRow1.font = { name: 'Calibri', size: 16, bold: true, color: { argb: 'FFFFFF' } };
  titleRow1.alignment = { horizontal: 'center', vertical: 'middle' };
  titleRow1.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '0F172A' } };

  const titleRow2 = worksheet.getRow(2);
  titleRow2.font = { name: 'Calibri', size: 13, bold: true, color: { argb: 'F8FAFC' } };
  titleRow2.alignment = { horizontal: 'center', vertical: 'middle' };
  titleRow2.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '1E293B' } };

  const titleRow3 = worksheet.getRow(3);
  titleRow3.font = { name: 'Calibri', size: 10, italic: true, color: { argb: '64748B' } };
  titleRow3.alignment = { horizontal: 'center', vertical: 'middle' };

  // Format table header row (now at row 5)
  const headerRow = worksheet.getRow(5);
  headerRow.font = { bold: true, color: { argb: 'FFFFFF' } };
  headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '2563EB' } };
  headerRow.alignment = { vertical: 'middle', horizontal: 'center' };
  headerRow.height = 24;

  let totalAmount = 0;

  contributions.forEach((item, index) => {
    const student = item.student || {};
    const amountVal = item.amount || 0;
    totalAmount += amountVal;

    worksheet.addRow({
      index: index + 1,
      transactionReference: item.transactionReference,
      studentName: student.name || 'N/A',
      rollNumber: student.rollNumber || 'N/A',
      registrationNumber: student.registrationNumber || 'N/A',
      department: student.department || 'CSE',
      year: student.year || 'N/A',
      amount: amountVal,
      paymentMethod: item.paymentMethod,
      collectedByName: item.collectedByName,
      collectedAt: new Date(item.collectedAt).toLocaleString('en-IN'),
      notes: item.notes || '-'
    });
  });

  // Currency format for amount column
  worksheet.getColumn('amount').numFmt = '₹#,##0.00';

  // Summary footer row
  const summaryRow = worksheet.addRow({
    index: '',
    transactionReference: '',
    studentName: '',
    rollNumber: '',
    registrationNumber: '',
    department: '',
    year: 'TOTAL:',
    amount: totalAmount,
    paymentMethod: '',
    collectedByName: `${contributions.length} records`,
    collectedAt: '',
    notes: ''
  });

  summaryRow.font = { bold: true, size: 11 };
  summaryRow.getCell('amount').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'DCFCE7' } };

  return workbook;
};

/**
 * Generates an Excel workbook for expenses
 */
const exportExpensesToExcel = async (expenses) => {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'CSE Teachers\' Day Management System';

  const worksheet = workbook.addWorksheet('Expenses Ledger', {
    properties: { tabColor: { argb: 'DC2626' } }
  });

  worksheet.columns = [
    { header: '#', key: 'index', width: 6 },
    { header: 'Title', key: 'title', width: 25 },
    { header: 'Category', key: 'category', width: 18 },
    { header: 'Amount (INR)', key: 'amount', width: 16 },
    { header: 'Status', key: 'status', width: 14 },
    { header: 'Paid To', key: 'paidTo', width: 20 },
    { header: 'Payment Method', key: 'paymentMethod', width: 16 },
    { header: 'Added By', key: 'addedBy', width: 18 },
    { header: 'Expense Date', key: 'expenseDate', width: 18 },
    { header: 'Description', key: 'description', width: 30 }
  ];

  worksheet.insertRow(1, ['DEPARTMENT OF COMPUTER SCIENCE & ENGINEERING']);
  worksheet.insertRow(2, ['TEACHERS\' DAY CELEBRATION 2026 - EXPENSES REPORT']);
  worksheet.insertRow(3, [`Generated On: ${new Date().toLocaleString('en-IN')}`]);
  worksheet.insertRow(4, []);

  worksheet.mergeCells('A1:J1');
  worksheet.mergeCells('A2:J2');
  worksheet.mergeCells('A3:J3');

  const titleRow1 = worksheet.getRow(1);
  titleRow1.font = { name: 'Calibri', size: 16, bold: true, color: { argb: 'FFFFFF' } };
  titleRow1.alignment = { horizontal: 'center', vertical: 'middle' };
  titleRow1.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '0F172A' } };

  const titleRow2 = worksheet.getRow(2);
  titleRow2.font = { name: 'Calibri', size: 13, bold: true, color: { argb: 'F8FAFC' } };
  titleRow2.alignment = { horizontal: 'center', vertical: 'middle' };
  titleRow2.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '1E293B' } };

  const headerRow = worksheet.getRow(5);
  headerRow.font = { bold: true, color: { argb: 'FFFFFF' } };
  headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'DC2626' } };
  headerRow.alignment = { vertical: 'middle', horizontal: 'center' };
  headerRow.height = 24;

  let totalAmount = 0;
  let approvedAmount = 0;

  expenses.forEach((item, index) => {
    totalAmount += item.amount || 0;
    if (item.status === 'approved') approvedAmount += item.amount || 0;

    worksheet.addRow({
      index: index + 1,
      title: item.title,
      category: item.category,
      amount: item.amount || 0,
      status: (item.status || 'pending').toUpperCase(),
      paidTo: item.paidTo,
      paymentMethod: item.paymentMethod,
      addedBy: item.addedBy?.name || 'N/A',
      expenseDate: new Date(item.expenseDate).toLocaleDateString('en-IN'),
      description: item.description || '-'
    });
  });

  worksheet.getColumn('amount').numFmt = '₹#,##0.00';

  const summaryRow = worksheet.addRow({
    index: '',
    title: '',
    category: 'APPROVED TOTAL:',
    amount: approvedAmount,
    status: '',
    paidTo: `All Total: ₹${totalAmount}`,
    paymentMethod: '',
    addedBy: '',
    expenseDate: '',
    description: ''
  });

  summaryRow.font = { bold: true, size: 11 };

  return workbook;
};

/**
 * Generates an Excel workbook for student performance/participation registrations
 */
const exportParticipationsToExcel = async (participations) => {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'CSE Department Event Management System';
  workbook.created = new Date();

  const worksheet = workbook.addWorksheet('Performances & Registrations', {
    properties: { tabColor: { argb: 'F59E0B' } },
    pageSetup: { fitToPage: true, fitToWidth: 1, fitToHeight: 0 }
  });

  worksheet.columns = [
    { header: '#', key: 'index', width: 6 },
    { header: 'Student Name', key: 'name', width: 22 },
    { header: 'Academic Year', key: 'year', width: 15 },
    { header: 'Contact Details', key: 'contact', width: 20 },
    { header: 'Performance / Category', key: 'performance', width: 24 },
    { header: 'Act Details', key: 'performanceDetails', width: 32 },
    { header: 'Team Members', key: 'teamMembers', width: 28 },
    { header: 'Status', key: 'status', width: 14 },
    { header: 'Reviewed By', key: 'reviewedBy', width: 20 },
    { header: 'Submission Date', key: 'submittedAt', width: 20 }
  ];

  worksheet.insertRow(1, ['DEPARTMENT OF COMPUTER SCIENCE & ENGINEERING']);
  worksheet.insertRow(2, ['STUDENT PERFORMANCE & PARTICIPATION REGISTRATIONS 2026']);
  worksheet.insertRow(3, [`Generated On: ${new Date().toLocaleString('en-IN')} | Total Registrations: ${participations.length}`]);
  worksheet.insertRow(4, []); // spacer

  worksheet.mergeCells('A1:J1');
  worksheet.mergeCells('A2:J2');
  worksheet.mergeCells('A3:J3');

  const titleRow1 = worksheet.getRow(1);
  titleRow1.font = { name: 'Calibri', size: 16, bold: true, color: { argb: 'FFFFFF' } };
  titleRow1.alignment = { horizontal: 'center', vertical: 'middle' };
  titleRow1.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '0F172A' } };

  const titleRow2 = worksheet.getRow(2);
  titleRow2.font = { name: 'Calibri', size: 13, bold: true, color: { argb: 'F8FAFC' } };
  titleRow2.alignment = { horizontal: 'center', vertical: 'middle' };
  titleRow2.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '1E293B' } };

  const titleRow3 = worksheet.getRow(3);
  titleRow3.font = { name: 'Calibri', size: 10, italic: true, color: { argb: '64748B' } };
  titleRow3.alignment = { horizontal: 'center', vertical: 'middle' };

  // Header row formatting (row 5)
  const headerRow = worksheet.getRow(5);
  headerRow.font = { bold: true, color: { argb: 'FFFFFF' } };
  headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'D97706' } }; // Warm Amber/Gold
  headerRow.alignment = { vertical: 'middle', horizontal: 'center' };
  headerRow.height = 24;

  let reviewedCount = 0;

  participations.forEach((p, index) => {
    if (p.isReviewed) reviewedCount++;

    const row = worksheet.addRow({
      index: index + 1,
      name: p.name || 'N/A',
      year: p.year || 'N/A',
      contact: p.contact || 'N/A',
      performance: p.performance || 'N/A',
      performanceDetails: p.performanceDetails || '-',
      teamMembers: p.teamMembers || '-',
      status: p.isReviewed ? 'REVIEWED' : 'PENDING',
      reviewedBy: p.reviewedBy?.name || (p.isReviewed ? 'Admin' : '-'),
      submittedAt: new Date(p.createdAt).toLocaleDateString('en-IN')
    });

    // Color code status cell
    const statusCell = row.getCell('status');
    if (p.isReviewed) {
      statusCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'DCFCE7' } }; // light green
      statusCell.font = { bold: true, color: { argb: '166534' } };
    } else {
      statusCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FEF3C7' } }; // light yellow
      statusCell.font = { bold: true, color: { argb: '92400E' } };
    }
  });

  // Summary Row
  const summaryRow = worksheet.addRow({
    index: '',
    name: 'TOTAL REGISTRATIONS:',
    year: `${participations.length} Students`,
    contact: '',
    performance: '',
    performanceDetails: '',
    teamMembers: 'REVIEWED:',
    status: `${reviewedCount} / ${participations.length}`,
    reviewedBy: '',
    submittedAt: ''
  });

  summaryRow.font = { bold: true, size: 11 };
  summaryRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'F1F5F9' } };

  return workbook;
};

/**
 * Generates standard UTF-8 CSV with BOM for Contributions
 */
const exportContributionsToCSV = (contributions) => {
  const headers = [
    'Transaction ID',
    'Student Name',
    'Roll Number',
    'Registration Number',
    'Department',
    'Year',
    'Amount (INR)',
    'Payment Method',
    'Collected By',
    'Date',
    'Notes'
  ];

  const rows = contributions.map(item => {
    const s = item.student || {};
    return [
      `"${item.transactionReference || ''}"`,
      `"${(s.name || '').replace(/"/g, '""')}"`,
      `"${s.rollNumber || ''}"`,
      `"${s.registrationNumber || ''}"`,
      `"${s.department || 'CSE'}"`,
      `"${s.year || ''}"`,
      item.amount || 0,
      `"${item.paymentMethod || ''}"`,
      `"${(item.collectedByName || '').replace(/"/g, '""')}"`,
      `"${new Date(item.collectedAt).toLocaleString('en-IN')}"`,
      `"${(item.notes || '').replace(/"/g, '""')}"`
    ].join(',');
  });

  return '\uFEFF' + [headers.join(','), ...rows].join('\r\n');
};

/**
 * Generates standard UTF-8 CSV with BOM for Participations
 */
const exportParticipationsToCSV = (participations) => {
  const headers = [
    'Index',
    'Student Name',
    'Academic Year',
    'Contact (Phone / Email)',
    'Performance / Category',
    'Act Details',
    'Team Members',
    'Status',
    'Reviewed By',
    'Submission Date'
  ];

  const rows = participations.map((p, index) => {
    return [
      index + 1,
      `"${(p.name || '').replace(/"/g, '""')}"`,
      `"${p.year || ''}"`,
      `"${(p.contact || '').replace(/"/g, '""')}"`,
      `"${(p.performance || '').replace(/"/g, '""')}"`,
      `"${(p.performanceDetails || '').replace(/"/g, '""')}"`,
      `"${(p.teamMembers || '').replace(/"/g, '""')}"`,
      `"${p.isReviewed ? 'Reviewed' : 'Pending'}"`,
      `"${(p.reviewedBy?.name || (p.isReviewed ? 'Admin' : '')).replace(/"/g, '""')}"`,
      `"${new Date(p.createdAt).toLocaleDateString('en-IN')}"`
    ].join(',');
  });

  return '\uFEFF' + [headers.join(','), ...rows].join('\r\n');
};

module.exports = {
  exportContributionsToExcel,
  exportExpensesToExcel,
  exportParticipationsToExcel,
  exportContributionsToCSV,
  exportParticipationsToCSV
};
