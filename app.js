const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const helmet = require('helmet');
const cors = require('cors');
const methodOverride = require('method-override');
const env = require('./config/env.config');
const { apiLimiter } = require('./middleware/rateLimit.middleware');
const { notFoundHandler, errorHandler } = require('./middleware/error.middleware');

// Route imports
const authRoutes = require('./routes/auth.routes');
const dashboardRoutes = require('./routes/dashboard.routes');
const studentRoutes = require('./routes/student.routes');
const contributionRoutes = require('./routes/contribution.routes');
const expenseRoutes = require('./routes/expense.routes');
const invitationRoutes = require('./routes/invitation.routes');
const adminRoutes = require('./routes/admin.routes');
const reportRoutes = require('./routes/report.routes');
const auditRoutes = require('./routes/audit.routes');
const galleryRoutes = require('./routes/gallery.routes');
const participationRoutes = require('./routes/participation.routes');
const programRoutes = require('./routes/program.routes');
const apiRoutes = require('./routes/api.routes');

const app = express();

// Security HTTP headers with Helmet
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false
  })
);

// Enable CORS for React frontend (universal origin support)
app.use(
  cors({
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'X-Requested-With']
  })
);

// Request logger
if (env.nodeEnv !== 'test') {
  app.use(morgan('dev'));
}

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser(env.cookieSecret));
app.use(methodOverride('_method'));

// View Engine (EJS)
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Static assets
app.use(express.static(path.join(__dirname, 'public')));

// Global locals for views
app.use((req, res, next) => {
  res.locals.appName = 'CSE EventLedger';
  res.locals.eventTitle = 'Teachers\' Day 2026';
  res.locals.departmentName = 'Department of Computer Science & Engineering';
  res.locals.currentPath = req.path;
  res.locals.currentUser = null;
  res.locals.successMsg = req.query.msg || null;
  res.locals.errorMsg = req.query.error || null;
  next();
});

// Root redirect
app.get('/', (req, res) => {
  if (req.cookies && req.cookies.accessToken) {
    return res.redirect('/dashboard');
  }
  res.redirect('/auth/login');
});

// Health check endpoint
app.use('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    message: 'CSE EventLedger Server Active',
    timestamp: new Date().toISOString()
  });
});

// Public API endpoints for React Frontend
app.use('/api', apiRoutes);

// Admin Portal routes
app.use('/auth', authRoutes);
app.use('/dashboard', dashboardRoutes);
app.use('/students', studentRoutes);
app.use('/contributions', contributionRoutes);
app.use('/expenses', expenseRoutes);
app.use('/invitations', invitationRoutes);
app.use('/programs', programRoutes);
app.use('/gallery', galleryRoutes);
app.use('/participations', participationRoutes);
app.use('/admins', adminRoutes);
app.use('/reports', reportRoutes);
app.use('/audit', auditRoutes);

// Catch 404
app.use(notFoundHandler);

// Centralized error handler
app.use(errorHandler);

module.exports = app;
