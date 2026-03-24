/**
 * Database Service Layer
 * Abstracts database operations with fallback to in-memory storage
 */

const {
  Room,
  Student,
  AnswerRecord,
  QuizSession,
  Performance,
  DifficultyProgression,
  Question,
  Leaderboard,
} = require('./models');
const { isConnected } = require('./connection');

// In-memory fallback storage
const memoryStorage = {
  rooms: new Map(),
  students: new Map(),
  answers: [],
  sessions: new Map(),
  performance: new Map(),
  questions: new Map(),
};

class DatabaseService {
  constructor() {
    this.useMemory = false;
  }

  setUseMemory(value) {
    this.useMemory = value || !isConnected();
  }

  // ============= ROOM OPERATIONS =============

  async createRoom(roomData) {
    if (this.useMemory) {
      const room = { ...roomData, createdAt: new Date() };
      memoryStorage.rooms.set(roomData.roomCode, room);
      return room;
    }

    return await Room.create(roomData);
  }

  async getRoom(roomCode) {
    if (this.useMemory) {
      return memoryStorage.rooms.get(roomCode);
    }

    return await Room.findOne({ roomCode });
  }

  async updateRoom(roomCode, updateData) {
    if (this.useMemory) {
      const room = memoryStorage.rooms.get(roomCode);
      if (room) {
        Object.assign(room, updateData, { updatedAt: new Date() });
        memoryStorage.rooms.set(roomCode, room);
      }
      return room;
    }

    return await Room.findOneAndUpdate({ roomCode }, updateData, { new: true });
  }

  async deleteRoom(roomCode) {
    if (this.useMemory) {
      return memoryStorage.rooms.delete(roomCode);
    }

    return await Room.deleteOne({ roomCode });
  }

  // ============= STUDENT OPERATIONS =============

  async createStudent(studentData) {
    if (this.useMemory) {
      const student = { ...studentData, createdAt: new Date() };
      memoryStorage.students.set(studentData.studentId, student);
      return student;
    }

    try {
      return await Student.create(studentData);
    } catch (error) {
      if (error.code === 11000) {
        // Duplicate key, return existing
        return await Student.findOne({ studentId: studentData.studentId });
      }
      throw error;
    }
  }

  async getStudent(studentId) {
    if (this.useMemory) {
      return memoryStorage.students.get(studentId);
    }

    return await Student.findOne({ studentId });
  }

  async updateStudent(studentId, updateData) {
    if (this.useMemory) {
      const student = memoryStorage.students.get(studentId) || {};
      Object.assign(student, updateData, { updatedAt: new Date() });
      memoryStorage.students.set(studentId, student);
      return student;
    }

    return await Student.findOneAndUpdate({ studentId }, updateData, { new: true });
  }

  // ============= ANSWER RECORD OPERATIONS =============

  async recordAnswer(answerData) {
    if (this.useMemory) {
      memoryStorage.answers.push({ ...answerData, submittedAt: new Date() });
      return answerData;
    }

    return await AnswerRecord.create(answerData);
  }

  async getAnswers(studentId, limit = 100) {
    if (this.useMemory) {
      return memoryStorage.answers
        .filter((a) => a.studentId === studentId)
        .slice(-limit);
    }

    return await AnswerRecord.find({ studentId })
      .sort({ submittedAt: -1 })
      .limit(limit);
  }

  async getRoomAnswers(roomCode) {
    if (this.useMemory) {
      return memoryStorage.answers.filter((a) => a.roomCode === roomCode);
    }

    return await AnswerRecord.find({ roomCode }).sort({ submittedAt: -1 });
  }

  // ============= QUIZ SESSION OPERATIONS =============

  async createSession(sessionData) {
    if (this.useMemory) {
      const session = { ...sessionData, startedAt: new Date() };
      memoryStorage.sessions.set(sessionData.sessionId, session);
      return session;
    }

    return await QuizSession.create(sessionData);
  }

  async endSession(sessionId, endData) {
    if (this.useMemory) {
      const session = memoryStorage.sessions.get(sessionId);
      if (session) {
        Object.assign(session, endData, { endedAt: new Date() });
      }
      return session;
    }

    return await QuizSession.findByIdAndUpdate(sessionId, endData, { new: true });
  }

  async getSessions(roomCode, limit = 10) {
    if (this.useMemory) {
      return memoryStorage.sessions
        .get(roomCode);
    }

    return await QuizSession.find({ roomCode })
      .sort({ startedAt: -1 })
      .limit(limit);
  }

  // ============= PERFORMANCE OPERATIONS =============

  async updatePerformance(studentId, performanceData) {
    if (this.useMemory) {
      const perf = { ...performanceData, studentId, lastUpdated: new Date() };
      memoryStorage.performance.set(studentId, perf);
      return perf;
    }

    return await Performance.findOneAndUpdate(
      { studentId },
      performanceData,
      { new: true, upsert: true }
    );
  }

  async getPerformance(studentId) {
    if (this.useMemory) {
      return memoryStorage.performance.get(studentId);
    }

    return await Performance.findOne({ studentId });
  }

  async getClassPerformance(roomCode) {
    if (this.useMemory) {
      return Array.from(memoryStorage.performance.values());
    }

    return await Performance.find({}).sort({ accuracy: -1 });
  }

  // ============= DIFFICULTY OPERATIONS =============

  async updateDifficulty(studentId, difficultyData) {
    if (this.useMemory) {
      const diff = { ...difficultyData, studentId, lastUpdated: new Date() };
      memoryStorage.students.set(studentId, diff);
      return diff;
    }

    return await DifficultyProgression.findOneAndUpdate(
      { studentId },
      difficultyData,
      { new: true, upsert: true }
    );
  }

  async getDifficulty(studentId) {
    if (this.useMemory) {
      return memoryStorage.students.get(studentId);
    }

    return await DifficultyProgression.findOne({ studentId });
  }

  // ============= QUESTION OPERATIONS =============

  async addQuestion(questionData) {
    if (this.useMemory) {
      memoryStorage.questions.set(questionData.questionId, questionData);
      return questionData;
    }

    return await Question.create(questionData);
  }

  async getQuestions(category, difficulty, limit = 10) {
    if (this.useMemory) {
      return Array.from(memoryStorage.questions.values())
        .filter((q) => (!category || q.category === category) && (!difficulty || q.difficulty === difficulty))
        .slice(0, limit);
    }

    const query = {};
    if (category) query.category = category;
    if (difficulty) query.difficulty = difficulty;

    return await Question.find(query).limit(limit);
  }

  // ============= LEADERBOARD OPERATIONS =============

  async updateLeaderboard(roomCode, leaderboardData) {
    if (this.useMemory) {
      // In-memory doesn't persist leaderboard long-term
      return leaderboardData;
    }

    return await Leaderboard.insertMany(
      leaderboardData.map((entry) => ({ ...entry, roomCode }))
    );
  }

  async getLeaderboard(roomCode, limit = 50) {
    if (this.useMemory) {
      return [];
    }

    return await Leaderboard.find({ roomCode })
      .sort({ rank: 1 })
      .limit(limit);
  }

  // ============= HEALTH CHECK =============

  async healthCheck() {
    if (this.useMemory) {
      return { status: 'ok', mode: 'memory' };
    }

    try {
      await Performance.collection.stats();
      return { status: 'ok', mode: 'mongodb' };
    } catch (error) {
      return { status: 'error', mode: 'mongodb', error: error.message };
    }
  }

  // ============= CLEANUP =============

  async cleanup() {
    if (this.useMemory) {
      memoryStorage.rooms.clear();
      memoryStorage.students.clear();
      memoryStorage.answers = [];
      memoryStorage.sessions.clear();
      memoryStorage.performance.clear();
      memoryStorage.questions.clear();
    }
  }
}

module.exports = new DatabaseService();
