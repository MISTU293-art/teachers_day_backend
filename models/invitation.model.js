const mongoose = require('mongoose');

const invitationSchema = new mongoose.Schema(
  {
    teacherName: {
      type: String,
      required: [true, 'Teacher name is required'],
      trim: true,
      maxlength: [100, 'Teacher name cannot exceed 100 characters']
    },
    department: {
      type: String,
      required: [true, 'Department is required'],
      default: 'Department of Computer Science & Engineering',
      trim: true
    },
    designation: {
      type: String,
      required: [true, 'Designation is required'],
      trim: true
    },
    message: {
      type: String,
      trim: true,
      default: 'Your guidance has helped us turn code into confidence, bugs into lessons, and students into engineers. We warmly invite you to join us in celebrating Teachers\' Day.'
    },
    joke: {
      type: String,
      trim: true,
      default: 'Why did the teacher bring a ladder to class? Because the students wanted to reach the next level! 😄'
    },
    eventDate: {
      type: String,
      default: '5th September 2026',
      trim: true
    },
    eventTime: {
      type: String,
      default: '11:00 AM - 04:00 PM',
      trim: true
    },
    venue: {
      type: String,
      default: 'CSE Department Seminar Hall (Auditorium 302)',
      trim: true
    },
    theme: {
      type: String,
      enum: ['cyber-gold', 'matrix-green', 'tech-purple', 'classic-navy'],
      default: 'cyber-gold'
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Invitation', invitationSchema);
