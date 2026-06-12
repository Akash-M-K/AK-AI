const express = require("express");
const authMiddleware = require("../middleware/auth");
const { getAllProgress, addQuizResult, updateProgress } = require("../models/store");

const router = express.Router();

// Get all progress for user
router.get("/", authMiddleware, (req, res) => {
  const progress = getAllProgress(req.user.id);
  const summary = progress.map((p) => ({
    topic: p.topic,
    score: p.score,
    questionsAnswered: p.questionsAnswered,
    correctAnswers: p.correctAnswers,
    lastActivity: p.lastActivity,
    quizzesTaken: p.quizHistory.length,
    level: p.score >= 80 ? "Advanced" : p.score >= 50 ? "Intermediate" : "Beginner",
  }));

  const overall = summary.length > 0
    ? Math.round(summary.reduce((sum, p) => sum + p.score, 0) / summary.length)
    : 0;

  res.json({ progress: summary, overall, topicsStudied: summary.length });
});

// Submit quiz answer
router.post("/quiz", authMiddleware, (req, res) => {
  const { topic, question, selectedAnswer, correctAnswer, totalQuestions, isCorrect } = req.body;
  if (!topic || !question) return res.status(400).json({ error: "Topic and question required" });

  const result = addQuizResult(req.user.id, topic, {
    question,
    selectedAnswer,
    correctAnswer,
    isCorrect: isCorrect || selectedAnswer === correctAnswer,
    totalQuestions: totalQuestions || 1,
    correct: (isCorrect || selectedAnswer === correctAnswer) ? 1 : 0,
  });

  res.json({
    correct: isCorrect || selectedAnswer === correctAnswer,
    currentScore: result.score,
    questionsAnswered: result.questionsAnswered,
    message: (isCorrect || selectedAnswer === correctAnswer)
      ? "Great job! Correct answer! 🎉"
      : `Not quite. The correct answer was: ${correctAnswer}`,
  });
});

// Mark topic as studied
router.post("/activity", authMiddleware, (req, res) => {
  const { topic } = req.body;
  if (!topic) return res.status(400).json({ error: "Topic required" });
  const prog = updateProgress(req.user.id, topic, {});
  res.json({ progress: prog });
});

module.exports = router;
