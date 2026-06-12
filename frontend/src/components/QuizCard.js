import React, { useState } from "react";
import axios from "axios";

const API = process.env.REACT_APP_API_URL || "";

export default function QuizCard({ quiz, topic, onResult }) {
  const [selected, setSelected] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const isCorrect = submitted && selected === quiz.correct;

  const handleSubmit = async () => {
    if (!selected || submitted) return;
    setLoading(true);
    try {
      const res = await axios.post(`${API}/api/progress/quiz`, {
        topic: topic || "General",
        question: quiz.question,
        selectedAnswer: quiz.options[selected],
        correctAnswer: quiz.options[quiz.correct],
        isCorrect: selected === quiz.correct,
        totalQuestions: 1,
      });
      setSubmitted(true);
      if (onResult) onResult({ correct: selected === quiz.correct, score: res.data.currentScore });
    } catch (err) {
      console.error(err);
      setSubmitted(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      background:"var(--surface2)", border:`1px solid ${submitted ? (isCorrect ? "var(--success)" : "var(--error)") : "var(--border)"}`,
      borderRadius:"var(--radius)", padding:16, marginTop:12,
      transition:"border-color 0.3s"
    }}>
      <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:12 }}>
        <span style={{ fontSize:16 }}>🎯</span>
        <span style={{ fontSize:13, fontWeight:600, color:"var(--primary-light)", textTransform:"uppercase", letterSpacing:0.5 }}>
          Quick Check
        </span>
      </div>

      <p style={{ fontWeight:500, marginBottom:14, lineHeight:1.5, fontSize:15 }}>
        {quiz.question}
      </p>

      <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
        {Object.entries(quiz.options).map(([letter, text]) => {
          let bg = "var(--surface3)";
          let border = "var(--border)";
          let color = "var(--text)";

          if (submitted) {
            if (letter === quiz.correct) { bg="rgba(34,197,94,0.15)"; border="var(--success)"; color="var(--success)"; }
            else if (letter === selected) { bg="rgba(239,68,68,0.15)"; border="var(--error)"; color="var(--error)"; }
          } else if (letter === selected) {
            bg="rgba(99,102,241,0.2)"; border="var(--primary)"; color="var(--primary-light)";
          }

          return (
            <button
              key={letter}
              disabled={submitted}
              onClick={() => !submitted && setSelected(letter)}
              style={{
                background:bg, border:`1px solid ${border}`, color, borderRadius:8,
                padding:"10px 14px", textAlign:"left", cursor:submitted ? "default":"pointer",
                display:"flex", alignItems:"center", gap:10, fontSize:14,
                transition:"all 0.2s", WebkitTapHighlightColor:"transparent"
              }}
            >
              <span style={{
                width:24, height:24, borderRadius:6, background:"var(--surface)",
                display:"flex", alignItems:"center", justifyContent:"center",
                fontSize:12, fontWeight:700, flexShrink:0
              }}>{letter}</span>
              <span style={{ lineHeight:1.4 }}>{text}</span>
              {submitted && letter === quiz.correct && <span style={{ marginLeft:"auto" }}>✓</span>}
              {submitted && letter === selected && letter !== quiz.correct && <span style={{ marginLeft:"auto" }}>✗</span>}
            </button>
          );
        })}
      </div>

      {!submitted ? (
        <button
          className="btn btn-primary"
          onClick={handleSubmit}
          disabled={!selected || loading}
          style={{ marginTop:12, width:"100%" }}
        >
          {loading ? <><span className="spinner" />Checking...</> : "Submit Answer"}
        </button>
      ) : (
        <div style={{
          marginTop:12, padding:"10px 14px",
          background:isCorrect ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.1)",
          borderRadius:8, fontSize:13
        }}>
          <p style={{ fontWeight:600, color:isCorrect ? "var(--success)" : "var(--error)", marginBottom:4 }}>
            {isCorrect ? "🎉 Correct!" : "❌ Not quite"}
          </p>
          {quiz.explanation && (
            <p style={{ color:"var(--text-muted)", lineHeight:1.5 }}>{quiz.explanation}</p>
          )}
        </div>
      )}
    </div>
  );
}
