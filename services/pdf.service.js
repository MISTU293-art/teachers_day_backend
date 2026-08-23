const PDFDocument = require('pdfkit-table');

/**
 * Helper to generate official header for reports
 */
const drawOfficialHeader = (doc, title) => {
  doc.rect(0, 0, doc.page.width, 70).fill('#0f172a');
  
  doc.fontSize(16).fillColor('#38bdf8').text('DEPARTMENT OF COMPUTER SCIENCE & ENGINEERING', 40, 18, { align: 'center', characterSpacing: 1 });
  doc.fontSize(12).fillColor('#f8fafc').text(`TEACHERS' DAY CELEBRATION 2026 • ${title.toUpperCase()}`, 40, 38, { align: 'center' });
  doc.fontSize(8).fillColor('#94a3b8').text(`Generated on: ${new Date().toLocaleString('en-IN')}`, 40, 54, { align: 'center' });
  
  doc.fillColor('#000000');
  doc.moveDown(2);
};

/**
 * Generate Comprehensive Collection Report PDF
 */
const generateCollectionReportPDF = (contributions, stats = {}) => {
  const doc = new PDFDocument({ margin: 30, size: 'A4', bufferPages: true });

  drawOfficialHeader(doc, 'Collection & Financial Ledger');

  doc.y = 85;

  // Financial Summary Cards
  const totalCollected = stats.totalCollected || contributions.reduce((sum, c) => sum + (c.amount || 0), 0);
  const totalExpenses = stats.totalApprovedExpenses || 0;
  const remainingBalance = totalCollected - totalExpenses;

  doc.fontSize(11).fillColor('#0f172a').text('FINANCIAL OVERVIEW', 30, 85, { underline: true });
  
  // Draw summary boxes
  const boxY = 102;
  const boxWidth = 165;
  const boxHeight = 45;

  // Box 1: Collection
  doc.roundedRect(30, boxY, boxWidth, boxHeight, 4).fillAndStroke('#eff6ff', '#bfdbfe');
  doc.fontSize(8).fillColor('#1e40af').text('TOTAL COLLECTION', 40, boxY + 8);
  doc.fontSize(14).fillColor('#1e3a8a').text(`₹${totalCollected.toLocaleString('en-IN')}`, 40, boxY + 22);

  // Box 2: Expenses
  doc.roundedRect(210, boxY, boxWidth, boxHeight, 4).fillAndStroke('#fef2f2', '#fecaca');
  doc.fontSize(8).fillColor('#991b1b').text('APPROVED EXPENDITURE', 220, boxY + 8);
  doc.fontSize(14).fillColor('#7f1d1d').text(`₹${totalExpenses.toLocaleString('en-IN')}`, 220, boxY + 22);

  // Box 3: Remaining Balance
  doc.roundedRect(390, boxY, boxWidth, boxHeight, 4).fillAndStroke('#f0fdf4', '#bbf7d0');
  doc.fontSize(8).fillColor('#166534').text('NET REMAINING BALANCE', 400, boxY + 8);
  doc.fontSize(14).fillColor('#14532d').text(`₹${remainingBalance.toLocaleString('en-IN')}`, 400, boxY + 22);

  doc.y = 160;

  // Table structure
  const table = {
    title: 'STUDENT CONTRIBUTIONS LEDGER',
    headers: [
      { label: '#', property: 'index', width: 25 },
      { label: 'TX ID', property: 'txId', width: 70 },
      { label: 'Student Name', property: 'name', width: 110 },
      { label: 'Roll No', property: 'roll', width: 65 },
      { label: 'Year', property: 'year', width: 55 },
      { label: 'Amount', property: 'amount', width: 60 },
      { label: 'Method', property: 'method', width: 50 },
      { label: 'Collected By', property: 'collector', width: 100 }
    ],
    datas: contributions.map((c, i) => ({
      index: (i + 1).toString(),
      txId: c.transactionReference || 'N/A',
      name: c.student?.name || 'N/A',
      roll: c.student?.rollNumber || 'N/A',
      year: c.student?.year || 'N/A',
      amount: `₹${(c.amount || 0).toLocaleString('en-IN')}`,
      method: c.paymentMethod || 'Cash',
      collector: c.collectedByName || 'Admin'
    }))
  };

  doc.table(table, {
    prepareHeader: () => doc.fontSize(8).fillColor('#ffffff'),
    prepareRow: (row, indexColumn, indexRow, rectRow, rectCell) => {
      doc.fontSize(8).fillColor('#1e293b');
    }
  });

  // Footer page numbers
  const pages = doc.bufferedPageRange();
  for (let i = 0; i < pages.count; i++) {
    doc.switchToPage(i);
    doc.fontSize(8).fillColor('#94a3b8').text(
      `Page ${i + 1} of ${pages.count} • CSE Teachers' Day Finance System • Confidential`,
      30,
      doc.page.height - 25,
      { align: 'center', width: doc.page.width - 60 }
    );
  }

  doc.end();
  return doc;
};

/**
 * Generate Printable Receipt PDF
 */
const generateReceiptPDF = (contribution) => {
  // A6 size receipt (approx 297 x 420 pt)
  const doc = new PDFDocument({ size: [320, 460], margin: 20 });
  const student = contribution.student || {};

  // Background border
  doc.roundedRect(10, 10, 300, 440, 8).lineWidth(1.5).strokeColor('#2563eb').stroke();
  doc.rect(12, 12, 296, 60).fill('#0f172a');

  // Header
  doc.fontSize(12).fillColor('#38bdf8').text('CSE DEPARTMENT', 20, 20, { align: 'center' });
  doc.fontSize(10).fillColor('#ffffff').text('TEACHERS\' DAY CELEBRATION 2026', 20, 36, { align: 'center' });
  doc.fontSize(8).fillColor('#94a3b8').text('Official Contribution Receipt', 20, 52, { align: 'center' });

  // Receipt Details
  doc.y = 85;
  doc.fontSize(9).fillColor('#64748b').text('TRANSACTION ID:', 25, 85);
  doc.fontSize(10).fillColor('#2563eb').text(contribution.transactionReference, 130, 85);

  doc.fontSize(9).fillColor('#64748b').text('DATE & TIME:', 25, 105);
  doc.fontSize(9).fillColor('#1e293b').text(new Date(contribution.collectedAt).toLocaleString('en-IN'), 130, 105);

  doc.moveTo(25, 125).lineTo(295, 125).strokeColor('#e2e8f0').stroke();

  // Student details
  doc.fontSize(9).fillColor('#64748b').text('STUDENT NAME:', 25, 135);
  doc.fontSize(10).fillColor('#0f172a').text(student.name || 'N/A', 130, 135);

  doc.fontSize(9).fillColor('#64748b').text('ROLL NUMBER:', 25, 155);
  doc.fontSize(9).fillColor('#0f172a').text(student.rollNumber || 'N/A', 130, 155);

  doc.fontSize(9).fillColor('#64748b').text('REG. NUMBER:', 25, 175);
  doc.fontSize(9).fillColor('#0f172a').text(student.registrationNumber || 'N/A', 130, 175);

  doc.fontSize(9).fillColor('#64748b').text('YEAR & DEPT:', 25, 195);
  doc.fontSize(9).fillColor('#0f172a').text(`${student.year || ''} - ${student.department || 'CSE'}`, 130, 195);

  doc.moveTo(25, 215).lineTo(295, 215).strokeColor('#e2e8f0').stroke();

  // Payment block
  doc.roundedRect(25, 225, 270, 50, 4).fillAndStroke('#eff6ff', '#bfdbfe');
  doc.fontSize(9).fillColor('#1e40af').text('AMOUNT RECEIVED:', 35, 235);
  doc.fontSize(18).fillColor('#1d4ed8').text(`₹${(contribution.amount || 0).toLocaleString('en-IN')}`, 35, 250);

  doc.fontSize(9).fillColor('#1e40af').text(`Method: ${contribution.paymentMethod || 'Cash'}`, 190, 245);

  // Collector info
  doc.fontSize(9).fillColor('#64748b').text('COLLECTED BY:', 25, 290);
  doc.fontSize(9).fillColor('#0f172a').text(contribution.collectedByName || 'Authorized Admin', 130, 290);

  if (contribution.notes) {
    doc.fontSize(8).fillColor('#64748b').text('Notes:', 25, 310);
    doc.fontSize(8).fillColor('#334155').text(contribution.notes, 130, 310, { width: 160 });
  }

  // Footer message & status stamp
  doc.moveTo(25, 345).lineTo(295, 345).strokeColor('#e2e8f0').stroke();
  
  doc.fontSize(11).fillColor('#16a34a').text('VERIFIED ✓', 20, 360, { align: 'center' });
  doc.fontSize(8).fillColor('#64748b').text('Thank you for contributing to Teachers\' Day!', 20, 380, { align: 'center' });
  doc.fontSize(7).fillColor('#94a3b8').text('This is a computer-generated receipt from CSE EventLedger.', 20, 400, { align: 'center' });
  doc.fontSize(6).fillColor('#cbd5e1').text(`Auth Token ID: ${contribution._id}`, 20, 420, { align: 'center' });

  doc.end();
  return doc;
};

/**
 * Generate Elegant CSE Teacher Invitation Card PDF
 */
const generateInvitationCardPDF = (invitation) => {
  // A5 Landscape or Portrait (Portrait 420 x 595)
  const doc = new PDFDocument({ size: 'A5', margin: 25 });

  // Border & Background
  doc.rect(0, 0, doc.page.width, doc.page.height).fill('#090d16');
  doc.roundedRect(15, 15, doc.page.width - 30, doc.page.height - 30, 10)
    .lineWidth(2)
    .strokeColor('#eab308')
    .stroke();

  // Inner border
  doc.roundedRect(20, 20, doc.page.width - 40, doc.page.height - 40, 8)
    .lineWidth(0.5)
    .strokeColor('#ca8a04')
    .stroke();

  // Header Title
  doc.y = 35;
  doc.fontSize(11).fillColor('#fbbf24').text('DEPARTMENT OF COMPUTER SCIENCE & ENGINEERING', 25, 35, { align: 'center', characterSpacing: 1.5 });
  doc.fontSize(16).fillColor('#ffffff').text('TEACHERS\' DAY CELEBRATION 2026', 25, 52, { align: 'center', characterSpacing: 1 });
  
  // Divider
  doc.moveTo(80, 75).lineTo(doc.page.width - 80, 75).strokeColor('#ca8a04').stroke();

  // Invitation Badge
  doc.roundedRect((doc.page.width / 2) - 60, 85, 120, 22, 11).fill('#1e293b');
  doc.fontSize(10).fillColor('#38bdf8').text('INVITATION CARD', 25, 91, { align: 'center' });

  // Teacher Name & Designation
  doc.y = 125;
  doc.fontSize(11).fillColor('#94a3b8').text('Cordially Inviting', 25, 125, { align: 'center' });
  doc.fontSize(18).fillColor('#facc15').text(invitation.teacherName, 25, 145, { align: 'center' });
  doc.fontSize(10).fillColor('#e2e8f0').text(invitation.designation, 25, 170, { align: 'center' });
  doc.fontSize(9).fillColor('#94a3b8').text(invitation.department, 25, 186, { align: 'center' });

  // Custom Message Box
  doc.roundedRect(35, 210, doc.page.width - 70, 75, 6).fill('#111827');
  doc.fontSize(9).fillColor('#e2e8f0').text(
    `"${invitation.message || 'Your guidance has helped us turn code into confidence, bugs into lessons, and students into engineers.'}"`,
    45,
    222,
    { align: 'center', width: doc.page.width - 90, lineGap: 3 }
  );

  // Event Details Box
  const eventBoxY = 295;
  doc.roundedRect(35, eventBoxY, doc.page.width - 70, 70, 6).fillAndStroke('#172554', '#3b82f6');
  doc.fontSize(9).fillColor('#93c5fd').text(`📅 Date: ${invitation.eventDate || '5th September 2026'}`, 50, eventBoxY + 12);
  doc.fontSize(9).fillColor('#93c5fd').text(`⏰ Time: ${invitation.eventTime || '11:00 AM - 04:00 PM'}`, 50, eventBoxY + 28);
  doc.fontSize(9).fillColor('#93c5fd').text(`📍 Venue: ${invitation.venue || 'CSE Seminar Hall'}`, 50, eventBoxY + 44);

  // Programmer Joke Box
  const jokeY = 375;
  doc.roundedRect(35, jokeY, doc.page.width - 70, 60, 6).fill('#1e1b4b');
  doc.fontSize(8).fillColor('#c084fc').text('💻 A Small CSE Joke For You:', 45, jokeY + 8, { align: 'center' });
  doc.fontSize(8).fillColor('#e9d5ff').text(
    `"${invitation.joke || 'Why did the teacher bring a ladder to class? Because students wanted to reach the next level! 😄'}"`,
    45,
    jokeY + 22,
    { align: 'center', width: doc.page.width - 90, lineGap: 2 }
  );

  // Footer Signature
  doc.fontSize(9).fillColor('#f8fafc').text('With Deep Respect & Gratitude,', 25, 450, { align: 'center' });
  doc.fontSize(11).fillColor('#38bdf8').text('All Students of CSE Department', 25, 465, { align: 'center' });
  doc.fontSize(7).fillColor('#64748b').text('CSE EventLedger • Powered by Students of CSE', 25, 520, { align: 'center' });

  doc.end();
  return doc;
};

module.exports = {
  generateCollectionReportPDF,
  generateReceiptPDF,
  generateInvitationCardPDF
};
