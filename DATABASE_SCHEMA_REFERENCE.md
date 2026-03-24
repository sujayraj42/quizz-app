# 📊 Database Schema & Data Flow Reference

## 🏗️ Database Schema Diagram

```
STUDY-BUDDY DATABASE
│
├─ ROOMS Collection
│  ├─ _id: ObjectId
│  ├─ code: "ABC123" (unique room code)
│  ├─ name: "Morning Geometry Quiz"
│  ├─ teacherId: "teacher_001"
│  ├─ status: "active" | "waiting" | "completed"
│  ├─ createdAt: ISODate
│  ├─ questions: [
│  │  ├─ id: "q1"
│  │  ├─ text: "What is the area of a circle..."
│  │  ├─ options: ["15π", "25π", "35π", "45π"]
│  │  └─ category: "geometry"
│  │]
│  └─ maxPlayers: 50
│
├─ STUDENTS Collection
│  ├─ _id: ObjectId
│  ├─ name: "Raj Kumar"
│  ├─ roomCode: "ABC123"
│  ├─ joinedAt: ISODate
│  ├─ accuracy: 85.5 (%)
│  ├─ skillLevel: "beginner" | "intermediate" | "advanced"
│  ├─ badges: ["speedstar", "perfect_score"]
│  ├─ totalQuestionsAnswered: 45
│  └─ lastActive: ISODate
│
├─ ANSWERRECORDS Collection
│  ├─ _id: ObjectId
│  ├─ studentId: ObjectId (ref to Students)
│  ├─ roomCode: "ABC123"
│  ├─ questionId: "q1"
│  ├─ selected: "option_a" (what student selected)
│  ├─ correct: true | false
│  ├─ timeSpent: 12 (seconds)
│  ├─ category: "geometry"
│  ├─ difficulty: 2 (1-5 scale)
│  ├─ submittedAt: ISODate
│  └─ index on: studentId, roomCode, submittedAt
│
├─ QUIZSESSIONS Collection
│  ├─ _id: ObjectId
│  ├─ roomCode: "ABC123"
│  ├─ teacherId: "teacher_001"
│  ├─ startTime: ISODate
│  ├─ endTime: ISODate (nullable)
│  ├─ status: "active" | "completed"
│  ├─ totalQuestions: 10
│  ├─ totalStudents: 25
│  ├─ avgScore: 78.5
│  └─ sessionDuration: 1800 (seconds)
│
├─ PERFORMANCES Collection
│  ├─ _id: ObjectId
│  ├─ studentId: ObjectId (ref to Students)
│  ├─ overallAccuracy: 82.3 (%)
│  ├─ totalAnswered: 120
│  ├─ correctAnswers: 98
│  ├─ categoryStats: {
│  │  ├─ "math": { accuracy: 85, answered: 40 }
│  │  ├─ "science": { accuracy: 80, answered: 45 }
│  │  └─ "history": { accuracy: 82, answered: 35 }
│  │}
│  ├─ weakAreas: ["trigonometry", "chemistry"]
│  ├─ learningCurve: "improving" | "stable" | "declining"
│  ├─ trendInLastSessions: [85, 87, 90, 92]
│  └─ lastUpdated: ISODate
│
├─ DIFFICULTYPROGRESSION Collection
│  ├─ _id: ObjectId
│  ├─ studentId: ObjectId
│  ├─ currentLevel: 3 (1-5 scale)
│  ├─ previousLevel: 2
│  ├─ adjustments: [
│  │  ├─ level: 2, reason: "Initial", timestamp: ISODate
│  │  ├─ level: 3, reason: "Accuracy > 90%", timestamp: ISODate
│  │]
│  ├─ attemptsSinceAdjustment: 5
│  └─ nextReviewDue: ISODate
│
├─ QUESTIONS Collection
│  ├─ _id: ObjectId
│  ├─ text: "What is the capital of France?"
│  ├─ options: ["Paris", "Lyon", "Marseille", "Nice"]
│  ├─ correctAnswer: 0 (index of correct option)
│  ├─ category: "geography"
│  ├─ difficulty: 1 (1-5 scale)
│  ├─ explanation: "Paris is the capital and largest city of France..."
│  ├─ tags: ["capitals", "europe", "geography"]
│  ├─ usageCount: 234 (times used in quizzes)
│  ├─ avgTimeSpent: 8.5 (seconds)
│  ├─ avgAccuracy: 92.3 (%)
│  ├─ createdAt: ISODate
│  └─ index on: category, difficulty
│
└─ LEADERBOARDS Collection
   ├─ _id: ObjectId
   ├─ roomCode: "ABC123" (unique per room)
   ├─ entries: [
   │  {
   │   ├─ rank: 1
   │   ├─ studentId: ObjectId
   │   ├─ studentName: "Raj Kumar"
   │   ├─ score: 950
   │   ├─ accuracy: 95.2
   │   ├─ questionsAnswered: 20
   │   └─ timestamp: ISODate
   │  },
   │  { rank: 2, ... }
   │]
   ├─ createdAt: ISODate
   ├─ expiresAt: ISODate (24 hours, auto-delete)
   └─ index on: roomCode, TTL expiresAt
```

---

## 📈 Data Flow Diagram

```
USER ACTIONS → DATABASE → OUTPUT

┌─────────────────────────────────────────────────────────────┐
│                    QUIZ LIFECYCLE                            │
└─────────────────────────────────────────────────────────────┘

STEP 1: Teacher Creates Room
┌──────────────────────────┐
│ Teacher click "New Quiz" │
└────────┬─────────────────┘
         │
         ↓
┌──────────────────────────────────────────┐
│ db.createRoom({                          │
│   code: "ABC123",                        │
│   questions: [...]                       │
│ })                                       │
└────────┬─────────────────────────────────┘
         │
         ↓
┌─────────────────────┐
│ ROOMS collection    │
│ ↓ new document      │
│ {"code": "ABC123"} │
└────────┬────────────┘
         │
         ↓
    Room Created ✅


STEP 2: Student Joins Room
┌──────────────────────────┐
│ Student enters code      │
│ "ABC123"                 │
└────────┬─────────────────┘
         │
         ↓
┌──────────────────────────────────────────┐
│ db.createStudent({                       │
│   name: "Raj",                           │
│   roomCode: "ABC123"                     │
│ })                                       │
└────────┬─────────────────────────────────┘
         │
         ↓ (parallel writes)
         │
    ┌────┴────┐
    ↓         ↓
┌─────────┐ ┌──────────────┐
│ STUDENTS│ │PERFORMANCES  │
│ ↓ new   │ │ ↓ new        │
│ student │ │ performance  │
└────┬────┘ │ record       │
     │      └──────┬───────┘
     │             │
     └─────┬───────┘
           ↓
    Student Joined ✅


STEP 3: Student Answers Question
┌─────────────────────────────┐
│ Student selects answer      │
│ Time: 12 seconds            │
│ Selected: "option_a"        │
│ Correct: true               │
└────────┬────────────────────┘
         │
         ↓
┌─────────────────────────────────────────┐
│ db.recordAnswer({                       │
│   studentId: "stu_001",                 │
│   questionId: "q1",                     │
│   correct: true,                        │
│   timeSpent: 12                         │
│ })                                      │
└────────┬────────────────────────────────┘
         │
         ↓
│    ┌──────────────────┐
     │ ANSWERRECORDS    │
     │ ↓ new answer     │
     └────┬─────────────┘
         │
         └─→ (simultaneously)
             ↓
┌────────────────────────────────────────┐
│ db.updatePerformance({...})            │
│ - Update accuracy: 82% → 83%          │
│ - Update totalAnswered: 120 → 121     │
│ - Update categoryStats               │
└────────┬───────────────────────────────┘
         │
         ↓
    ┌─────────────────┐
    │ PERFORMANCES    │
    │ ↓ update        │
    └────┬────────────┘
         │
         └─→ (if score improves)
             ↓
┌────────────────────────────┐
│ db.updateDifficulty({...}) │
│ If accuracy > 85%:         │
│ Increase difficulty level  │
└────┬───────────────────────┘
     │
     ↓
  ┌──────────────────────┐
  │ DIFFICULTYPROGRESSION│
  │ ↓ update             │
  └──────────────────────┘

    Answer Recorded ✅


STEP 4: Quiz Completes
┌──────────────────────┐
│ Teacher ends quiz    │
└────────┬─────────────┘
         │
         ↓
┌─────────────────────────────────────────┐
│ db.endSession({                         │
│   sessionId: "...",                     │
│   endTime: now                          │
│ })                                      │
└────────┬────────────────────────────────┘
         │
         ↓
┌─────────────────────┐
│ QUIZSESSIONS        │
│ ↓ update status to  │
│ "completed"         │
└────────┬────────────┘
         │
         └─→ Calculate & update
             ↓
┌──────────────────────────────────────┐
│ 1. Get all answers: getRoomAnswers() │
│ 2. Calculate scores & accuracies     │
│ 3. Update leaderboard                │
└────────┬─────────────────────────────┘
         │
         ↓
    ┌─────────────────┐
    │ LEADERBOARDS    │
    │ ↓ new/update    │
    │ entries         │
    └────┬────────────┘
         │
         └─→ Broadcast results
             
    Quiz Completed ✅
```

---

## 🔄 API Method Flow Examples

### Example 1: Record Student Answer
```
User Event: Student submits answer
    ↓
Socket Handler: socket.on('answer_submitted', ...)
    ↓
db.recordAnswer({
  studentId: "stu_001",
  roomCode: "ABC123", 
  questionId: "q1",
  selected: "option_a",
  correct: true,
  timeSpent: 12
})
    ↓
Database Operations:
  1. Insert into ANSWERRECORDS
  2. Calculate new accuracy
  3. Update PERFORMANCES
  4. Check if difficulty should change
  5. Update DIFFICULTYPROGRESSION if needed
    ↓
Response: { success: true, accuracy: 83.5 }
    ↓
Socket Emit: 'answer_recorded' to room
    ↓
UI Update: Show feedback & next question
```

### Example 2: Get Student Performance
```
API Request: GET /api/ml/analytics/student/stu_001
    ↓
Route Handler
    ↓
db.getPerformance('stu_001')
    ↓
Database Query:
  PERFORMANCES collection
  match: { studentId: 'stu_001' }
    ↓
Response Object: {
  overallAccuracy: 83.5,
  totalAnswered: 121,
  correctAnswers: 101,
  categoryStats: {
    math: { accuracy: 85, answered: 40 },
    science: { accuracy: 80, answered: 45 },
    history: { accuracy: 82, answered: 35 }
  },
  weakAreas: [
    "trigonometry",
    "periodic-table"
  ],
  learningCurve: "improving",
  trendInLastSessions: [80, 82, 84, 83.5]
}
    ↓
Frontend Display: Charts & analytics
```

### Example 3: Update Leaderboard
```
Event: Quiz Ends or Student Scores Points
    ↓
db.updateLeaderboard('ABC123', {
  studentId: 'stu_001',
  studentName: 'Raj Kumar',
  score: 950
})
    ↓
Database Operations:
  1. Query LEADERBOARDS for roomCode='ABC123'
  2. If not exists: create new leaderboard
  3. Add or update entry with studentId
  4. Sort by score (descending)
  5. Assign ranks 1, 2, 3, ...
  6. Set TTL expiry (24 hours)
    ↓
Response: Updated leaderboard array
    ↓
Socket Emit: 'leaderboard_updated'
    ↓
UI Update: Show rankings in real-time
```

---

## 💾 Data Persistence Strategy

### On Quiz Completion
```
1. ANSWERRECORDS: All answers stored
2. PERFORMANCES: Student accuracy calculated
3. DIFFICULTYPROGRESSION: Level adjusted if needed
4. QUIZSESSIONS: Session summary stored
5. LEADERBOARDS: Scores ranked and stored
6. QUESTIONS: Usage stats and accuracy tracked
```

### Data Retention
```
PERMANENT (until deleted):
  - ROOMS: Until teacher deletes
  - STUDENTS: Until removed from room
  - ANSWERRECORDS: For historical analysis
  - PERFORMANCES: For analytics/reporting
  - DIFFICULTYPROGRESSION: For adaptive algorithm
  - QUESTIONS: Question bank (permanent)
  
TEMPORARY (auto-cleanup):
  - LEADERBOARDS: 24-hour TTL (auto-delete)
  - QUIZSESSIONS: 7 days (configurable)
```

---

## 🔍 Index Strategy for Performance

```
Collection            │ Indexes              │ Purpose
──────────────────────┼──────────────────────┼─────────────────────
ROOMS                 │ code (unique)        │ Fast room lookup
                      │ teacherId            │ Get teacher's rooms
──────────────────────┼──────────────────────┼─────────────────────
STUDENTS              │ roomCode             │ Get all room students
                      │ createdAt            │ Sort by join time
──────────────────────┼──────────────────────┼─────────────────────
ANSWERRECORDS         │ studentId            │ Get student's answers
                      │ roomCode             │ Get room's answers
                      │ submittedAt          │ Timeline sorting
                      │ { roomCode, submittedAt } │ Composite index
──────────────────────┼──────────────────────┼─────────────────────
PERFORMANCES          │ studentId            │ Get performance by student
──────────────────────┼──────────────────────┼─────────────────────
QUIZSESSIONS          │ roomCode             │ Get session history
──────────────────────┼──────────────────────┼─────────────────────
QUESTIONS             │ category             │ Get questions by type
                      │ difficulty           │ Get by difficulty
──────────────────────┼──────────────────────┼─────────────────────
LEADERBOARDS          │ roomCode + createdAt │ Get room leaderboard
                      │ expiresAt (TTL)      │ Auto-cleanup 24h
```

---

## 📊 Sample Data Snapshot

### After First Quiz Session

```javascript
// ROOMS
{
  "_id": ObjectId,
  "code": "ABC123",
  "name": "Geometry Quiz 1",
  "teacherId": "teacher_001",
  "status": "completed",
  "questions": 10,
  "maxPlayers": 50
}

// STUDENTS (entry)
{
  "_id": ObjectId,
  "name": "Raj Kumar",
  "roomCode": "ABC123",
  "joinedAt": ISODate("2024-01-15T10:30:00Z"),
  "skillLevel": "beginner"
}

// ANSWERRECORDS (multiple entries)
[
  {
    "studentId": ObjectId("stu_001"),
    "roomCode": "ABC123",
    "questionId": "q1",
    "selected": "option_a",
    "correct": true,
    "timeSpent": 12,
    "submittedAt": ISODate("2024-01-15T10:45:00Z")
  },
  { "questionId": "q2", "correct": false, "timeSpent": 18, ... },
  { "questionId": "q3", "correct": true, "timeSpent": 8, ... },
  ...
]

// PERFORMANCES (aggregated)
{
  "studentId": ObjectId("stu_001"),
  "overallAccuracy": 85.0,
  "totalAnswered": 10,
  "correctAnswers": 8,
  "weakAreas": ["complex-geometry"],
  "learningCurve": "improving"
}

// LEADERBOARDS
{
  "roomCode": "ABC123",
  "entries": [
    {
      "rank": 1,
      "studentId": ObjectId,
      "studentName": "Raj Kumar",
      "score": 850
    },
    ...
  ]
}
```

---

## 🚀 Query Examples

### Common Queries

```javascript
// Get all students in a room
db.collection('students').find({ roomCode: 'ABC123' })

// Get student's answers for a question
db.collection('answerrecords').find({
  studentId: ObjectId('stu_001'),
  questionId: 'q1'
})

// Get all answers for a room (for grading)
db.collection('answerrecords').find({
  roomCode: 'ABC123'
})

// Get top 10 students on leaderboard
db.collection('leaderboards')
  .findOne({ roomCode: 'ABC123' })
  .entries.sort((a, b) => b.score - a.score)
  .slice(0, 10)

// Get student's accuracy trend
db.collection('performances').findOne({
  studentId: ObjectId('stu_001')
}).trendInLastSessions

// Find easy questions for beginners
db.collection('questions').find({
  difficulty: { $lte: 2 },
  category: 'math'
})
```

---

This schema enables:
✅ Real-time quiz management  
✅ Detailed performance analytics  
✅ Adaptive difficulty assignment  
✅ Historical data preservation  
✅ Leaderboard rankings  
✅ ML-powered recommendations  
✅ Progress tracking & reporting
