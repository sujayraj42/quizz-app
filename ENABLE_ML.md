/**
 * 🚀 HOW TO ENABLE ML BACKEND - STEP BY STEP
 * Complete integration guide with exact code changes
 */

// ============================================================
// FILE: server/index.js
// CHANGES: Add ML Router
// ============================================================

/*

BEFORE (Current code):

```javascript
const path = require("node:path");
const http = require("node:http");
const express = require("express");
const { Server } = require("socket.io");
const { registerSocketHandlers } = require("./socket");

const app = express();
const server = http.createServer(app);
const io = new Server(server);
const PORT = process.env.PORT || 3000;

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "..", "views"));
app.use(express.static(path.join(__dirname, "..", "public")));

// ... routes ...

registerSocketHandlers(io);

server.listen(PORT, () => {
  console.log(`Study-Buddy running on http://localhost:${PORT}`);
});
```

AFTER (Updated code with ML):

```javascript
const path = require("node:path");
const http = require("node:http");
const express = require("express");
const { Server } = require("socket.io");
const { registerSocketHandlers } = require("./socket");
const mlRouter = require("./ml/mlRouter");  // ← ADD THIS LINE

const app = express();
const server = http.createServer(app);
const io = new Server(server);
const PORT = process.env.PORT || 3000;

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "..", "views"));
app.use(express.static(path.join(__dirname, "..", "public")));

// ← ADD THIS: ML API routes
app.use("/api/ml", mlRouter);

// ... rest of routes ...

registerSocketHandlers(io);

server.listen(PORT, () => {
  console.log(`Study-Buddy running on http://localhost:${PORT}`);
  console.log(`📊 ML API available at http://localhost:${PORT}/api/ml`);  // ← ADD THIS
});
```

*/

// ============================================================
// FILE: server/socket.js
// CHANGES: Add analytics recording
// ============================================================

/*

INTEGRATION POINTS:

1. In the answer submission handler, add:

const { performanceAnalytics, difficultyEngine } = require('./ml/mlRouter');

socket.on('answer:submitted', (data) => {
  const { roomCode, studentId, questionId, isCorrect, timeSpent } = data;
  
  // Your existing validation and logic...
  
  // ← ADD THESE LINES:
  // Record for ML analytics
  performanceAnalytics.recordAnswer(studentId, {
    questionId,
    correct: isCorrect,
    timeSpent: timeSpent || 5,
    category: 'general'  // Update based on question
  });
  
  // Adjust difficulty based on performance
  const difficultyAdjustment = difficultyEngine.recordPerformanceAndAdjust(
    studentId,
    isCorrect,
    timeSpent
  );
  
  // Continue with existing logic...
});

2. When sending next question:

socket.on('next-question:request', (data) => {
  const { studentId } = data;
  
  // Get ML-recommended difficulty
  const difficulty = difficultyEngine.getRecommendedDifficulty(studentId);
  
  // Get next question (your existing logic)
  // But now consider the difficulty level
  
  io.to(roomCode).emit('question:next', {
    ...questionData,
    difficulty,  // Include for frontend
  });
});

3. When player requests insights:

socket.on('insights:request', (data) => {
  const { studentId } = data;
  
  const summary = performanceAnalytics.getPerformanceSummary(studentId);
  
  socket.emit('insights:data', {
    summary,
    difficulty: difficultyEngine.getRecommendedDifficulty(studentId)
  });
});

*/

// ============================================================
// FILE: public/js/player.js (or your frontend code)
// CHANGES: Display analytics
// ============================================================

/*

Add to player dashboard:

// Fetch and display student insights
async function displayInsights() {
  try {
    const response = await fetch(`/api/ml/insights/student/${studentId}`);
    const data = await response.json();
    
    // Display in UI
    document.getElementById('accuracy').textContent = 
      data.insights.keyMetrics.accuracy + '%';
    
    document.getElementById('skillLevel').textContent = 
      data.insights.keyMetrics.skillLevel;
    
    // Show badges
    data.badges.forEach(badge => {
      const badgeElement = createBadgeElement(badge);
      document.getElementById('badges-container').appendChild(badgeElement);
    });
    
    // Show recommendations
    data.insights.nextSteps.forEach(step => {
      const stepElement = createStepElement(step);
      document.getElementById('recommendations').appendChild(stepElement);
    });
    
  } catch (error) {
    console.error('Error fetching insights:', error);
  }
}

// Call when dashboard loads
displayInsights();

// Or get learning curve
async function displayLearningCurve() {
  const response = await fetch(`/api/ml/analytics/learning-curve/${studentId}`);
  const data = await response.json();
  
  // Plot data.curve as chart
  plotChart(data.curve);
}

*/

// ============================================================
// QUICK VERIFICATION - Test that ML is working
// ============================================================

/*

After making changes, start server:
  npm run dev

Then test in PowerShell:

# 1. Check status
curl http://localhost:3000/api/ml/health

Expected response:
{
  "status": "ok",
  "engines": {
    "analytics": "active",
    "difficulty": "active",
    "recommendations": "active",
    "insights": "active",
    "questionGeneration": "active"
  }
}

# 2. Record a test answer
$body = @{
  studentId = "test-student"
  answerData = @{
    questionId = "q1"
    correct = $true
    timeSpent = 8
    category = "math"
  }
} | ConvertTo-Json

Invoke-WebRequest -Uri "http://localhost:3000/api/ml/analytics/record" `
  -Method POST `
  -ContentType "application/json" `
  -Body $body

Expected response:
{
  "recorded": true,
  "difficultyAdjustment": {
    "adjusted": false,
    "newDifficulty": 2,
    "reason": "Not enough data"
  }
}

# 3. Get student summary
curl http://localhost:3000/api/ml/analytics/student/test-student

Expected response (after multiple answers):
{
  "studentId": "test-student",
  "totalAnswers": 1,
  "correctAnswers": 1,
  "accuracy": "100.00",
  "skillLevel": "Expert",
  "weakAreas": [],
  ...
}

*/

// ============================================================
// SOCKET.IO EVENT EXAMPLES
// ============================================================

/*

New Socket.io events your backend can emit:

1. analytics:updated
   socket.emit('analytics:updated', {
     summary: performanceAnalytics.getPerformanceSummary(studentId),
     difficulty: difficultyAdjustment
   });

2. insights:data
   socket.emit('insights:data', {
     insights: InsightGenerator.generateStudentInsights(summary),
     badges: InsightGenerator.generateBadges(summary)
   });

3. performance:update (to display)
   io.to('display-screen').emit('performance:update', {
     studentId,
     accuracy,
     skillLevel,
     difficulty
   });

4. recommendation:next-question
   socket.emit('recommendation:next-question', {
     question: recommendedQuestion,
     reason: 'Weak area practice'
   });

*/

// ============================================================
// COMPLETE INTEGRATION EXAMPLE
// ============================================================

/*

Here's a minimal working example:

// server/index.js
const path = require("node:path");
const http = require("node:http");
const express = require("express");
const { Server } = require("socket.io");
const { registerSocketHandlers } = require("./socket");
const mlRouter = require("./ml/mlRouter");  // ← ML

const app = express();
const server = http.createServer(app);
const io = new Server(server);
const PORT = process.env.PORT || 3000;

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "..", "views"));
app.use(express.static(path.join(__dirname, "..", "public")));

app.use("/api/ml", mlRouter);  // ← ML

app.get("/", (req, res) => {
  res.render("index", { pageTitle: "Study-Buddy" });
});

app.get("/health", (req, res) => {
  res.json({ ok: true });
});

registerSocketHandlers(io);

server.listen(PORT, () => {
  console.log(`Study-Buddy on http://localhost:${PORT}`);
  console.log(`ML API on http://localhost:${PORT}/api/ml`);
});

// ----

// server/socket.js (key addition)
const { 
  performanceAnalytics, 
  difficultyEngine 
} = require('./ml/mlRouter');

function registerSocketHandlers(io) {
  io.on('connection', (socket) => {
    
    socket.on('answer:submitted', (data) => {
      const { studentId, questionId, isCorrect, timeSpent } = data;
      
      // Record answer
      performanceAnalytics.recordAnswer(studentId, {
        questionId,
        correct: isCorrect,
        timeSpent: timeSpent || 5,
        category: 'general'
      });
      
      // Adjust difficulty
      const adj = difficultyEngine.recordPerformanceAndAdjust(
        studentId,
        isCorrect,
        timeSpent
      );
      
      // Send update to player
      socket.emit('answer:recorded', {
        accuracy: performanceAnalytics.getPerformanceSummary(studentId)?.accuracy,
        difficulty: adj.newDifficulty
      });
    });
  });
}

module.exports = { registerSocketHandlers };

*/

// ============================================================
// TROUBLESHOOTING
// ============================================================

/*

❌ "Cannot find module './ml/mlRouter'"
✅ Make sure ml/mlRouter.js file exists in server/ml/
✅ Check file path is correct

❌ "performanceAnalytics is not defined"
✅ Make sure you imported: const { performanceAnalytics } = require('./ml/mlRouter');
✅ Make sure it's imported at top of socket.js

❌ "404 on /api/ml endpoints"
✅ Make sure app.use("/api/ml", mlRouter) is added
✅ Check server was restarted with npm run dev
✅ Verify mlRouter is exported correctly

❌ "Endpoints work but no data"
✅ Make sure performanceAnalytics.recordAnswer() isn't being called
✅ Check Socket.io events are firing (console.log to verify)
✅ Check studentId is being passed correctly

*/

// ============================================================
// OPTIONAL ENHANCEMENTS
// ============================================================

/*

After basic ML integration, you can add:

1. Frontend Dashboard
   - Display student insights
   - Show learning curve
   - Display badges
   - Show recommendations

2. Teacher Analytics View
   - Class-wide statistics
   - Top performers
   - Struggling students
   - Category analysis

3. Real-time Monitoring
   - Live leaderboard with AI scores
   - Alert when anomalies detected
   - Real-time student updates
   - Performance graphs

4. Data Export
   - Export student data
   - Generate reports
   - Archive old data
   - Import to spreadsheets

5. Database Integration
   - Persist all analytics
   - Long-term tracking
   - Historical comparisons
   - Detailed reports

6. Advanced Features
   - Question generation
   - Predictive analytics
   - Collaborative learning
   - Mobile app integration

*/

// ============================================================
// FINAL CHECKLIST
// ============================================================

/*

Before deploying, verify:

✅ npm run dev starts without errors
✅ curl http://localhost:3000/api/ml/health returns success
✅ POST to /api/ml/analytics/record works
✅ GET /api/ml/analytics/student/:id returns data
✅ Socket.io events fire in browser console
✅ Student answers are being recorded
✅ Difficulty adjusting based on performance
✅ Insights endpoint returns valid data
✅ No console errors on frontend
✅ No server errors on backend

Then you can:
✅ Deploy to Vercel
✅ Enable in production
✅ Add to frontend UI
✅ Scale to more students

*/

// ============================================================
// SUPPORT
// ============================================================

/*

For detailed help:
- Read ML_QUICK_START.md (5 min)
- Read AI_ML_GUIDE.md (comprehensive)
- Check INTEGRATION_EXAMPLE.js (code samples)
- Review PROJECT_STRUCTURE.md (overview)

Questions:
- Check browser console for JavaScript errors
- Check server logs for backend errors
- Use curl to test endpoints
- Add console.log to debug

*/

module.exports = {};
