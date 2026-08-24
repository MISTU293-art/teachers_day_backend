module.exports = {
  ROLES: {
    SUPERADMIN: 'superadmin',
    ADMIN: 'admin'
  },
  
  YEARS: {
    FIRST: '1st Year',
    SECOND: '2nd Year',
    THIRD: '3rd Year',
    FOURTH: '4th Year'
  },

  ALLOWED_CONTRIBUTION_YEARS: ['2nd Year', '3rd Year', '4th Year'],
  RESTRICTED_CONTRIBUTION_YEARS: ['1st Year', '1st'],

  PAYMENT_METHODS: {
    CASH: 'Cash',
    UPI: 'UPI',
    BANK_TRANSFER: 'Bank Transfer'
  },

  CONTRIBUTION_STATUS: {
    PENDING: 'Pending',
    PARTIALLY_PAID: 'Partially Paid',
    PAID: 'Paid',
    NOT_ELIGIBLE: 'Not Eligible'
  },

  EXPENSE_CATEGORIES: [
    'Decoration',
    'Food',
    'Printing',
    'Gifts',
    'Flowers',
    'Hall',
    'Sound System',
    'Teacher Invitation',
    'Stationery',
    'Miscellaneous'
  ],

  EXPENSE_STATUS: {
    PENDING: 'pending',
    APPROVED: 'approved',
    REJECTED: 'rejected'
  },

  AUDIT_MODULES: {
    AUTH: 'AUTH',
    STUDENTS: 'STUDENTS',
    CONTRIBUTIONS: 'CONTRIBUTIONS',
    EXPENSES: 'EXPENSES',
    INVITATIONS: 'INVITATIONS',
    ADMINS: 'ADMINS',
    REPORTS: 'REPORTS',
    GALLERY: 'GALLERY',
    PARTICIPATIONS: 'PARTICIPATIONS',
    PROGRAMS: 'PROGRAMS',
    SYSTEM: 'SYSTEM'
  },

  AUDIT_ACTIONS: {
    LOGIN: 'LOGIN',
    LOGOUT: 'LOGOUT',
    CREATE_ADMIN: 'CREATE_ADMIN',
    UPDATE_ADMIN: 'UPDATE_ADMIN',
    DISABLE_ADMIN: 'DISABLE_ADMIN',
    ENABLE_ADMIN: 'ENABLE_ADMIN',
    RESET_PASSWORD: 'RESET_PASSWORD',
    CREATE_STUDENT: 'CREATE_STUDENT',
    UPDATE_STUDENT: 'UPDATE_STUDENT',
    DELETE_STUDENT: 'DELETE_STUDENT',
    CREATE_CONTRIBUTION: 'CREATE_CONTRIBUTION',
    EDIT_CONTRIBUTION: 'EDIT_CONTRIBUTION',
    DELETE_CONTRIBUTION: 'DELETE_CONTRIBUTION',
    REJECTED_CONTRIBUTION_FIRST_YEAR: 'REJECTED_CONTRIBUTION_FIRST_YEAR',
    CREATE_EXPENSE: 'CREATE_EXPENSE',
    UPDATE_EXPENSE: 'UPDATE_EXPENSE',
    APPROVE_EXPENSE: 'APPROVE_EXPENSE',
    REJECT_EXPENSE: 'REJECT_EXPENSE',
    DELETE_EXPENSE: 'DELETE_EXPENSE',
    CREATE_INVITATION: 'CREATE_INVITATION',
    UPDATE_INVITATION: 'UPDATE_INVITATION',
    DELETE_INVITATION: 'DELETE_INVITATION',
    EXPORT_REPORT: 'EXPORT_REPORT',
    UPLOAD_IMAGE: 'UPLOAD_IMAGE',
    DELETE_IMAGE: 'DELETE_IMAGE',
    REVIEW_PARTICIPATION: 'REVIEW_PARTICIPATION',
    CREATE_PROGRAM: 'CREATE_PROGRAM',
    UPDATE_PROGRAM: 'UPDATE_PROGRAM',
    DELETE_PROGRAM: 'DELETE_PROGRAM'
  },

  PROGRAM_CATEGORIES: [
    'Celebration',
    'Hackathon',
    'Workshop',
    'Technical Fest',
    'Cultural',
    'Seminar & Keynote',
    'Orientation & Freshers',
    'Farewell',
    'Coding Contest',
    'Other'
  ],

  PROGRAM_STATUS: {
    UPCOMING: 'Upcoming',
    ONGOING: 'Ongoing',
    COMPLETED: 'Completed',
    POSTPONED: 'Postponed'
  },

  REGISTRATION_STATUS: {
    OPEN: 'Open',
    CLOSED: 'Closed',
    COMING_SOON: 'Coming Soon',
    NOT_REQUIRED: 'Not Required'
  },

  PERFORMANCE_TYPES: [
    'Dance',
    'Singing',
    'Poetry',
    'Skit',
    'Standup Comedy',
    'Instrumental',
    'Mimicry',
    'Speech',
    'Other'
  ],

  DEFAULT_PAGINATION_LIMIT: 20,
  MAX_PAGINATION_LIMIT: 100
};
