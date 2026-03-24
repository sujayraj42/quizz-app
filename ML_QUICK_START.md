/**
 * QUICK START - ML Backend Integration
 * Copy-paste this into your server/index.js to enable ML routes
 */

// ============= STEP 1: ADD TO IMPORTS =============

// At the top of server/index.js, add:
// const mlRouter = require('./ml/mlRouter');

// ============= STEP 2: ADD ML ROUTES =============

// After app.use(express.static(...)), add:
// app.use('/api/ml', mlRouter);

// ============= STEP 3: EXAMPLE UPDATED server/index.js =============

/*

const path = require("node:path");
const http = require("node:http");
const express = require("express");
const { Server } = require("socket.io");
const { registerSocketHandlers } = require("./socket");
const mlRouter = require("./ml/mlRouter");  // ← ADD THIS

const app = express();
const server = http.createServer(app);
const io = new Server(server);
const PORT = process.env.PORT || 3000;

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "..", "views"));
app.use(express.static(path.join(__dirname, "..", "public")));

// ← ADD THIS: ML Routes
app.use("/api/ml", mlRouter);

app.get("/", (request, response) => {
  response.render("index", {
    pageTitle: "Study-Buddy | Real-Time Quiz Room",
  });
});

app.get("/host", (request, response) => {
  response.render("host", {
    pageTitle: "Study-Buddy Host Console",
  });
});

app.get("/player", (request, response) => {
  response.render("player", {
    pageTitle: "Study-Buddy Player Console",
    roomCode: String(request.query.room || "").trim().toUpperCase(),
    playerName: String(request.query.name || "").trim(),
  });
});

app.get("/display", (request, response) => {
  response.render("display", {
    pageTitle: "Study-Buddy Classroom Display",
    roomCode: String(request.query.room || "").trim().toUpperCase(),
  });
});

app.get("/health", (request, response) => {
  response.json({ ok: true });
});

registerSocketHandlers(io);

server.listen(PORT, () => {
  console.log(`Study-Buddy running on http://localhost:${PORT}`);
});

*/

// ============= AVAILABLE ENDPOINTS =============

/*

ANALYTICS:
  GET    /api/ml/analytics/student/:studentId
  GET    /api/ml/analytics/learning-curve/:studentId
  GET    /api/ml/analytics/class
  POST   /api/ml/analytics/record
  GET    /api/ml/export/analytics

DIFFICULTY:
  GET    /api/ml/difficulty/:studentId
  GET    /api/ml/difficulty/progression/:studentId
  GET    /api/ml/difficulty/statistics

RECOMMENDATIONS:
  GET    /api/ml/recommend/next-question/:studentId
  GET    /api/ml/recommend/student/:studentId
  GET    /api/ml/recommend/study-path/:studentId

INSIGHTS:
  GET    /api/ml/insights/student/:studentId
  GET    /api/ml/insights/class
  GET    /api/ml/insights/anomalies/:studentId

QUESTIONS:
  POST   /api/ml/questions/generate
  GET    /api/ml/questions/categories
  POST   /api/ml/questions/create
  POST   /api/ml/questions/validate

HEALTH:
  GET    /api/ml/health

*/

// ============= TESTING THE ENDPOINTS =============

/*

# Test in PowerShell:

# 1. Check status
curl http://localhost:3000/api/ml/health

# 2. Record a student answer
$body = @{
  studentId = "student123"
  answerData = @{
    questionId = "q1"
    correct = $true
    timeSpent = 8
    category = "science"
  }
} | ConvertTo-Json

Invoke-WebRequest -Uri "http://localhost:3000/api/ml/analytics/record" `
  -Method POST `
  -ContentType "application/json" `
  -Body $body

# 3. Get student summary
curl http://localhost:3000/api/ml/analytics/student/student123

# 4. Get difficulty
curl http://localhost:3000/api/ml/difficulty/student123

# 5. Get recommendations
curl http://localhost:3000/api/ml/recommend/student/student123

# 6. Generate questions
$qbody = @{
  category = "science"
  difficulty = "medium"
  count = 3
} | ConvertTo-Json

Invoke-WebRequest -Uri "http://localhost:3000/api/ml/questions/generate" `
  -Method POST `
  -ContentType "application/json" `
  -Body $qbody

*/

// ============= USING IN Frontend (Client-Side) =============

/*

// Example: Get student insights on dashboard
fetch('/api/ml/insights/student/student123')
  .then(res => res.json())
  .then(data => {
    console.log('Insights:', data.insights);
    console.log('Badges:', data.badges);
    
    // Update UI
    document.getElementById('accuracy').textContent = data.insights.keyMetrics.accuracy;
    document.getElementById('skillLevel').textContent = data.insights.keyMetrics.skillLevel;
    
    // Show badges
    data.badges.forEach(badge => {
      addBadgeToUI(badge);
    });
  });

// Example: Get next recommended question
fetch('/api/ml/recommend/next-question/student123')
  .then(res => res.json())
  .then(question => {
    displayQuestion(question);
  });

// Example: Record answer and get immediate feedback
async function submitAnswer(studentId, questionId, correct, timeSpent) {
  const response = await fetch('/api/ml/analytics/record', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      studentId,
      answerData: { questionId, correct, timeSpent, category: 'science' }
    })
  });
  
  const result = await response.json();
  console.log('Difficulty adjustment:', result.difficultyAdjustment);
  
  return result;
}

*/

// ============= SOCKET.IO INTEGRATION =============

/*

In server/socket.js, update the answer handler:

socket.on('answer:submitted', (data) => {
  const { roomCode, studentId, questionId, isCorrect, timeSpent } = data;
  
  // Existing logic...
  
  // ✅ ADD: Record analytics
  performanceAnalytics.recordAnswer(studentId, {
    questionId,
    correct: isCorrect,
    timeSpent,
    category: 'general'
  });
  
  // ✅ ADD: Adjust difficulty
  const adj = difficultyEngine.recordPerformanceAndAdjust(
    studentId, 
    isCorrect, 
    timeSpent
  );
  
  // ✅ ADD: Send update to student
  socket.emit('analytics:updated', {
    accuracy: performanceAnalytics.getPerformanceSummary(studentId).accuracy,
    difficulty: adj.newDifficulty
  });
  
  // Existing emission logic...
});

*/

// ============= IMPORTANT NOTES =============

/*
✅ ML Features Included:
   • Performance analytics and tracking
   • Adaptive difficulty adjustment (1-3 scale)
   • Smart question recommendations
   • Insight generation with badges
   • Anomaly detection (cheating detection)
   • Question generation engine

✅ Data Processing:
   • Real-time performance tracking
   • Learning curve analysis
   • Class-wide statistics
   • Percentile ranking
   • Trend detection

✅ No Database Required:
   • All data stored in memory
   • Perfect for development and demos
   • Add database when ready for production

✅ Extensible:
   • Easy to add new metrics
   • Plugs into Socket.io easily
   • Works with any question format
   • Modular architecture

⚠️  Production Considerations:
   • Add database (MongoDB, PostgreSQL)
   • Add data persistence
   • Add HTTP authentication
   • Rate limiting on endpoints
   • Data backup and archiving
   • Performance monitoring

*/

module.exports = {};
