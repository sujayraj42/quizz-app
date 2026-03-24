/**
 * Recommendation Engine
 * Recommends questions based on student's weak areas and learning patterns
 */

class RecommendationEngine {
  constructor(allQuestions = []) {
    this.allQuestions = allQuestions;
    this.studentWeakAreas = new Map();
  }

  setQuestions(questions) {
    this.allQuestions = questions;
  }

  getStudentRecommendations(studentId, performanceAnalytics) {
    const summary = performanceAnalytics.getPerformanceSummary(studentId);
    if (!summary) return { studentId, recommendations: [] };

    const recommendations = [];

    // Low accuracy recommendation
    if (parseFloat(summary.accuracy) < 60) {
      recommendations.push({
        type: 'difficulty',
        message: 'Your accuracy is below 60%. Practice with easier questions.',
        action: 'reduce_difficulty',
        priority: 'high'
      });
    }

    // Weak area recommendations
    summary.weakAreas.forEach((weak) => {
      recommendations.push({
        type: 'weak_area',
        message: `Focus on ${weak.category}: You have ${weak.accuracy.toFixed(1)}% accuracy.`,
        action: 'practice_category',
        category: weak.category,
        priority: 'high'
      });
    });

    // Improvement trend
    if (summary.trend > 0) {
      recommendations.push({
        type: 'positive_trend',
        message: `Great! You're improving. Your recent accuracy is ${summary.recentAccuracy}%.`,
        action: null,
        priority: 'low'
      });
    } else if (summary.trend < -5) {
      recommendations.push({
        type: 'negative_trend',
        message: 'Your recent performance has declined. Take a break or review basics.',
        action: null,
        priority: 'medium'
      });
    }

    // Skill level message
    recommendations.push({
      type: 'skill_level',
      message: `Current level: ${summary.skillLevel}`,
      action: null,
      priority: 'info'
    });

    return { studentId, recommendations, summary };
  }

  recommendNextQuestion(studentId, performanceAnalytics, usedQuestionIds = []) {
    const summary = performanceAnalytics.getPerformanceSummary(studentId);
    if (!summary || summary.weakAreas.length === 0) {
      return this._getRandomQuestion(usedQuestionIds);
    }

    const weakestCategory = summary.weakAreas[0].category;
    const candidates = this.allQuestions.filter(q => 
      (q.category === weakestCategory || q.theme === weakestCategory) &&
      !usedQuestionIds.includes(q.id)
    );

    if (candidates.length === 0) {
      return this._getRandomQuestion(usedQuestionIds);
    }

    const difficulty = performanceAnalytics.predictCorrectProbability(studentId, weakestCategory);
    const targetDifficulty = difficulty > 0.7 ? 'hard' : difficulty > 0.4 ? 'medium' : 'easy';

    const scored = candidates.map(q => ({
      question: q,
      score: this._scoreQuestion(q, targetDifficulty)
    }));
    
    scored.sort((a, b) => b.score - a.score);
    return scored[0]?.question || this._getRandomQuestion(usedQuestionIds);
  }

  recommendStudyPath(studentId, performanceAnalytics, count = 5) {
    const summary = performanceAnalytics.getPerformanceSummary(studentId);
    const usedIds = [];
    const path = [];

    for (let i = 0; i < count; i++) {
      const question = this.recommendNextQuestion(studentId, performanceAnalytics, usedIds);
      if (question) {
        path.push(question);
        usedIds.push(question.id);
      }
    }

    return {
      studentId,
      path,
      focusAreas: summary?.weakAreas.map((w) => w.category) || []
    };
  }

  _scoreQuestion(question, targetDifficulty) {
    let score = 0;
    if (question.difficulty === targetDifficulty) {
      score += 10;
    } else if (
      (targetDifficulty === 'medium' && (question.difficulty === 'easy' || question.difficulty === 'hard')) ||
      (targetDifficulty === 'easy' && question.difficulty === 'medium') ||
      (targetDifficulty === 'hard' && question.difficulty === 'medium')
    ) {
      score += 5;
    }
    score += Math.random() * 3;
    return score;
  }

  _getRandomQuestion(usedIds) {
    const available = this.allQuestions.filter((q) => !usedIds.includes(q.id));
    if (available.length === 0) return this.allQuestions[0] || null;
    return available[Math.floor(Math.random() * available.length)];
  }
}

/**
 * Adaptive Difficulty Engine
 * Adjusts question difficulty based on student performance in real-time
 * Implements dynamic difficulty adjustment (DDA)
 */
class AdaptiveDifficultyEngine {
  constructor() {
    this.studentDifficulties = new Map();
    this.difficultyLevels = {
      easy: 1,
      medium: 2,
      hard: 3,
    };
  }

  initializeStudent(studentId, startingDifficulty = 2) {
    this.studentDifficulties.set(studentId, {
      currentDifficulty: Math.max(1, Math.min(3, startingDifficulty)),
      recentPerformance: [],
      adjustmentHistory: [],
    });
  }

  recordPerformanceAndAdjust(studentId, correct, timeSpent) {
    const difficulty = this.studentDifficulties.get(studentId);
    if (!difficulty) {
      this.initializeStudent(studentId);
      return this.recordPerformanceAndAdjust(studentId, correct, timeSpent);
    }

    // Record performance
    difficulty.recentPerformance.push({
      correct,
      timeSpent,
      timestamp: Date.now(),
    });

    // Keep only last 10 performances
    if (difficulty.recentPerformance.length > 10) {
      difficulty.recentPerformance.shift();
    }

    // Check if adjustment needed
    const adjustment = this._calculateAdjustment(difficulty);

    if (adjustment.adjust) {
      const oldDifficulty = difficulty.currentDifficulty;
      difficulty.currentDifficulty = adjustment.newDifficulty;
      difficulty.adjustmentHistory.push({
        timestamp: Date.now(),
        from: oldDifficulty,
        to: adjustment.newDifficulty,
        reason: adjustment.reason,
      });
    }

    return {
      adjusted: adjustment.adjust,
      newDifficulty: difficulty.currentDifficulty,
      reason: adjustment.reason,
    };
  }

  getRecommendedDifficulty(studentId) {
    const difficulty = this.studentDifficulties.get(studentId);
    if (!difficulty) {
      return 2; // Medium difficulty
    }
    return difficulty.currentDifficulty;
  }

  getDifficultyName(level) {
    const names = { 1: 'Easy', 2: 'Medium', 3: 'Hard' };
    return names[level] || 'Medium';
  }

  _calculateAdjustment(difficultyRecord) {
    const { recentPerformance, currentDifficulty } = difficultyRecord;

    if (recentPerformance.length < 3) {
      return { adjust: false, reason: 'Not enough data' };
    }

    // Calculate recent accuracy
    const recentCorrect = recentPerformance.filter((p) => p.correct).length;
    const accuracy = recentCorrect / recentPerformance.length;

    // Calculate average time performance
    const avgTime =
      recentPerformance.reduce((sum, p) => sum + p.timeSpent, 0) /
      recentPerformance.length;
    const timeEfficiency = avgTime < 7; // Fast is < 7 seconds

    // Adjustment logic
    if (accuracy >= 0.8 && timeEfficiency) {
      // Too easy - increase difficulty
      if (currentDifficulty < 3) {
        return {
          adjust: true,
          newDifficulty: currentDifficulty + 1,
          reason: 'High accuracy and fast responses - increasing difficulty',
        };
      }
    } else if (accuracy <= 0.5) {
      // Too hard - decrease difficulty
      if (currentDifficulty > 1) {
        return {
          adjust: true,
          newDifficulty: currentDifficulty - 1,
          reason: 'Low accuracy - decreasing difficulty',
        };
      }
    }

    return { adjust: false, reason: 'Difficulty appropriate' };
  }

  getDifficultyProgression(studentId) {
    const difficulty = this.studentDifficulties.get(studentId);
    if (!difficulty) {
      return [];
    }

    return difficulty.adjustmentHistory.map((adj) => ({
      ...adj,
      fromName: this.getDifficultyName(adj.from),
      toName: this.getDifficultyName(adj.to),
    }));
  }

  getStatistics() {
    const stats = {
      totalStudents: this.studentDifficulties.size,
      byDifficulty: { 1: 0, 2: 0, 3: 0 },
      adjustments: [],
    };

    this.studentDifficulties.forEach((difficulty, studentId) => {
      stats.byDifficulty[difficulty.currentDifficulty]++;
      difficulty.adjustmentHistory.forEach((adj) => {
        stats.adjustments.push({ ...adj, studentId });
      });
    });

    return stats;
  }
}

module.exports = { RecommendationEngine, AdaptiveDifficultyEngine };
