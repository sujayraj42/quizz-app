# MongoDB Integration Guide

Complete guide on how to use the MongoDB database service with your application.

## 📋 Quick Start

### 1. Install Dependencies

```bash
npm install
```

This installs: `mongoose`, `dotenv`, `cors`, `bcryptjs`

### 2. Create `.env` File

In your project root, create `.env`:

```bash
MONGODB_URI=mongodb://localhost:27017/study-buddy
NODE_ENV=development
PORT=3000
```

### 3. Start MongoDB

**Windows:**
```bash
mongod
```

**macOS:**
```bash
brew services start mongodb-community
```

**Linux:**
```bash
sudo systemctl start mongod
```

### 4. Run Server

```bash
npm run dev
```

You should see:
```
✅ Using MongoDB database
```

---

## 🏗️ Architecture Overview

```
Socket.io Event
    ↓
socket.js handler
    ↓
db.recordAnswer() / db.createRoom() etc.
    ↓
Mongoose Models
    ↓
MongoDB
```

---

## 💾 Database Service API

The database service (`server/db/database.js`) provides these methods:

### Room Management

```javascript
// Create a new quiz room
const room = await db.createRoom({
  code: "ABC123",
  teacherId: "teacher1",
  questions: [{id: "q1", text: "2+2?", options: [...]}],
  status: "waiting"
});

// Get room by code
const room = await db.getRoom("ABC123");

// Update room
await db.updateRoom("ABC123", { status: "active" });

// Delete room
await db.deleteRoom("ABC123");
```

### Student Management

```javascript
// Create student
const student = await db.createStudent({
  name: "John Doe",
  roomCode: "ABC123",
  skillLevel: "beginner"
});

// Get student
const student = await db.getStudent("studentId123");

// Update student
await db.updateStudent("studentId123", { skillLevel: "intermediate" });
```

### Answer Recording

```javascript
// Record an answer
await db.recordAnswer({
  studentId: "student123",
  roomCode: "ABC123",
  questionId: "q1",
  selected: "option_a",
  correct: true,
  timeSpent: 8, // seconds
  category: "math"
});

// Get all answers for a student
const answers = await db.getAnswers("student123");

// Get all answers in a room
const roomAnswers = await db.getRoomAnswers("ABC123");
```

### Session Management

```javascript
// Create quiz session
const session = await db.createSession({
  roomCode: "ABC123",
  teacherId: "teacher1",
  startTime: new Date()
});

// End session
await db.endSession("sessionId", {
  endTime: new Date(),
  totalStudents: 25,
  avgScore: 82
});

// Get sessions for room
const sessions = await db.getSessions("ABC123");
```

### Performance Analytics

```javascript
// Update student performance
await db.updatePerformance("student123", {
  accuracy: 85,
  totalAnswered: 20,
  weakAreas: ["geometry"],
  learningCurve: "improving"
});

// Get performance for student
const perf = await db.getPerformance("student123");

// Get all performance in class
const classPerf = await db.getClassPerformance("ABC123");
```

### Difficulty Progression

```javascript
// Update difficulty
await db.updateDifficulty("student123", {
  currentLevel: 3,
  reason: "High accuracy sustained",
  adjustedAt: new Date()
});

// Get difficulty history
const history = await db.getDifficulty("student123");
```

### Question Bank

```javascript
// Add question to database
await db.addQuestion({
  text: "What is the capital of India?",
  options: ["Delhi", "Mumbai", "Bangalore"],
  answer: 0,
  category: "geography",
  difficulty: 2
});

// Get all questions by category
const questions = await db.getQuestions({ category: "geography" });
```

### Leaderboard

```javascript
// Update leaderboard
await db.updateLeaderboard("ABC123", {
  studentId: "student123",
  studentName: "John",
  score: 950,
  rank: 1
});

// Get leaderboard for room
const leaderboard = await db.getLeaderboard("ABC123");
```

### Health Check

```javascript
// Check database status
const status = await db.healthCheck();
// Returns: { connected: true, responseTime: 45 } or { connected: false, mode: "memory" }
```

---

## 🔌 Integration with Socket.io

Update `server/socket.js` to use the database:

```javascript
const db = require('./db/database');

module.exports = function registerSocketHandlers(io) {
  io.on('connection', (socket) => {
    
    // Example: Join room
    socket.on('join_room', async (data) => {
      try {
        // Create student record
        const student = await db.createStudent({
          name: data.playerName,
          roomCode: data.roomCode
        });
        
        socket.join(data.roomCode);
        io.to(data.roomCode).emit('player_joined', {
          studentId: student._id,
          playerName: data.playerName
        });
      } catch (error) {
        socket.emit('error', { message: error.message });
      }
    });

    // Example: Record answer
    socket.on('answer_submitted', async (data) => {
      try {
        // Record answer in database
        await db.recordAnswer({
          studentId: data.studentId,
          roomCode: data.roomCode,
          questionId: data.questionId,
          selected: data.selected,
          correct: data.correct,
          timeSpent: data.timeSpent
        });

        // Get updated leaderboard
        const leaderboard = await db.getLeaderboard(data.roomCode);
        
        io.to(data.roomCode).emit('answer_recorded', {
          studentId: data.studentId,
          leaderboard: leaderboard
        });
      } catch (error) {
        socket.emit('error', { message: error.message });
      }
    });

    // Example: End quiz
    socket.on('end_quiz', async (data) => {
      try {
        // Get room answers
        const answers = await db.getRoomAnswers(data.roomCode);
        
        // End session
        await db.endSession(data.sessionId, {
          endTime: new Date(),
          totalStudents: answers.length
        });

        io.to(data.roomCode).emit('quiz_ended', {
          stats: answers
        });
      } catch (error) {
        socket.emit('error', { message: error.message });
      }
    });
  });
};
```

---

## 🛠️ Integration with ML Analytics

The ML backend automatically works with the database. Update `server/ml/mlRouter.js`:

```javascript
const express = require('express');
const router = express.Router();
const db = require('../db/database');
const { analyzePerformance } = require('./analytics');

// Record answer and update analytics
router.post('/analytics/record', async (req, res) => {
  try {
    const { studentId, answerData } = req.body;

    // Record in database
    await db.recordAnswer({
      studentId,
      ...answerData
    });

    // Update performance metrics
    const performance = await analyzePerformance(studentId);
    await db.updatePerformance(studentId, performance);

    res.json({ success: true, performance });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get student analytics
router.get('/analytics/student/:studentId', async (req, res) => {
  try {
    const performance = await db.getPerformance(req.params.studentId);
    const difficulty = await db.getDifficulty(req.params.studentId);
    
    res.json({
      performance,
      difficulty
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
```

---

## 🧪 Testing With cURL

### Health Check

```bash
curl http://localhost:3000/health
```

### Record Answer

```bash
curl -X POST http://localhost:3000/api/ml/analytics/record \
  -H "Content-Type: application/json" \
  -d '{
    "studentId": "test123",
    "answerData": {
      "roomCode": "ABC123",
      "questionId": "q1",
      "selected": "option_a",
      "correct": true,
      "timeSpent": 15,
      "category": "math"
    }
  }'
```

### Get Student Performance

```bash
curl http://localhost:3000/api/ml/analytics/student/test123
```

---

## 🔄 Dual-Mode Storage

The database automatically switches between:

1. **MongoDB Mode** (Production)
   - Data persists in MongoDB
   - Used when `MONGODB_URI` is set and connection succeeds
   - Data survives server restart

2. **Memory Mode** (Development)
   - Data stored in application memory
   - Used when MongoDB unavailable
   - Data lost on restart (but won't break the app)

### Check Current Mode

```javascript
const status = await db.healthCheck();
console.log(status);
// { connected: true, responseTime: 45 }    // MongoDB
// { connected: false, mode: "memory" }     // Memory
```

---

## 📊 Database Collections

Auto-created in MongoDB:

```
study-buddy (database)
├── rooms (quiz room instances)
├── students (learner profiles)  
├── answerrecords (individual answers)
├── quizsessions (quiz session data)
├── performances (analytics per student)
├── difficultyprogression (difficulty levels)
├── questions (question bank)
└── leaderboards (ranked scores)
```

---

## 🔍 Monitoring & Debugging

### Check Connection Status

```bash
curl http://localhost:3000/health
```

### View Logs

```bash
# Development
npm run dev
# Watch for: ✅ MongoDB connected or ⚠️ Memory mode

# Production
# Check Vercel/Railway logs
```

### Verify Data in MongoDB

```bash
# Using MongoDB Compass
1. Connect to localhost:27017 (local)
2. Browse study-buddy database
3. View collections and documents

# Or command line
mongosh
use study-buddy
db.students.find()
db.answerrecords.find()
```

---

## ⚠️ Common Issues

### Error: "Cannot connect to MongoDB"

**Solution:**
- Ensure MongoDB is running
- Check MONGODB_URI in .env
- For local: `mongodb://localhost:27017/study-buddy`
- For Atlas: Check credentials and IP whitelist

### Error: "collection does not exist"

**Solution:**
- This is normal, collections auto-create on first write
- Verify data with: `db.students.find()`

### Error: "Model does not have schema"

**Solution:**
- Ensure `server/db/models.js` is imported in `server/db/database.js`
- Check file exists at correct path

### Missing Data After Restart

**Solution:**
- Check database status: `curl http://localhost:3000/health`
- If in memory mode, data is not persisted
- Ensure MongoDB is running for persistence

---

## 🚀 Next Steps

1. ✅ Create `.env` file with MongoDB URI
2. ✅ Run `npm install` to install dependencies
3. ✅ Start MongoDB service
4. ✅ Run `npm run dev`
5. ✅ Check health endpoint: `curl http://localhost:3000/health`
6. ✅ Test with sample curl commands above
7. ✅ Deploy to Railway/Vercel when ready

---

**Your database is ready to use!** 🎉
