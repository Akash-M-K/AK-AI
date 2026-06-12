const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const authMiddleware = require("../middleware/auth");
const {
  createSession, getSession, getUserSessions,
  addMessageToSession, addTopicToSession, getAllProgress,
} = require("../models/store");

const router = express.Router();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Multer for image uploads
const uploadsDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

const storage = multer.diskStorage({
  destination: uploadsDir,
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    allowed.includes(file.mimetype) ? cb(null, true) : cb(new Error("Images only"));
  },
});

// Build system prompt
const buildSystemPrompt = (userName) => `You are LearnAI, an expert educational AI tutor for ${userName}. Your role is to:

1. TEACH clearly and engagingly on any topic the user asks about
2. PROVIDE relevant images by suggesting search terms (wrap in [IMAGE: search term])
3. ASSESS learning by naturally asking comprehension questions during the lesson
4. TRACK understanding — after explanations, ask 1-2 quiz questions
5. OFFER downloadable materials by mentioning "I can generate a study guide/notes/flashcards for this topic"
6. USE simple language, real-world examples, analogies
7. STRUCTURE responses with clear sections when explaining complex topics
8. CELEBRATE progress and encourage the learner

When generating quiz questions, use this format:
[QUIZ]
Q: <question>
A: <correct answer>
B: <wrong answer>
C: <wrong answer>  
D: <wrong answer>
CORRECT: A
EXPLANATION: <why this is correct>
[/QUIZ]

When suggesting a downloadable material, use:
[DOWNLOAD: Study Guide for <topic>]

Always detect the main topic being discussed and mention it at the start as:
[TOPIC: <topic name>]

Be warm, encouraging, patient, and adaptive to the learner's level.`;

// Create new chat session
router.post("/session", authMiddleware, (req, res) => {
  const session = createSession(req.user.id);
  res.json({ sessionId: session.id });
});

// Get all sessions for user
router.get("/sessions", authMiddleware, (req, res) => {
  const sessions = getUserSessions(req.user.id).map((s) => ({
    id: s.id,
    topics: s.topics,
    messageCount: s.messages.length,
    createdAt: s.createdAt,
    lastMessage: s.messages[s.messages.length - 1]?.content?.substring(0, 60) || "",
  }));
  res.json({ sessions: sessions.reverse() });
});

// Get session messages
router.get("/session/:id", authMiddleware, (req, res) => {
  const session = getSession(req.params.id);
  if (!session || session.userId !== req.user.id)
    return res.status(404).json({ error: "Session not found" });
  res.json({ session });
});

// Send message (with optional image)
router.post("/message", authMiddleware, upload.single("image"), async (req, res) => {
  try {
    let { sessionId, message } = req.body;

    // Create session if not provided
    if (!sessionId) {
      const s = createSession(req.user.id);
      sessionId = s.id;
    }

    let session = getSession(sessionId);
    if (!session) {
      const s = createSession(req.user.id);
      sessionId = s.id;
      session = s;
    }
    if (session.userId !== req.user.id)
      return res.status(403).json({ error: "Unauthorized" });

    // Build Gemini model with system instruction
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      systemInstruction: buildSystemPrompt(req.user.name),
    });

    // Build chat history for Gemini (last 20 messages)
    // Gemini uses "user" and "model" roles (not "assistant")
    const history = session.messages.slice(-20).map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));

    // Start chat with history (exclude last user message — we send it separately)
    const chat = model.startChat({ history: history });

    let result;

    if (req.file) {
      // Image + text message
      const imageData = fs.readFileSync(req.file.path);
      const base64 = imageData.toString("base64");
      const mediaType = req.file.mimetype;
      fs.unlinkSync(req.file.path); // cleanup

      const userMessage = message || "What can you tell me about this image? Teach me about it.";

      // Save user message to session
      addMessageToSession(sessionId, {
        role: "user",
        content: userMessage,
        hasImage: true,
      });

      // Send image + text to Gemini
      result = await chat.sendMessage([
        { inlineData: { mimeType: mediaType, data: base64 } },
        { text: userMessage },
      ]);
    } else {
      // Text-only message
      addMessageToSession(sessionId, { role: "user", content: message });

      // Send text to Gemini
      result = await chat.sendMessage(message);
    }

    const aiText = result.response.text();

    // Extract topic
    const topicMatch = aiText.match(/\[TOPIC:\s*([^\]]+)\]/);
    if (topicMatch) addTopicToSession(sessionId, topicMatch[1].trim());

    // Extract quiz data
    const quizMatch = aiText.match(/\[QUIZ\]([\s\S]*?)\[\/QUIZ\]/);
    let quiz = null;
    if (quizMatch) {
      const quizText = quizMatch[1];
      const qMatch = quizText.match(/Q:\s*(.+)/);
      const options = {};
      ["A", "B", "C", "D"].forEach((letter) => {
        const m = quizText.match(new RegExp(`${letter}:\\s*(.+)`));
        if (m) options[letter] = m[1].trim();
      });
      const correctMatch = quizText.match(/CORRECT:\s*([A-D])/);
      const explMatch = quizText.match(/EXPLANATION:\s*(.+)/);
      if (qMatch && correctMatch) {
        quiz = {
          question: qMatch[1].trim(),
          options,
          correct: correctMatch[1].trim(),
          explanation: explMatch ? explMatch[1].trim() : "",
        };
      }
    }

    // Extract download suggestions
    const downloads = [];
    const downloadRegex = /\[DOWNLOAD:\s*([^\]]+)\]/g;
    let dm;
    while ((dm = downloadRegex.exec(aiText)) !== null) {
      downloads.push(dm[1].trim());
    }

    // Extract image search suggestions
    const images = [];
    const imageRegex = /\[IMAGE:\s*([^\]]+)\]/g;
    let im;
    while ((im = imageRegex.exec(aiText)) !== null) {
      images.push(im[1].trim());
    }

    // Clean display text
    const displayText = aiText
      .replace(/\[TOPIC:[^\]]+\]/g, "")
      .replace(/\[QUIZ\][\s\S]*?\[\/QUIZ\]/g, "")
      .replace(/\[DOWNLOAD:[^\]]+\]/g, "")
      .replace(/\[IMAGE:[^\]]+\]/g, "")
      .trim();

    // Save AI message
    addMessageToSession(sessionId, { role: "assistant", content: displayText });

    res.json({
      sessionId,
      message: displayText,
      quiz,
      downloads,
      imageSuggestions: images,
      topic: topicMatch ? topicMatch[1].trim() : null,
    });
  } catch (err) {
    console.error("Chat error:", err);
    res.status(500).json({ error: "Failed to get AI response: " + err.message });
  }
});

module.exports = router;
