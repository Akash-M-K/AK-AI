const express = require("express");
const Anthropic = require("@anthropic-ai/sdk");
const authMiddleware = require("../middleware/auth");

const router = express.Router();
const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// Generate and download study material
router.post("/generate", authMiddleware, async (req, res) => {
  try {
    const { topic, type = "study-guide" } = req.body;
    if (!topic) return res.status(400).json({ error: "Topic required" });

    const typePrompts = {
      "study-guide": `Create a comprehensive study guide for "${topic}". Include:
# Study Guide: ${topic}

## Overview
## Key Concepts (list 5-8 concepts with explanations)
## Important Facts
## Examples and Applications
## Summary
## Practice Questions (5 questions with answers)

Format it as clean markdown.`,
      "flashcards": `Create 15 flashcards for "${topic}". Use this format:

# Flashcards: ${topic}

## Card 1
**Front:** [Term or question]
**Back:** [Definition or answer]

Continue for all 15 cards. Make them educational and varied.`,
      "notes": `Create concise lecture notes for "${topic}". Include:
# Lecture Notes: ${topic}

## Introduction
## Main Points (numbered)
## Key Definitions
## Important Formulas/Concepts (if applicable)
## Quick Reference

Keep it concise but comprehensive.`,
      "quiz": `Create a 10-question quiz for "${topic}". Format:

# Quiz: ${topic}

## Questions

1. [Question]
   a) [Option]
   b) [Option]
   c) [Option]
   d) [Option]

(Continue for all 10 questions)

## Answer Key
1. [correct letter] - [brief explanation]
(Continue for all answers)`,
    };

    const prompt = typePrompts[type] || typePrompts["study-guide"];

    const response = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 3000,
      messages: [{ role: "user", content: prompt }],
    });

    const content = response.content[0].text;
    const filename = `${type}-${topic.replace(/[^a-z0-9]/gi, "-").toLowerCase()}.md`;

    res.setHeader("Content-Type", "text/markdown; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.send(content);
  } catch (err) {
    console.error("Download error:", err);
    res.status(500).json({ error: "Failed to generate material" });
  }
});

// List available material types
router.get("/types", authMiddleware, (req, res) => {
  res.json({
    types: [
      { id: "study-guide", label: "Study Guide", icon: "📚", description: "Comprehensive guide with concepts and examples" },
      { id: "flashcards", label: "Flashcards", icon: "🃏", description: "Quick-review cards for memorization" },
      { id: "notes", label: "Lecture Notes", icon: "📝", description: "Concise structured notes" },
      { id: "quiz", label: "Practice Quiz", icon: "✅", description: "10-question quiz with answer key" },
    ],
  });
});

module.exports = router;
