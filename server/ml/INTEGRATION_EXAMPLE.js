/**
 * ML Integration Example
 * Shows how to integrate ML/AI features into your Socket.io handlers
 * Reference implementation for server/socket.js enhancements
 */

// ============= IMPORTS =============

const { PerformanceAnalytics } = require('./ml/analytics');
const { AdaptiveDifficultyEngine } = require('./ml/recommendations');
const { RecommendationEngine } = require('./ml/recommendations');
const { InsightGenerator } = require('./ml/insightGenerator');
const { QuestionGenerator } = require('./ml/questionGenerator');

// ============= INITIALIZE ML ENGINES =============

const performanceAnalytics = new PerformanceAnalytics();
const difficultyEngine = new AdaptiveDifficultyEngine();
const recommendationEngine = new RecommendationEngine();
const questionGenerator = new QuestionGenerator();

// ============= EXAMPLE 1: REGISTER ANSWER WITH ML TRACKING =============

/**
 * Socket.io handler enhancement for tracking answers
 * Add this to your existing answer submission handler
 */

function handleAnswerSubmissionWithML(io, socket, data) {
  const {
    roomCode,
    studentId,
    studentName,
    questionId,
    selectedAnswerIndex,
    timeSpent,
  } = data;

  // Your existing validation...
  const room = roomManager.getRoomState(roomCode);
  const question = room.questions[room.currentQuestionIndex];
  const isCorrect = selectedAnswerIndex === question.answerIndex;

  // ✅ NEW: Record analytics
  performanceAnalytics.recordAnswer(studentId, {
    questionId,
    correct: isCorrect,
    timeSpent,
    category: question.category || 'general',
    difficulty: question.difficulty || 2,
  });

  // ✅ NEW: Record and adjust difficulty
  const difficultyAdjustment = difficultyEngine.recordPerformanceAndAdjust(
    studentId,
    isCorrect,
    timeSpent
  );

  // Emit analytics update to student
  socket.emit('analytics:updated', {
    summary: performanceAnalytics.getPerformanceSummary(studentId),
    difficulty: difficultyAdjustment,
  });

  // Your existing answer logic...
}

// ============= EXAMPLE 2: GET NEXT QUESTION WITH RECOMMENDATIONS =============

/**
 * Use ML to recommend next question
 * Replace static question selection with adaptive selection
 */

function getNextQuestionWithML(roomCode, studentId) {
  const room = roomManager.getRoomState(roomCode);
  const usedQuestionIds = room.selectedQuestions
    .slice(0, room.currentQuestionIndex + 1)
    .map((q) => q.id);

  // ✅ Get ML-recommended question
  const nextQuestion = recommendationEngine.recommendNextQuestion(
    studentId,
    performanceAnalytics,
    usedQuestionIds
  );

  // ✅ Apply adaptive difficulty
  const difficulty = difficultyEngine.getRecommendedDifficulty(studentId);
  nextQuestion.difficulty = difficulty;
  nextQuestion.difficultyName = difficultyEngine.getDifficultyName(difficulty);

  return nextQuestion;
}

// ============= EXAMPLE 3: SEND STUDENT DASHBOARD WITH INSIGHTS =============

/**
 * Provide rich feedback with ML-generated insights
 */

function sendStudentDashboardWithInsights(socket, studentId) {
  // ✅ Get performance summary
  const summary = performanceAnalytics.getPerformanceSummary(studentId);

  if (!summary) {
    socket.emit('dashboard:error', { message: 'No data yet' });
    return;
  }

  // ✅ Generate insights
  const insights = InsightGenerator.generateStudentInsights(summary);

  // ✅ Generate badges
  const badges = InsightGenerator.generateBadges(summary);

  // ✅ Get recommendations
  const recommendations = recommendationEngine.getStudentRecommendations(
    studentId,
    performanceAnalytics
  );

  // ✅ Send comprehensive dashboard
  socket.emit('dashboard:data', {
    summary,
    insights,
    badges,
    recommendations,
  });
}

// ============= EXAMPLE 4: SEND CLASS ANALYTICS DASHBOARD =============

/**
 * Teacher dashboard with class-wide insights
 */

function sendClassAnalyticsToTeacher(socket, roomCode) {
  const room = roomManager.getRoomState(roomCode);
  const studentIds = Object.keys(room.players);

  // ✅ Get all summaries
  const profiles = performanceAnalytics.getAllProfiles();
  const summaries = profiles.map((p) => p.summary);

  // ✅ Generate class insights
  const classInsights = InsightGenerator.generateClassInsights(summaries);

  // ✅ Get difficulty statistics
  const difficultyStats = difficultyEngine.getStatistics();

  // Send to teacher
  socket.emit('analytics:class', {
    insights: classInsights,
    difficultyStats,
    timestamp: new Date().toISOString(),
  });
}

// ============= EXAMPLE 5: DETECT ANOMALIES & ALERT TEACHER =============

/**
 * Monitor for cheating and irregular patterns
 */

function checkForAnomalies(studentId, io, roomCode) {
  const profile = performanceAnalytics.studentProfiles.get(studentId);

  if (!profile) return;

  // ✅ Detect anomalies
  const { anomalies, count } = InsightGenerator.detectAnomalies(
    profile.answers
  );

  if (count > 0) {
    // Alert teacher
    io.to(roomCode)
      .to('teacher-socket-id')
      .emit('alert:anomaly', {
        studentId,
        severity: anomalies[0].severity,
        message: anomalies[0].description,
        timestamp: new Date().toISOString(),
      });

    console.warn(`Anomaly detected: ${studentId} - ${anomalies[0].description}`);
  }
}

// ============= EXAMPLE 6: DYNAMIC QUESTION GENERATION =============

/**
 * Generate questions on-demand with ML
 */

function generateCustomQuestions(params) {
  const { category = 'science', difficulty = 'medium', count = 3 } = params;

  // ✅ Generate with ML
  const generated = questionGenerator.generateQuestions({
    category,
    difficulty,
    count,
  });

  return generated;
}

// ============= EXAMPLE 7: END-OF-QUIZ REPORT =============

/**
 * Generate comprehensive report when quiz ends
 */

function generateQuizReport(roomCode) {
  const room = roomManager.getRoomState(roomCode);
  const studentIds = Object.keys(room.players);

  // ✅ Collect all summaries
  const studentReports = studentIds.map((studentId) => {
    const summary = performanceAnalytics.getPerformanceSummary(studentId);
    const insights = InsightGenerator.generateStudentInsights(summary);
    const badges = InsightGenerator.generateBadges(summary);

    return {
      studentId,
      studentName: room.players[studentId].name,
      summary,
      insights,
      badges,
    };
  });

  // ✅ Generate class report
  const summaries = studentReports.map((r) => r.summary);
  const classInsights = InsightGenerator.generateClassInsights(summaries);

  return {
    roomCode,
    timestamp: new Date().toISOString(),
    classInsights,
    studentReports,
  };
}

// ============= EXAMPLE 8: REAL-TIME PERFORMANCE TRACKING =============

/**
 * Emit real-time performance updates during quiz
 */

function emitRealtimePerformanceUpdate(io, roomCode, studentId) {
  const summary = performanceAnalytics.getPerformanceSummary(studentId);
  const difficulty = difficultyEngine.getRecommendedDifficulty(studentId);

  // Send to leaderboard display
  io.to(`${roomCode}-display`).emit('performance:update', {
    studentId,
    accuracy: summary.accuracy,
    correctAnswers: summary.correctAnswers,
    questionCount: summary.totalAnswers,
    skillLevel: summary.skillLevel,
    difficulty,
  });
}

// ============= EXAMPLE 9: ADAPTIVE QUESTION SELECTION =============

/**
 * Automatically select best next question based on ML
 */

function selectAdaptiveNextQuestion(roomCode, studentId, allQuestions) {
  // ✅ Get study path recommendation
  const path = recommendationEngine.recommendStudyPath(
    studentId,
    performanceAnalytics,
    1
  );

  if (path.path.length > 0) {
    return path.path[0];
  }

  // Fallback to random
  return allQuestions[Math.floor(Math.random() * allQuestions.length)];
}

// ============= EXAMPLE 10: EXPORT DATA FOR ANALYSIS =============

/**
 * Export all data for further analysis
 */

function exportAllAnalyticsData() {
  const analytics = performanceAnalytics.exportData();
  const reportTimestamp = new Date().toISOString();

  const exportData = {
    exportedAt: reportTimestamp,
    totalStudents: analytics.profiles.length,
    analytics: analytics.profiles,
    classInsights: InsightGenerator.generateClassInsights(
      analytics.profiles.map((p) => p.summary)
    ),
  };

  return exportData;
}

// ============= INTEGRATION CHECKLIST =============

/**
 * Checklist for integrating ML into your Socket.io handlers:
 *
 * ✅ 1. Import ML modules at top of socket.js
 * ✅ 2. Initialize engines as global instances
 * ✅ 3. In answer submission handler:
 *      - Call performanceAnalytics.recordAnswer()
 *      - Call difficultyEngine.recordPerformanceAndAdjust()
 *      - Check for anomalies with InsightGenerator.detectAnomalies()
 * ✅ 4. In next question selection:
 *      - Use recommendationEngine.recommendNextQuestion()
 *      - Apply difficulty from difficultyEngine
 * ✅ 5. Add dashboard endpoint:
 *      - Send student insights via sendStudentDashboardWithInsights()
 *      - Send class analytics via sendClassAnalyticsToTeacher()
 * ✅ 6. Add real-time updates:
 *      - Emit performance updates with emitRealtimePerformanceUpdate()
 * ✅ 7. At quiz end:
 *      - Generate report with generateQuizReport()
 * ✅ 8. Add export functionality:
 *      - Expose exportAllAnalyticsData()
 * ✅ 9. Test all ML features in development
 * ✅ 10. Monitor performance and adjust parameters
 */

// ============= EXPORTS =============

module.exports = {
  // Instances
  performanceAnalytics,
  difficultyEngine,
  recommendationEngine,
  questionGenerator,

  // Handlers
  handleAnswerSubmissionWithML,
  getNextQuestionWithML,
  sendStudentDashboardWithInsights,
  sendClassAnalyticsToTeacher,
  checkForAnomalies,
  generateCustomQuestions,
  generateQuizReport,
  emitRealtimePerformanceUpdate,
  selectAdaptiveNextQuestion,
  exportAllAnalyticsData,
};
