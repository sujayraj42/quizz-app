const express = require("express");
const db = require("./db/database");

const router = express.Router();

// Fetch questions
router.get("/questions", async (req, res) => {
  try {
    const { category, difficulty, limit } = req.query;
    const questions = await db.getQuestions(category, difficulty, parseInt(limit) || 20);
    res.json({ ok: true, data: questions });
  } catch (error) {
    res.status(500).json({ ok: false, error: error.message });
  }
});

// Retrieve quiz history (sessions for a room)
router.get("/history/room/:roomCode", async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20;
    const sessions = await db.getSessions(req.params.roomCode, limit);
    res.json({ ok: true, data: sessions });
  } catch (error) {
    res.status(500).json({ ok: false, error: error.message });
  }
});

// Retrieve quiz history (answers for a student)
router.get("/history/student/:studentId", async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const answers = await db.getAnswers(req.params.studentId, limit);
    res.json({ ok: true, data: answers });
  } catch (error) {
    res.status(500).json({ ok: false, error: error.message });
  }
});

// Retrieve overall class performance
router.get("/history/performance", async (req, res) => {
  try {
    const performance = await db.getClassPerformance(req.query.roomCode);
    res.json({ ok: true, data: performance });
  } catch (error) {
    res.status(500).json({ ok: false, error: error.message });
  }
});

module.exports = router;
