# Teachers' Day Money Collection & Event Management System (CSE EventLedger)

> **"Collect. Track. Celebrate."** — A secure, auditable, enterprise-grade financial management platform designed by CSE students to manage Teachers' Day finances, student contributions, teacher invitations, expenses, and administrative workflows.

---

## 🚀 Key Features

### 1. 🔐 Role-Based Access Control & Strict Security
* **No Public Registration**: Public registration (`/register`) is completely blocked (returns 404). Accounts can only be created by the SuperAdmin.
* **SuperAdmin Auto-Initialization**: Automatically creates or synchronizes the SuperAdmin account on startup from `.env` with strong bcrypt hashing (no plaintext stored).
* **SuperAdmin Privileges**: The SuperAdmin is the **only** user authorized to create volunteer Administrator accounts, toggle active/disabled status, reset passwords, and approve expenses.
* **Admin Role Protection**: Normal Admin volunteers cannot create other Admins or elevate roles (backend strictly returns `403 Forbidden`).
* **Session Security**: JWT stored in HTTP-Only, Secure, SameSite cookies with Helmet HTTP headers and rate-limited authentication.

### 2. 💰 High-Efficiency Money Collection Terminal
* **Instant Student Search**: Real-time live autocomplete by Student Name, Roll Number, or Registration Number.
* **1st-Year Contribution Guard**: **First-year students are strictly prohibited from contributing.** Enforced on both frontend and backend (`403 Forbidden`).
* **Automatic Collector Traceability**: The system automatically stamps `collectedBy` and `collectedByName` from the authenticated JWT session. **Frontend spoofing is impossible**.
* **Unique Transaction IDs**: Every contribution receives a formatted identifier (e.g. `TD26-A1B2C3`).
* **Duplicate Detection**: Displays a warning if a student has already contributed, with an option to record additional contributions.
* **Instant Receipts**: Printable and downloadable PDF receipts with official CSE Department branding.

### 3. 💸 Expense Management & Approval Workflow
* **Category Tracking**: Stage Decoration, Food & Catering, Printing, Gifts, Flowers, Sound System, Teacher Invitations, Stationery, Miscellaneous.
* **SuperAdmin Approval**: Expenses submitted by volunteer Admins remain `pending` until approved by the SuperAdmin.
* **Financial Balance Formula**:
  $$\text{Net Remaining Balance} = \sum \text{Total Collections} - \sum \text{Approved Expenditures}$$
  Unapproved or rejected expenses never deduct from the official balance.

### 4. 👩‍🏫 Teacher Invitation Cards & PDF Generator
* **CSE Themed Cards**: High-resolution digital invitation cards with personalized faculty designations, heartfelt messages, and programming jokes (e.g. *"Why do programmers prefer dark mode? Because light attracts bugs!"*).
* **1-Click PDF Download**: Generates styled PDF invitation cards using PDFKit.
* **Print Mode**: Built-in CSS print styling for direct physical printing.

### 5. 📊 Reports & Multi-Format Exports
* **Excel (.xlsx)**: Styled workbooks with formula totals and custom column formatting using `exceljs`.
* **CSV**: Excel-compatible UTF-8 CSV with Byte Order Mark (BOM).
* **Official PDF Reports**: Formatted statements with CSE Department headers, summary financial stat cards, and transaction ledger tables using `pdfkit-table`.
* **Server-Side Pagination**: Clean pagination for all large datasets (Students, Collections, Expenses, Audit Logs).

### 6. 🛡️ Immutable Security Audit Logs
* Tracks every sensitive action (`LOGIN`, `LOGOUT`, `CREATE_ADMIN`, `CREATE_CONTRIBUTION`, `REJECTED_CONTRIBUTION_FIRST_YEAR`, `CREATE_EXPENSE`, `APPROVE_EXPENSE`, `EXPORT_REPORT`) with timestamp, user role, description, and IP address.

---

## 🛠️ Tech Stack & Architecture

* **Backend**: Node.js, Express.js
* **Database**: MongoDB + Mongoose (Indexes on `email`, `rollNumber`, `registrationNumber`, `collectedBy`, `status`)
* **Template Engine**: EJS (with modular headers, sidebars, partials, and responsive layouts)
* **Frontend UI**: Bootstrap 5, FontAwesome 6, Chart.js, Custom CSE Dark/Tech Theme
* **Reporting & PDFs**: `pdfkit`, `pdfkit-table`, `exceljs`
* **Security & Auth**: `jsonwebtoken`, `bcryptjs`, `cookie-parser`, `helmet`, `express-rate-limit`, `express-validator`
* **Architecture**: Strict Model-View-Controller (MVC)

---

## 📁 Directory Structure

```
teachers-day-management/
├── config/
│   ├── constants.js          # System constants (roles, statuses, categories)
│   ├── db.config.js          # Mongoose database connection
│   └── env.config.js         # Environment variables & SuperAdmin defaults
├── controllers/
│   ├── auth.controller.js
│   ├── dashboard.controller.js
│   ├── student.controller.js
│   ├── contribution.controller.js
│   ├── expense.controller.js
│   ├── invitation.controller.js
│   ├── admin.controller.js
│   ├── report.controller.js
│   └── audit.controller.js
├── middleware/
│   ├── auth.middleware.js
│   ├── role.middleware.js
│   ├── validation.middleware.js
│   ├── rateLimit.middleware.js
│   └── error.middleware.js
├── models/
│   ├── user.model.js
│   ├── student.model.js
│   ├── contribution.model.js
│   ├── expense.model.js
│   ├── invitation.model.js
│   └── auditLog.model.js
├── public/
│   ├── css/ (custom.css, invitation-card.css)
│   └── js/ (collection.js, charts.js, main.js)
├── routes/
│   ├── auth.routes.js
│   ├── dashboard.routes.js
│   ├── student.routes.js
│   ├── contribution.routes.js
│   ├── expense.routes.js
│   ├── invitation.routes.js
│   ├── admin.routes.js
│   ├── report.routes.js
│   └── audit.routes.js
├── services/
│   ├── auth.service.js
│   ├── audit.service.js
│   ├── export.service.js
│   ├── pdf.service.js
│   └── seeder.service.js
├── utils/
│   ├── asyncHandler.js
│   ├── generateTransactionId.js
│   ├── pagination.js
│   └── response.js
├── validators/
│   ├── auth.validator.js
│   ├── student.validator.js
│   ├── contribution.validator.js
│   ├── expense.validator.js
│   ├── invitation.validator.js
│   └── admin.validator.js
├── views/
│   ├── layouts/
│   ├── partials/
│   ├── auth/
│   ├── dashboard/
│   ├── students/
│   ├── contributions/
│   ├── expenses/
│   ├── invitations/
│   ├── admins/
│   ├── reports/
│   ├── audit/
│   └── errors/
├── tests/
│   ├── setup.js
│   ├── auth.test.js
│   ├── security.test.js
│   ├── contribution.test.js
│   ├── expense.test.js
│   └── export.test.js
├── scripts/
│   ├── run-tests.js
│   └── seed.js
├── .env.example
├── .env
├── package.json
└── server.js
```

---

## 🚀 Getting Started

### 1. Prerequisites
* Node.js (v18+)
* MongoDB (v6.0+) running locally on `mongodb://127.0.0.1:27017`

### 2. Environment Configuration
Copy `.env.example` to `.env`:
```env
PORT=3000
NODE_ENV=development
MONGODB_URI=mongodb://127.0.0.1:27017/teachers_day
ACCESS_TOKEN_SECRET=your_long_random_jwt_secret_key
ACCESS_TOKEN_EXPIRES_IN=1d
COOKIE_SECRET=your_long_random_cookie_secret_key
SUPERADMIN_NAME=CSE Super Administrator
SUPERADMIN_EMAIL=superadmin@example.com
SUPERADMIN_PASSWORD=SuperAdmin@2026!
SUPERADMIN_DEPARTMENT=Computer Science & Engineering
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Start the Application
```bash
npm start
```
The application will connect to MongoDB, initialize the SuperAdmin account, seed the CSE demo dataset (if empty), and start at `http://localhost:3000`.

### 5. Running Automated Tests
```bash
npm test
```
Executes the comprehensive 21-test suite covering authentication, RBAC, 1st-year restrictions, collector spoofing defense, financial calculations, and PDF/Excel generation.

---

## 🔑 Default Credentials

* **SuperAdmin Portal**:
  * Email: `superadmin@example.com`
  * Password: `SuperAdmin@2026!`
* **Volunteer Admin**:
  * Email: `rahul.volunteer@example.com`
  * Password: `Password@123`

---

## 📜 License
MIT License • Built with pride by CSE Students for Teachers' Day 2026.
#   t e a c h e r s _ d a y _ b a c k e n d  
 