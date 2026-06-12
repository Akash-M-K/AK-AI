import React, { useState } from "react";
import axios from "axios";

const API = process.env.REACT_APP_API_URL || "";

const TYPES = [
  { id: "study-guide", label: "Study Guide", icon: "📚" },
  { id: "flashcards", label: "Flashcards", icon: "🃏" },
  { id: "notes", label: "Notes", icon: "📝" },
  { id: "quiz", label: "Quiz Sheet", icon: "✅" },
];

export default function DownloadPanel({ topic, onClose }) {
  const [loading, setLoading] = useState(null);
  const [done, setDone] = useState([]);

  const download = async (type) => {
    setLoading(type);
    try {
      const res = await axios.post(
        `${API}/api/download/generate`,
        { topic, type },
        { responseType: "blob" }
      );
      const url = URL.createObjectURL(new Blob([res.data], { type: "text/markdown" }));
      const a = document.createElement("a");
      a.href = url;
      a.download = `${type}-${topic.replace(/[^a-z0-9]/gi, "-").toLowerCase()}.md`;
      a.click();
      URL.revokeObjectURL(url);
      setDone((d) => [...d, type]);
    } catch (err) {
      console.error("Download failed:", err);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div style={{
      background:"var(--surface2)", border:"1px solid var(--border)",
      borderRadius:"var(--radius)", padding:16, marginTop:12
    }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:12 }}>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <span>📥</span>
          <span style={{ fontWeight:600, fontSize:14 }}>Download Materials</span>
        </div>
        {onClose && (
          <button onClick={onClose} style={{ background:"none", border:"none", color:"var(--text-muted)", cursor:"pointer", fontSize:18 }}>×</button>
        )}
      </div>

      <p style={{ fontSize:12, color:"var(--text-muted)", marginBottom:12 }}>
        Topic: <strong style={{ color:"var(--primary-light)" }}>{topic}</strong>
      </p>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
        {TYPES.map(({ id, label, icon }) => (
          <button
            key={id}
            onClick={() => download(id)}
            disabled={!!loading}
            style={{
              background: done.includes(id) ? "rgba(34,197,94,0.1)" : "var(--surface3)",
              border: `1px solid ${done.includes(id) ? "var(--success)" : "var(--border)"}`,
              borderRadius:8, padding:"12px 10px",
              display:"flex", flexDirection:"column", alignItems:"center", gap:4,
              cursor:loading ? "wait":"pointer", transition:"all 0.2s",
              WebkitTapHighlightColor:"transparent",
              color: done.includes(id) ? "var(--success)" : "var(--text)"
            }}
          >
            {loading === id ? (
              <span className="spinner" />
            ) : (
              <span style={{ fontSize:20 }}>{done.includes(id) ? "✓" : icon}</span>
            )}
            <span style={{ fontSize:12, fontWeight:500 }}>{label}</span>
          </button>
        ))}
      </div>

      <p style={{ fontSize:11, color:"var(--text-muted)", marginTop:10, textAlign:"center" }}>
        Files download as .md (Markdown) — open in any text editor or notes app
      </p>
    </div>
  );
}
