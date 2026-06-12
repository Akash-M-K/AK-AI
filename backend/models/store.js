// Simple in-memory store — swap with a real DB (MongoDB/Postgres) for production
const { v4: uuidv4 } = require("uuid");
const bcrypt = require("bcryptjs");

const store = {
  users: [],       // [{ id, email, name, password, createdAt }]
  sessions: [],    // [{ id, userId, topics: [], messages: [], createdAt }]
  progress: [],    // [{ userId, topic, score, quizzes: [], lastActivity }]
};

// ---- USER helpers ----
const findUserByEmail = (email) =>
  store.users.find((u) => u.email.toLowerCase() === email.toLowerCase());

const findUserById = (id) => store.users.find((u) => u.id === id);

const createUser = async ({ name, email, password }) => {
  const hashed = await bcrypt.hash(password, 10);
  const user = { id: uuidv4(), name, email: email.toLowerCase(), password: hashed, createdAt: new Date() };
  store.users.push(user);
  return user;
};

// ---- SESSION helpers ----
const createSession = (userId) => {
  const session = { id: uuidv4(), userId, messages: [], topics: [], createdAt: new Date() };
  store.sessions.push(session);
  return session;
};

const getSession = (id) => store.sessions.find((s) => s.id === id);

const getUserSessions = (userId) => store.sessions.filter((s) => s.userId === userId);

const addMessageToSession = (sessionId, message) => {
  const session = getSession(sessionId);
  if (session) {
    session.messages.push({ ...message, id: uuidv4(), timestamp: new Date() });
    return session;
  }
  return null;
};

const addTopicToSession = (sessionId, topic) => {
  const session = getSession(sessionId);
  if (session && !session.topics.includes(topic)) {
    session.topics.push(topic);
  }
};

// ---- PROGRESS helpers ----
const getProgress = (userId, topic) =>
  store.progress.find((p) => p.userId === userId && p.topic === topic);

const getAllProgress = (userId) => store.progress.filter((p) => p.userId === userId);

const updateProgress = (userId, topic, data) => {
  let prog = getProgress(userId, topic);
  if (!prog) {
    prog = { id: uuidv4(), userId, topic, score: 0, questionsAnswered: 0, correctAnswers: 0, quizHistory: [], lastActivity: new Date() };
    store.progress.push(prog);
  }
  Object.assign(prog, { ...data, lastActivity: new Date() });
  return prog;
};

const addQuizResult = (userId, topic, result) => {
  let prog = getProgress(userId, topic);
  if (!prog) {
    prog = { id: uuidv4(), userId, topic, score: 0, questionsAnswered: 0, correctAnswers: 0, quizHistory: [], lastActivity: new Date() };
    store.progress.push(prog);
  }
  prog.quizHistory.push({ ...result, date: new Date() });
  prog.questionsAnswered += result.totalQuestions || 0;
  prog.correctAnswers += result.correct || 0;
  prog.score = prog.questionsAnswered > 0
    ? Math.round((prog.correctAnswers / prog.questionsAnswered) * 100)
    : 0;
  prog.lastActivity = new Date();
  return prog;
};

module.exports = {
  findUserByEmail, findUserById, createUser,
  createSession, getSession, getUserSessions, addMessageToSession, addTopicToSession,
  getProgress, getAllProgress, updateProgress, addQuizResult,
};
