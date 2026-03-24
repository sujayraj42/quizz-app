/**
 * MongoDB Models
 * Defines all database schemas for Study-Buddy
 */

const mongoose = require('mongoose');

// ============= ROOM SCHEMA =============

const roomSchema = new mongoose.Schema(
  {
    roomCode: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      index: true,
    },
    teacherName: {
      type: String,
      required: true,
    },
    quizTitle: {
      type: String,
      default: 'Study-Buddy Quiz',
    },
    status: {
      type: String,
      enum: ['waiting', 'active', 'ended'],
      default: 'waiting',
    },
    questions: [{
      _id: String,
      prompt: String,
      choices: [String],
      answerIndex: Number,
      category: String,
      difficulty: Number,
    }],
    currentQuestionIndex: {
      type: Number,
      default: -1,
    },
    players: [{
      studentId: String,
      name: String,
      color: String,
      score: { type: Number, default: 0 },
      joined: { type: Date, default: Date.now },
    }],
    createdAt: {
      type: Date,
      default: Date.now,
      expires: 86400, // Auto-delete after 24 hours
    },
  },
  { timestamps: true }
);

// ============= STUDENT SCHEMA =============

const studentSchema = new mongoose.Schema(
  {
    studentId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      lowercase: true,
    },
    school: String,
    totalQuizzesAttempted: { type: Number, default: 0 },
    totalCorrect: { type: Number, default: 0 },
    overallAccuracy: { type: Number, default: 0 },
    skillLevel: {
      type: String,
      enum: ['Novice', 'Beginner', 'Intermediate', 'Advanced', 'Expert'],
      default: 'Beginner',
    },
    badges: [String],
    lastActive: { type: Date, default: Date.now },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// ============= ANSWER RECORD SCHEMA =============

const answerRecordSchema = new mongoose.Schema(
  {
    studentId: {
      type: String,
      required: true,
      index: true,
    },
    roomCode: {
      type: String,
      required: true,
      index: true,
    },
    questionId: {
      type: String,
      required: true,
    },
    selectedAnswer: {
      type: Number,
      required: true,
    },
    correctAnswer: {
      type: Number,
      required: true,
    },
    isCorrect: {
      type: Boolean,
      required: true,
    },
    timeSpent: {
      type: Number, // seconds
      required: true,
    },
    category: String,
    difficulty: Number,
    submittedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  { timestamps: true }
);

// ============= QUIZ SESSION SCHEMA =============

const quizSessionSchema = new mongoose.Schema(
  {
    sessionId: {
      type: String,
      unique: true,
      index: true,
    },
    roomCode: {
      type: String,
      required: true,
      index: true,
    },
    teacherName: String,
    quizTitle: String,
    totalQuestions: Number,
    totalStudents: Number,
    completedStudents: Number,
    averageAccuracy: Number,
    questionsUsed: [String],
    startedAt: { type: Date, default: Date.now },
    endedAt: Date,
    duration: Number, // seconds
    status: {
      type: String,
      enum: ['active', 'completed', 'abandoned'],
      default: 'active',
    },
  },
  { timestamps: true }
);

// ============= PERFORMANCE ANALYTICS SCHEMA =============

const performanceSchema = new mongoose.Schema(
  {
    studentId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    totalAnswers: { type: Number, default: 0 },
    correctAnswers: { type: Number, default: 0 },
    accuracy: { type: Number, default: 0 },
    recentAccuracy: { type: Number, default: 0 },
    trend: { type: Number, default: 0 }, // +/- change
    categoryStats: {
      type: Map,
      of: {
        total: Number,
        correct: Number,
        avgTimeSpent: Number,
      },
    },
    weakAreas: [{
      category: String,
      accuracy: Number,
    }],
    learningCurve: [{
      questionNumber: Number,
      accuracy: Number,
    }],
    skillLevel: String,
    lastUpdated: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// ============= DIFFICULTY PROGRESSION SCHEMA =============

const difficultyProgressionSchema = new mongoose.Schema(
  {
    studentId: {
      type: String,
      required: true,
      index: true,
    },
    currentDifficulty: { type: Number, default: 2 }, // 1-3 scale
    adjustments: [{
      timestamp: { type: Date, default: Date.now },
      from: Number,
      to: Number,
      reason: String,
    }],
    lastAdjustment: Date,
  },
  { timestamps: true }
);

// ============= QUESTIONS SCHEMA =============

const questionSchema = new mongoose.Schema(
  {
    questionId: {
      type: String,
      unique: true,
      index: true,
    },
    prompt: {
      type: String,
      required: true,
    },
    choices: [{
      text: String,
      index: Number,
    }],
    answerIndex: {
      type: Number,
      required: true,
    },
    category: {
      type: String,
      index: true,
    },
    difficulty: {
      type: Number,
      enum: [1, 2, 3], // Easy, Medium, Hard
      default: 2,
    },
    explanation: String,
    tags: [String],
    usageCount: { type: Number, default: 0 },
    averageAccuracy: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now },
    createdBy: String,
  },
  { timestamps: true }
);

// ============= LEADERBOARD SCHEMA =============

const leaderboardSchema = new mongoose.Schema(
  {
    roomCode: {
      type: String,
      required: true,
      index: true,
    },
    studentId: String,
    name: String,
    score: Number,
    accuracy: Number,
    rank: Number,
    recordedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// ============= CREATE MODELS =============

const Room = mongoose.model('Room', roomSchema);
const Student = mongoose.model('Student', studentSchema);
const AnswerRecord = mongoose.model('AnswerRecord', answerRecordSchema);
const QuizSession = mongoose.model('QuizSession', quizSessionSchema);
const Performance = mongoose.model('Performance', performanceSchema);
const DifficultyProgression = mongoose.model('DifficultyProgression', difficultyProgressionSchema);
const Question = mongoose.model('Question', questionSchema);
const Leaderboard = mongoose.model('Leaderboard', leaderboardSchema);

// ============= INDEXES FOR PERFORMANCE =============

// Create indexes
answerRecordSchema.index({ studentId: 1, submittedAt: -1 });
answerRecordSchema.index({ roomCode: 1, submittedAt: -1 });
studentSchema.index({ createdAt: -1 });
quizSessionSchema.index({ startedAt: -1 });

module.exports = {
  Room,
  Student,
  AnswerRecord,
  QuizSession,
  Performance,
  DifficultyProgression,
  Question,
  Leaderboard,
};
