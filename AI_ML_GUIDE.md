# AI/ML Features Guide

Complete documentation for the AI/ML capabilities in Study-Buddy Quiz Room.

## 📊 Table of Contents

1. [Overview](#overview)
2. [Core Components](#core-components)
3. [API Reference](#api-reference)
4. [Integration Guide](#integration-guide)
5. [Usage Examples](#usage-examples)
6. [ML Algorithms](#ml-algorithms)
7. [Performance Tips](#performance-tips)

---

## 🎯 Overview

The Study-Buddy Quiz Room now includes advanced AI/ML capabilities:

- **Performance Analytics** - Track and analyze student learning patterns
- **Adaptive Difficulty** - Automatically adjust quiz difficulty based on performance
- **Smart Recommendations** - Suggest questions based on weak areas
- **Insight Generation** - Generate actionable insights and alerts
- **Dynamic Question Generation** - Create questions on-demand
- **Anomaly Detection** - Identify unusual behavior patterns

### Key Benefits

✅ Personalized learning paths for each student
✅ Real-time performance tracking and predictions
✅ Automatic difficulty calibration
✅ Early identification of struggling students
✅ Data-driven instruction recommendations
✅ Fraud/cheating detection

---

## 🔧 Core Components

### 1. Performance Analytics (`server/ml/analytics.js`)

Tracks individual student performance and calculates metrics.

**Key Functions:**
- `recordAnswer()` - Log student answers
- `getPerformanceSummary()` - Get detailed performance stats
- `predictCorrectProbability()` - Predict answer success
- `getLearningCurve()` - Track improvement over time
- `compareToClassAverage()` - Benchmark against class

**Example:**
```javascript
const { PerformanceAnalytics } = require('./ml/analytics');
const analytics = new PerformanceAnalytics();

// Record an answer
analytics.recordAnswer('student123', {
  questionId: 'q1',
  correct: true,
  timeSpent: 8,
  category: 'science',
  difficulty: 2
});

// Get summary
const summary = analytics.getPerformanceSummary('student123');
console.log(summary);
// {
//   accuracy: "85.50",
//   skillLevel: "Advanced",
//   weakAreas: [...],
//   ...
// }
```

---

### 2. Adaptive Difficulty (`server/ml/recommendations.js`)

Automatically adjusts question difficulty in real-time.

**Key Functions:**
- `initializeStudent()` - Set starting difficulty
- `recordPerformanceAndAdjust()` - Update and auto-adjust
- `getRecommendedDifficulty()` - Get current level (1-3)
- `getDifficultyProgression()` - View adjustment history

**Difficulty Levels:**
- 1 = Easy (For beginner/struggling students)
- 2 = Medium (Default, balanced)
- 3 = Hard (For advanced students)

**Adjustment Logic:**
- High accuracy (80%+) + fast answers → Increase difficulty
- Low accuracy (50%-) → Decrease difficulty
- Accuracy 50-80% → Maintain difficulty

**Example:**
```javascript
const { AdaptiveDifficultyEngine } = require('./ml/recommendations');
const difficulty = new AdaptiveDifficultyEngine();

difficulty.initializeStudent('student123', 2); // Start at medium

// After answering
const adjustment = difficulty.recordPerformanceAndAdjust(
  'student123',
  true,  // correct
  7      // seconds taken
);
// {
//   adjusted: true,
//   newDifficulty: 3,
//   reason: "High accuracy and fast responses - increasing difficulty"
// }
```

---

### 3. Recommendation Engine (`server/ml/recommendations.js`)

Recommends personalized learning paths based on weak areas.

**Key Functions:**
- `recommendNextQuestion()` - Get next question to ask
- `getStudentRecommendations()` - Get study advice
- `recommendStudyPath()` - Get ordered question sequence

**Algorithm:**
1. Identify student's weakest category
2. Filter questions in that category
3. Match difficulty to student's level
4. Return most suitable question

**Example:**
```javascript
const { RecommendationEngine } = require('./ml/recommendations');
const recommender = new RecommendationEngine(allQuestions);

// Get next recommended question
const question = recommender.recommendNextQuestion(
  'student123',
  performanceAnalytics,
  usedQuestionIds
);

// Get study advice
const advice = recommender.getStudentRecommendations(
  'student123',
  performanceAnalytics
);
// {
//   recommendations: [
//     { type: 'weak_area', message: 'Focus on science...' },
//     { type: 'positive_trend', message: 'Great! You\'re improving...' }
//   ]
// }
```

---

### 4. Insight Generator (`server/ml/insightGenerator.js`)

Generates actionable insights, badges, and alerts.

**Key Functions:**
- `generateClassInsights()` - Class-wide analytics
- `generateStudentInsights()` - Individual insights
- `detectAnomalies()` - Find unusual patterns
- `generateBadges()` - Create achievement badges

**Insights Provided:**
- Performance status (Excellent, Good, Satisfactory, etc.)
- Strengths and weaknesses
- Learning patterns
- Personalized next steps
- Class-wide recommendations

**Anomaly Detection:**
- Perfect accuracy (99%+) → Possible cheating
- Consistent timing → Pattern indicator
- Very low accuracy → Random guessing

**Example:**
```javascript
const { InsightGenerator } = require('./ml/insightGenerator');

// Generate student insights
const insights = InsightGenerator.generateStudentInsights(summary);
// {
//   overallStatus: 'Good',
//   strengths: [{ category: 'math', accuracy: '95' }],
//   weaknesses: [{ category: 'history', accuracy: '42' }],
//   nextSteps: ['Focus on history...', ...]
// }

// Detect anomalies
const anomalies = InsightGenerator.detectAnomalies(performanceHistory);
// { anomalies: [...], count: 1 }

// Generate badges
const badges = InsightGenerator.generateBadges(summary);
// [
//   { id: 'accuracy_master', name: '🏆 Accuracy Master' },
//   { id: 'rising_star', name: '⬆️ Rising Star' }
// ]
```

---

### 5. Question Generator (`server/ml/questionGenerator.js`)

Dynamically generate quiz questions.

**Key Functions:**
- `generateQuestions()` - Create multiple questions
- `createCustomQuestion()` - Add custom question
- `validateQuestion()` - Check format
- `getAvailableCategories()` - List categories

**Example:**
```javascript
const { QuestionGenerator } = require('./ml/questionGenerator');
const generator = new QuestionGenerator();

// Generate 5 hard science questions
const questions = generator.generateQuestions({
  category: 'science',
  difficulty: 'hard',
  count: 5
});

// Create custom question
const custom = generator.createCustomQuestion({
  prompt: 'What is HTML?',
  choices: [
    'HyperText Markup Language',
    'Home Tool Markup Language',
    'High Transfer Machine Language',
    'Hyperlink Text Management Language'
  ],
  answerIndex: 0,
  category: 'programming',
  difficulty: 'medium'
});

// Validate
const validation = generator.validateQuestion(custom);
console.log(validation);
// { valid: true, errors: [] }
```

---

## 📡 API Reference

### Analytics Endpoints

```
GET  /api/ml/analytics/student/:studentId
  Get student performance summary

GET  /api/ml/analytics/learning-curve/:studentId?interval=5
  Get learning curve (improvement over time)

GET  /api/ml/analytics/class
  Get all student data

POST /api/ml/analytics/record
  Record a student's answer
  Body: { studentId, answerData }

GET  /api/ml/analytics/export
  Export all analytics data
```

### Difficulty Endpoints

```
GET  /api/ml/difficulty/:studentId
  Get current difficulty level (1-3)

GET  /api/ml/difficulty/progression/:studentId
  Get difficulty adjustment history

GET  /api/ml/difficulty/statistics
  Get difficulty stats for all students
```

### Recommendation Endpoints

```
GET  /api/ml/recommend/next-question/:studentId
  Get personalized next question

GET  /api/ml/recommend/student/:studentId
  Get study recommendations

GET  /api/ml/recommend/study-path/:studentId?count=5
  Get ordered list of recommended questions
```

### Insights Endpoints

```
GET  /api/ml/insights/student/:studentId
  Get insights and badges for student

GET  /api/ml/insights/class
  Get class-wide insights

GET  /api/ml/insights/anomalies/:studentId
  Detect unusual behaviors
```

### Question Generation Endpoints

```
POST /api/ml/questions/generate
  Generate questions
  Body: { category, difficulty, count, topic }

GET  /api/ml/questions/categories
  List available categories

POST /api/ml/questions/create
  Create custom question
  Body: { prompt, choices, answerIndex, ... }

POST /api/ml/questions/validate
  Validate question format
```

---

## 🔌 Integration Guide

### Step 1: Import ML Router into Main Server

In `server/index.js`:

```javascript
const mlRouter = require('./ml/mlRouter');

// ... other setup ...

// Add ML routes
app.use('/api/ml', mlRouter);
```

### Step 2: Record Student Answers

In your Socket.io handler:

```javascript
const analyticsRouter = require('./ml/mlRouter');

socket.on('answer:submitted', (data) => {
  // Your existing answer logic...

  // Record for ML analytics
  performanceAnalytics.recordAnswer(data.studentId, {
    questionId: data.questionId,
    correct: isCorrect,
    timeSpent: data.timeSpent,
    category: question.category,
    difficulty: currentDifficulty
  });
});
```

### Step 3: Use Recommendations

Get next question with ML:

```javascript
socket.on('next-question:request', (data) => {
  const nextQuestion = recommendationEngine.recommendNextQuestion(
    data.studentId,
    performanceAnalytics,
    usedQuestionIds
  );

  socket.emit('question:next', nextQuestion);
});
```

### Step 4: Send Insights to Client

```javascript
socket.on('insights:request', (data) => {
  const insights = InsightGenerator.generateStudentInsights(
    performanceAnalytics.getPerformanceSummary(data.studentId)
  );

  socket.emit('insights:data', insights);
});
```

---

## 💡 Usage Examples

### Example 1: Complete Student Session

```javascript
// Initialize
analytics.recordAnswer('alice', {
  questionId: 'q1',
  correct: true,
  timeSpent: 5,
  category: 'math',
  difficulty: 2
});

difficulty.recordPerformanceAndAdjust('alice', true, 5);

// After several answers...
const summary = analytics.getPerformanceSummary('alice');
// {
//   accuracy: 85,
//   skillLevel: 'Advanced',
//   recentAccuracy: 90,
//   trend: +5
// }

const nextDifficulty = difficulty.getRecommendedDifficulty('alice');
// 3 (Hard)

const recommendations = recomender.getStudentRecommendations('alice', analytics);
// Suggests practicing weak areas

const insights = InsightGenerator.generateStudentInsights(summary);
// {
//   overallStatus: 'Excellent',
//   strengths: [math, science],
//   nextSteps: ['Take harder questions', ...]
// }
```

### Example 2: Class Overview

```javascript
const profiles = analytics.getAllProfiles();
const insights = InsightGenerator.generateClassInsights(
  profiles.map(p => p.summary)
);

console.log(insights);
// {
//   classAverage: 72.5,
//   topPerformers: [...],
//   needsSupport: ['bob', 'charlie'],
//   categoryAnalysis: {...},
//   recommendations: [...]
// }
```

### Example 3: Anomaly Detection

```javascript
const profile = analytics.studentProfiles.get('suspicious-student');
const anomalies = InsightGenerator.detectAnomalies(profile.answers);

if (anomalies.count > 0) {
  console.warn('Potential cheating detected:', anomalies);
  // Take action: review, flag, or disable student
}
```

---

## 🧠 ML Algorithms

### Accuracy Calculation

```
Accuracy = (Correct Answers / Total Answers) × 100
```

### Skill Level Classification

```
90%+ → Expert
70-89% → Advanced
60-69% → Intermediate
50-59% → Beginner
<50% → Novice
```

### Difficulty Adjustment

```
IF accuracy >= 80% AND timeSpent < 7s THEN difficulty++
IF accuracy <= 50% THEN difficulty--
ELSE maintain difficulty
```

### Probability Prediction

```
P(correct) = Category_Accuracy
If no history: P(correct) = 0.5 (50%)
```

### Performance Comparison

```
Percentile = (Below_Score_Count / Total_Students) × 100
Rank = Below_Score_Count + 1
```

---

## ⚡ Performance Tips

### 1. Optimize Data Storage

Keep only recent data (last 100 answers per student):

```javascript
if (profile.answers.length > 100) {
  profile.answers.shift();
}
```

### 2. Cache Results

Cache frequently accessed summaries:

```javascript
const cache = new Map();
cache.set(`summary_${studentId}`, summary, 5000); // 5sec TTL
```

### 3. Batch Processing

Process analytics in batches instead of real-time:

```javascript
const batch = [];
socket.on('answer:submitted', (data) => {
  batch.push(data);
  if (batch.length >= 10) {
    processBatch(batch);
    batch = [];
  }
});
```

### 4. Archive Old Data

Move old data to archive or database:

```javascript
const oldData = analytics.exportData();
database.archive(oldData); // Save to DB
```

---

## 🔒 Security Considerations

### 1. Input Validation

```javascript
if (!studentId || !answerData) {
  throw new Error('Invalid input');
}
```

### 2. Rate Limiting

```javascript
const rateLimiter = (studentId) => {
  const lastSubmit = submissionTimes.get(studentId);
  if (Date.now() - lastSubmit < 500) {
    throw new Error('Too fast, possible cheating');
  }
};
```

### 3. Anomaly Alerts

```javascript
if (anomalies.count > 0) {
  logger.warn(`Anomaly detected for ${studentId}`);
  // Don't reveal detection to student
}
```

---

## 📈 Monitoring & Logging

### Log Key Events

```javascript
console.log(`[ML] Answer recorded: ${studentId}, accuracy: ${accuracy}%`);
console.log(`[ML] Difficulty adjusted: ${studentId} → ${newDifficulty}`);
console.log(`[ML] Insight generated: ${studentId}, status: ${status}`);
```

### Health Endpoint

```bash
# Check ML engine status
curl http://localhost:3000/api/ml/health
# { "status": "ok", "engines": {...} }
```

---

## 🎓 Educational Value

### What Students Benefit From

- Personalized learning paths
- Real-time performance feedback
- Adaptive challenge level
- Clear improvement tracking
- Achievement recognition (badges)

### What Teachers Benefit From

- Class-wide performance analytics
- Individual student insights
- Early warning for struggling students
- Data-driven instruction
- Anomaly detection for integrity

---

## 🔄 Future Enhancements

Potential additions to the ML system:

- **Collaborative Filtering** - Recommend questions based on similar students
- **Natural Language Processing** - AI question generation
- **Neural Networks** - Deep learning for better predictions
- **Time Series Analysis** - Predict long-term success
- **A/B Testing** - Optimize recommendation algorithms
- **Database Integration** - Persist all data long-term
- **Real-time Dashboard** - Visualize ML insights
- **Mobile Optimization** - ML-powered mobile experience

---

## 📚 References

- [Machine Learning Basics](https://developers.google.com/machine-learning)
- [Educational Data Mining](https://en.wikipedia.org/wiki/Educational_data_mining)
- [Adaptive Learning Systems](https://en.wikipedia.org/wiki/Adaptive_learning)
- [Recommendation Algorithms](https://en.wikipedia.org/wiki/Collaborative_filtering)

---

**Ready to use AI/ML in your quiz room! 🚀**
