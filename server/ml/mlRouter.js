/**
 * ML/AI Integration Router
 * Exposes ML endpoints for analytics, recommendations, and insights
 */

const express = require('express');
const router = express.Router();
const { PerformanceAnalytics } = require('./analytics');
const { AdaptiveDifficultyEngine } = require('./recommendations');
const { RecommendationEngine } = require('./recommendations');
const { InsightGenerator } = require('./insightGenerator');
const { QuestionGenerator } = require('./questionGenerator');

// Initialize ML engines
const performanceAnalytics = new PerformanceAnalytics();
const difficultyEngine = new AdaptiveDifficultyEngine();
const recommendationEngine = new RecommendationEngine();
const questionGenerator = new QuestionGenerator();

// ============= ANALYTICS ENDPOINTS =============

/**
 * GET /api/ml/analytics/student/:studentId
 * Get student performance summary
 */
router.get('/analytics/student/:studentId', (req, res) => {
  const { studentId } = req.params;
  const summary = performanceAnalytics.getPerformanceSummary(studentId);
  
  if (!summary) {
    return res.status(404).json({ error: 'Student not found' });
  }

  res.json(summary);
});

/**
 * GET /api/ml/analytics/learning-curve/:studentId
 * Get learning curve for a student
 */
router.get('/analytics/learning-curve/:studentId', (req, res) => {
  const { studentId } = req.params;
  const { interval = 5 } = req.query;

  const curve = performanceAnalytics.getLearningCurve(studentId, parseInt(interval));
  res.json({ studentId, curve });
});

/**
 * GET /api/ml/analytics/class
 * Get class-wide analytics
 */
router.get('/analytics/class', (req, res) => {
  const profiles = performanceAnalytics.getAllProfiles();
  res.json({ studentCount: profiles.length, students: profiles });
});

/**
 * POST /api/ml/analytics/record
 * Record a student's answer
 */
router.post('/analytics/record', (req, res) => {
  const { studentId, answerData } = req.body;
  
  if (!studentId || !answerData) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  performanceAnalytics.recordAnswer(studentId, answerData);
  const adjustment = difficultyEngine.recordPerformanceAndAdjust(
    studentId,
    answerData.correct,
    answerData.timeSpent || 0
  );

  res.json({
    recorded: true,
    difficultyAdjustment: adjustment,
  });
});

// ============= DIFFICULTY ENDPOINTS =============

/**
 * GET /api/ml/difficulty/:studentId
 * Get current difficulty for student
 */
router.get('/difficulty/:studentId', (req, res) => {
  difficultyEngine.initializeStudent(req.params.studentId);
  const difficulty = difficultyEngine.getRecommendedDifficulty(req.params.studentId);
  
  res.json({
    studentId: req.params.studentId,
    difficulty,
    difficultyName: difficultyEngine.getDifficultyName(difficulty),
  });
});

/**
 * GET /api/ml/difficulty/progression/:studentId
 * Get difficulty progression history
 */
router.get('/difficulty/progression/:studentId', (req, res) => {
  const progression = difficultyEngine.getDifficultyProgression(req.params.studentId);
  res.json({ studentId: req.params.studentId, progression });
});

/**
 * GET /api/ml/difficulty/statistics
 * Get difficulty statistics for all students
 */
router.get('/difficulty/statistics', (req, res) => {
  const stats = difficultyEngine.getStatistics();
  res.json(stats);
});

// ============= RECOMMENDATION ENDPOINTS =============

/**
 * GET /api/ml/recommend/next-question/:studentId
 * Get next recommended question
 */
router.get('/recommend/next-question/:studentId', (req, res) => {
  const { studentId } = req.params;
  const { usedQuestionIds = [] } = req.query;

  const question = recommendationEngine.recommendNextQuestion(
    studentId,
    performanceAnalytics,
    Array.isArray(usedQuestionIds) ? usedQuestionIds : [usedQuestionIds]
  );

  if (!question) {
    return res.status(404).json({ error: 'No questions available' });
  }

  res.json(question);
});

/**
 * GET /api/ml/recommend/student/:studentId
 * Get personalized recommendations for student
 */
router.get('/recommend/student/:studentId', (req, res) => {
  const recommendations = recommendationEngine.getStudentRecommendations(
    req.params.studentId,
    performanceAnalytics
  );

  res.json(recommendations);
});

/**
 * GET /api/ml/recommend/study-path/:studentId
 * Get recommended study path
 */
router.get('/recommend/study-path/:studentId', (req, res) => {
  const { count = 5 } = req.query;
  const path = recommendationEngine.recommendStudyPath(
    req.params.studentId,
    performanceAnalytics,
    parseInt(count)
  );

  res.json(path);
});

// ============= INSIGHTS ENDPOINTS =============

/**
 * GET /api/ml/insights/student/:studentId
 * Get detailed insights for a student
 */
router.get('/insights/student/:studentId', (req, res) => {
  const summary = performanceAnalytics.getPerformanceSummary(req.params.studentId);
  
  if (!summary) {
    return res.status(404).json({ error: 'Student not found' });
  }

  const insights = InsightGenerator.generateStudentInsights(summary);
  const badges = InsightGenerator.generateBadges(summary);

  res.json({ insights, badges });
});

/**
 * GET /api/ml/insights/class
 * Get class-wide insights
 */
router.get('/insights/class', (req, res) => {
  const profiles = performanceAnalytics.getAllProfiles();
  const summaries = profiles.map((p) => p.summary);
  const insights = InsightGenerator.generateClassInsights(summaries);

  res.json(insights);
});

/**
 * GET /api/ml/insights/anomalies/:studentId
 * Detect anomalies in student performance
 */
router.get('/insights/anomalies/:studentId', (req, res) => {
  const profile = performanceAnalytics.studentProfiles.get(req.params.studentId);
  
  if (!profile) {
    return res.status(404).json({ error: 'Student not found' });
  }

  const anomalies = InsightGenerator.detectAnomalies(profile.answers);
  res.json(anomalies);
});

// ============= QUESTION GENERATION ENDPOINTS =============

/**
 * POST /api/ml/questions/generate
 * Generate questions dynamically
 */
router.post('/questions/generate', (req, res) => {
  const { category = 'general', difficulty = 'medium', count = 5, topic = '' } = req.body;

  const questions = questionGenerator.generateQuestions({
    category,
    difficulty,
    count,
    topic,
  });

  res.json({ generated: questions.length, questions });
});

/**
 * GET /api/ml/questions/categories
 * Get available question categories
 */
router.get('/questions/categories', (req, res) => {
  const categories = questionGenerator.getAvailableCategories();
  res.json({ categories });
});

/**
 * POST /api/ml/questions/create
 * Create a custom question
 */
router.post('/questions/create', (req, res) => {
  try {
    const question = questionGenerator.createCustomQuestion(req.body);
    const validation = questionGenerator.validateQuestion(question);

    if (!validation.valid) {
      return res.status(400).json({ error: 'Invalid question', errors: validation.errors });
    }

    res.json({ created: true, question });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * POST /api/ml/questions/validate
 * Validate question format
 */
router.post('/questions/validate', (req, res) => {
  const validation = questionGenerator.validateQuestion(req.body);
  res.json(validation);
});

// ============= EXPORT ENDPOINTS =============

/**
 * GET /api/ml/export/analytics
 * Export all analytics data
 */
router.get('/export/analytics', (req, res) => {
  const data = performanceAnalytics.exportData();
  res.json(data);
});

/**
 * GET /api/ml/export/class-report
 * Export class report
 */
router.get('/export/class-report', (req, res) => {
  const profiles = performanceAnalytics.getAllProfiles();
  const insights = InsightGenerator.generateClassInsights(
    profiles.map((p) => p.summary)
  );

  res.json({
    generatedAt: new Date().toISOString(),
    insights,
    students: profiles,
  });
});

// ============= UTILITY ENDPOINTS =============

/**
 * GET /api/ml/health
 * ML engine health check
 */
router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    engines: {
      analytics: 'active',
      difficulty: 'active',
      recommendations: 'active',
      insights: 'active',
      questionGeneration: 'active',
    },
  });
});

module.exports = router;
