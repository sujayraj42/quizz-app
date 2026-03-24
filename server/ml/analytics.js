/**
 * Performance Analytics Engine
 * Analyzes student performance using statistical models
 * Provides predictions and insights based on answer patterns
 */

class PerformanceAnalytics {
  constructor() {
    this.studentProfiles = new Map();
  }

  /**
   * Record a student's answer
   * @param {string} studentId - Student identifier
   * @param {object} answerData - { questionId, correct, timeSpent, difficulty }
   */
  recordAnswer(studentId, answerData) {
    if (!this.studentProfiles.has(studentId)) {
      this.studentProfiles.set(studentId, {
        answers: [],
        stats: { totalAnswers: 0, correct: 0, incorrect: 0 },
        categoryStats: {},
        timeline: [],
      });
    }

    const profile = this.studentProfiles.get(studentId);
    profile.answers.push(answerData);
    profile.stats.totalAnswers++;

    if (answerData.correct) {
      profile.stats.correct++;
    } else {
      profile.stats.incorrect++;
    }

    // Track by category
    const category = answerData.category || 'general';
    if (!profile.categoryStats[category]) {
      profile.categoryStats[category] = {
        total: 0,
        correct: 0,
        avgTimeSpent: 0,
      };
    }

    const catStat = profile.categoryStats[category];
    catStat.total++;
    if (answerData.correct) catStat.correct++;
    catStat.avgTimeSpent =
      (catStat.avgTimeSpent * (catStat.total - 1) + answerData.timeSpent) /
      catStat.total;

    // Add to timeline
    profile.timeline.push({
      timestamp: Date.now(),
      correct: answerData.correct,
      questionId: answerData.questionId,
    });
  }

  /**
   * Get student performance summary
   * @param {string} studentId
   * @returns {object} Performance metrics
   */
  getPerformanceSummary(studentId) {
    const profile = this.studentProfiles.get(studentId);
    if (!profile) {
      return null;
    }

    const { stats, categoryStats } = profile;
    const accuracy =
      stats.totalAnswers > 0 ? (stats.correct / stats.totalAnswers) * 100 : 0;

    // Calculate improvement trend
    const recentAnswers = profile.answers.slice(-10);
    const recentAccuracy =
      recentAnswers.length > 0
        ? (recentAnswers.filter((a) => a.correct).length /
            recentAnswers.length) *
          100
        : 0;

    // Identify weak areas
    const weakAreas = Object.entries(categoryStats)
      .map(([category, stats]) => ({
        category,
        accuracy: (stats.correct / stats.total) * 100,
        avgTime: stats.avgTimeSpent,
      }))
      .sort((a, b) => a.accuracy - b.accuracy)
      .slice(0, 3);

    return {
      studentId,
      totalAnswers: stats.totalAnswers,
      correctAnswers: stats.correct,
      accuracy: accuracy.toFixed(2),
      recentAccuracy: recentAccuracy.toFixed(2),
      trend: recentAccuracy - accuracy,
      categoryStats,
      weakAreas,
      skillLevel: this._classifySkillLevel(accuracy),
    };
  }

  /**
   * Predict if student will answer correctly
   * Uses historical accuracy in category
   * @param {string} studentId
   * @param {string} category
   * @returns {number} Probability (0-1)
   */
  predictCorrectProbability(studentId, category) {
    const profile = this.studentProfiles.get(studentId);
    if (!profile) {
      return 0.5; // Default 50% for unknown students
    }

    const catStat = profile.categoryStats[category];
    if (!catStat) {
      // Use overall accuracy if category not seen before
      return profile.stats.correct / Math.max(profile.stats.totalAnswers, 1);
    }

    return catStat.correct / catStat.total;
  }

  /**
   * Estimate time needed for question
   * @param {string} studentId
   * @param {string} category
   * @returns {number} Estimated time in seconds
   */
  estimateTimeNeeded(studentId, category) {
    const profile = this.studentProfiles.get(studentId);
    if (!profile) {
      return 15; // Default time
    }

    const catStat = profile.categoryStats[category];
    if (!catStat) {
      // Calculate average across all categories
      const avgTimes = Object.values(profile.categoryStats).map(
        (s) => s.avgTimeSpent
      );
      return avgTimes.length > 0
        ? Math.round(avgTimes.reduce((a, b) => a + b) / avgTimes.length)
        : 15;
    }

    return Math.round(catStat.avgTimeSpent);
  }

  /**
   * Get learning curve - improvement over time
   * @param {string} studentId
   * @returns {array} Learning curve data points
   */
  getLearningCurve(studentId, intervalSize = 5) {
    const profile = this.studentProfiles.get(studentId);
    if (!profile || profile.answers.length === 0) {
      return [];
    }

    const curve = [];
    for (let i = 0; i < profile.answers.length; i += intervalSize) {
      const slice = profile.answers.slice(0, i + intervalSize);
      const correct = slice.filter((a) => a.correct).length;
      const accuracy = (correct / slice.length) * 100;
      curve.push({
        questionNumber: i + intervalSize,
        accuracy: parseFloat(accuracy.toFixed(2)),
      });
    }

    return curve;
  }

  /**
   * Compare student performance to class average
   * @param {string} studentId
   * @param {array} allStudentIds
   * @returns {object} Comparison metrics
   */
  compareToClassAverage(studentId, allStudentIds) {
    const studentSummary = this.getPerformanceSummary(studentId);
    if (!studentSummary) {
      return null;
    }

    const classAccuracies = allStudentIds
      .map((id) => {
        const summary = this.getPerformanceSummary(id);
        return summary ? parseFloat(summary.accuracy) : 0;
      })
      .filter((acc) => acc > 0);

    const classAverage =
      classAccuracies.reduce((a, b) => a + b, 0) / classAccuracies.length;

    return {
      studentAccuracy: parseFloat(studentSummary.accuracy),
      classAverage: classAverage.toFixed(2),
      percentile: this._calculatePercentile(
        parseFloat(studentSummary.accuracy),
        classAccuracies
      ),
      rank: this._calculateRank(
        parseFloat(studentSummary.accuracy),
        classAccuracies
      ),
    };
  }

  /**
   * Classify skill level based on accuracy
   * @private
   */
  _classifySkillLevel(accuracy) {
    if (accuracy >= 85) return 'Expert';
    if (accuracy >= 70) return 'Advanced';
    if (accuracy >= 60) return 'Intermediate';
    if (accuracy >= 50) return 'Beginner';
    return 'Novice';
  }

  /**
   * Calculate percentile rank
   * @private
   */
  _calculatePercentile(score, allScores) {
    const belowScore = allScores.filter((s) => s < score).length;
    return Math.round((belowScore / allScores.length) * 100);
  }

  /**
   * Calculate rank position
   * @private
   */
  _calculateRank(score, allScores) {
    const betterScores = allScores.filter((s) => s > score).length;
    return betterScores + 1;
  }

  /**
   * Get all student profiles
   */
  getAllProfiles() {
    return Array.from(this.studentProfiles.entries()).map(([id, profile]) => ({
      studentId: id,
      summary: this.getPerformanceSummary(id),
    }));
  }

  /**
   * Export data for analysis
   */
  exportData() {
    return {
      timestamp: new Date().toISOString(),
      profiles: this.getAllProfiles(),
    };
  }
}

module.exports = { PerformanceAnalytics };
