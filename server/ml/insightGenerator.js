/**
 * Insight Generator
 * Generates actionable insights from quiz data
 * Uses pattern recognition and statistical analysis
 */

class InsightGenerator {
  /**
   * Generate overall class insights
   * @param {array} allStudentSummaries - All student performance summaries
   * @returns {object} Class insights
   */
  static generateClassInsights(allStudentSummaries) {
    if (allStudentSummaries.length === 0) {
      return {};
    }

    const accuracies = allStudentSummaries
      .map((s) => parseFloat(s.accuracy))
      .filter((a) => !isNaN(a));

    const classAverage =
      accuracies.reduce((a, b) => a + b, 0) / accuracies.length;

    const insights = {
      classSize: allStudentSummaries.length,
      classAverage: classAverage.toFixed(2),
      highestAccuracy: Math.max(...accuracies).toFixed(2),
      lowestAccuracy: Math.min(...accuracies).toFixed(2),
      stdDeviation: this._calculateStdDeviation(accuracies).toFixed(2),
      topPerformers: allStudentSummaries
        .sort((a, b) => parseFloat(b.accuracy) - parseFloat(a.accuracy))
        .slice(0, 3),
      needsSupport: allStudentSummaries
        .filter((s) => parseFloat(s.accuracy) < 50)
        .map((s) => s.studentId),
      categoryAnalysis: this._analyzeCategoryPerformance(allStudentSummaries),
      recommendations: this._classRecommendations(allStudentSummaries),
    };

    return insights;
  }

  /**
   * Generate individual student insights
   * @param {object} studentSummary - Student performance summary
   * @param {array} performanceHistory - Array of answered questions
   * @returns {object} Detailed insights
   */
  static generateStudentInsights(studentSummary, performanceHistory = []) {
    const insights = {
      studentId: studentSummary.studentId,
      overallStatus: this._classifyStatus(parseFloat(studentSummary.accuracy)),
      keyMetrics: {
        accuracy: studentSummary.accuracy,
        skillLevel: studentSummary.skillLevel,
        totalQuestions: studentSummary.totalAnswers,
        recentTrend: studentSummary.trend,
      },
      strengths: this._identifyStrengths(studentSummary),
      weaknesses: this._identifyWeaknesses(studentSummary),
      learningPattern: this._analyzeLearningPattern(performanceHistory),
      focusAreas: studentSummary.weakAreas,
      nextSteps: this._generateNextSteps(studentSummary),
    };

    return insights;
  }

  /**
   * Detect learning anomalies (cheating, guessing patterns)
   * @param {array} performanceHistory
   * @returns {object} Anomaly detection results
   */
  static detectAnomalies(performanceHistory) {
    const anomalies = [];

    // Perfect accuracy (99%+)
    if (performanceHistory.length > 10) {
      const correct = performanceHistory.filter((p) => p.correct).length;
      const accuracy = correct / performanceHistory.length;
      if (accuracy > 0.98) {
        anomalies.push({
          type: 'perfect_accuracy',
          severity: 'medium',
          description:
            'Unusually perfect accuracy - may indicate guessing or outside help',
        });
      }
    }

    // Very consistent timing (possible patterns)
    if (performanceHistory.length > 5) {
      const times = performanceHistory.map((p) => p.timeSpent).filter((t) => t);
      if (times.length > 3) {
        const variance = this._calculateVariance(times);
        if (variance < 0.5) {
          anomalies.push({
            type: 'consistent_timing',
            severity: 'low',
            description:
              'Answers submitted with suspiciously consistent timing',
          });
        }
      }
    }

    // Random answers (very low accuracy)
    if (performanceHistory.length > 5) {
      const correct = performanceHistory.filter((p) => p.correct).length;
      const accuracy = correct / performanceHistory.length;
      if (accuracy < 0.25) {
        anomalies.push({
          type: 'random_answers',
          severity: 'low',
          description: 'Very low accuracy - may indicate random guessing',
        });
      }
    }

    return { anomalies, count: anomalies.length };
  }

  /**
   * Generate badges/achievements
   * @param {object} studentSummary
   * @returns {array} Earned badges
   */
  static generateBadges(studentSummary) {
    const badges = [];

    // Accuracy badges
    if (parseFloat(studentSummary.accuracy) >= 90) {
      badges.push({
        id: 'accuracy_master',
        name: '🏆 Accuracy Master',
        description: 'Achieved 90%+ accuracy',
      });
    } else if (parseFloat(studentSummary.accuracy) >= 80) {
      badges.push({
        id: 'accuracy_expert',
        name: '⭐ Accuracy Expert',
        description: 'Achieved 80%+ accuracy',
      });
    }

    // Volume badges
    if (studentSummary.totalAnswers >= 100) {
      badges.push({
        id: 'centurion',
        name: '💯 Centurion',
        description: 'Answered 100+ questions',
      });
    } else if (studentSummary.totalAnswers >= 50) {
      badges.push({
        id: 'half_century',
        name: '📈 Half Century',
        description: 'Answered 50+ questions',
      });
    }

    // Improvement badges
    if (studentSummary.trend > 5) {
      badges.push({
        id: 'rising_star',
        name: '⬆️ Rising Star',
        description: 'Showing significant improvement',
      });
    }

    // Consistency badges
    if (parseFloat(studentSummary.accuracy) >= 70 && studentSummary.totalAnswers >= 20) {
      badges.push({
        id: 'consistent',
        name: '✅ Consistent Performer',
        description: 'High accuracy over many questions',
      });
    }

    return badges;
  }

  // Private helper methods

  static _calculateStdDeviation(numbers) {
    const mean = numbers.reduce((a, b) => a + b) / numbers.length;
    const variance = numbers.reduce(
      (sum, num) => sum + Math.pow(num - mean, 2),
      0
    ) / numbers.length;
    return Math.sqrt(variance);
  }

  static _calculateVariance(numbers) {
    if (numbers.length === 0) return 0;
    const mean = numbers.reduce((a, b) => a + b) / numbers.length;
    const squareDiffs = numbers.map((num) => Math.pow(num - mean, 2));
    return squareDiffs.reduce((a, b) => a + b) / numbers.length;
  }

  static _classifyStatus(accuracy) {
    if (accuracy >= 85) return 'Excellent';
    if (accuracy >= 70) return 'Good';
    if (accuracy >= 60) return 'Satisfactory';
    if (accuracy >= 50) return 'Needs Improvement';
    return 'Critical';
  }

  static _identifyStrengths(summary) {
    const strengths = [];
    if (summary.categoryStats) {
      Object.entries(summary.categoryStats).forEach(([category, stats]) => {
        const accuracy = (stats.correct / stats.total) * 100;
        if (accuracy >= 75) {
          strengths.push({
            category,
            accuracy: accuracy.toFixed(1),
            description: `Strong performance in ${category}`,
          });
        }
      });
    }
    return strengths.sort((a, b) => parseFloat(b.accuracy) - parseFloat(a.accuracy));
  }

  static _identifyWeaknesses(summary) {
    return summary.weakAreas.map((area) => ({
      ...area,
      description: `Needs practice in ${area.category}`,
    }));
  }

  static _analyzeLearningPattern(performanceHistory) {
    if (performanceHistory.length < 5) {
      return 'Insufficient data';
    }

    const recent = performanceHistory.slice(-10);
    const recentCorrect = recent.filter((p) => p.correct).length;
    const overall = performanceHistory;
    const overallCorrect = overall.filter((p) => p.correct).length;

    const recentAccuracy = recentCorrect / recent.length;
    const overallAccuracy = overallCorrect / overall.length;

    if (recentAccuracy > overallAccuracy + 0.1) {
      return 'Improving rapidly';
    } else if (recentAccuracy < overallAccuracy - 0.1) {
      return 'Declining performance';
    }
    return 'Consistent performance';
  }

  static _analyzeCategoryPerformance(allStudentSummaries) {
    const categoryStats = {};

    allStudentSummaries.forEach((summary) => {
      if (summary.categoryStats) {
        Object.entries(summary.categoryStats).forEach(([category, stats]) => {
          if (!categoryStats[category]) {
            categoryStats[category] = {
              totalCorrect: 0,
              totalAnswers: 0,
              students: 0,
            };
          }
          categoryStats[category].totalCorrect += stats.correct;
          categoryStats[category].totalAnswers += stats.total;
          categoryStats[category].students++;
        });
      }
    });

    const analysis = {};
    Object.entries(categoryStats).forEach(([category, stats]) => {
      const accuracy = (stats.totalCorrect / stats.totalAnswers) * 100;
      analysis[category] = {
        classAccuracy: accuracy.toFixed(1),
        totalAttempts: stats.totalAnswers,
        students: stats.students,
        difficulty: accuracy < 50 ? 'Hard' : accuracy < 75 ? 'Medium' : 'Easy',
      };
    });

    return analysis;
  }

  static _generateNextSteps(summary) {
    const steps = [];

    if (parseFloat(summary.accuracy) < 50) {
      steps.push('Review fundamental concepts in weak areas');
      steps.push('Practice easier questions first');
    } else if (parseFloat(summary.accuracy) < 70) {
      steps.push('Focus on weak areas identified');
      steps.push('Practice intermediate difficulty questions');
    } else {
      steps.push('Challenge yourself with harder questions');
      steps.push('Help peers understand weak concepts');
    }

    if (summary.weakAreas.length > 0) {
      steps.push(`Dedicate time to ${summary.weakAreas[0].category}`);
    }

    return steps;
  }

  static _classRecommendations(allStudentSummaries) {
    const recommendations = [];
    const lowAccuracy = allStudentSummaries.filter(
      (s) => parseFloat(s.accuracy) < 50
    );
    const highAccuracy = allStudentSummaries.filter(
      (s) => parseFloat(s.accuracy) >= 85
    );

    if (lowAccuracy.length > allStudentSummaries.length * 0.3) {
      recommendations.push(
        'Many students are struggling. Consider reviewing core concepts.'
      );
    }

    if (highAccuracy.length > allStudentSummaries.length * 0.5) {
      recommendations.push(
        'High overall performance. Consider increasing difficulty.'
      );
    }

    return recommendations;
  }
}

module.exports = { InsightGenerator };
