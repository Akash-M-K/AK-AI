import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

const API = process.env.REACT_APP_API_URL || "";

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [progress, setProgress] = useState([]);
  const [overall, setOverall] = useState(0);
  const [topicsStudied, setTopicsStudied] = useState(0);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      axios.get(`${API}/api/progress`),
      axios.get(`${API}/api/chat/sessions`),
    ])
      .then(([progRes, sessRes]) => {
        setProgress(progRes.data.progress || []);
        setOverall(progRes.data.overall || 0);
        setTopicsStudied(progRes.data.topicsStudied || 0);
        setSessions((sessRes.data.sessions || []).slice(0, 3));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  const levelColor = (score) => score >= 80 ? "var(--success)" : score >= 50 ? "var(--warning)" : "var(--primary-light)";

  if (loading) return (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"center", height:"100%", flexDirection:"column", gap:12 }}>
      <div className="spinner" style={{ width:32, height:32 }} />
      <span style={{ color:"var(--text-muted)", fontSize:13 }}>Loading your dashboard...</span>
    </div>
  );

  return (
    <div style={{ overflowY:"auto", height:"100%", padding:"20px 16px" }}>
      {/* Greeting */}
      <div style={{ marginBottom:24 }}>
        <h1 style={{ fontFamily:"var(--font-display)", fontSize:22, marginBottom:4 }}>
          {greeting}, {user?.name?.split(" ")[0]}! 👋
        </h1>
        <p style={{ color:"var(--text-muted)", fontSize:13 }}>
          Ready to learn something new today?
        </p>
      </div>

      {/* Stats row */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:10, marginBottom:20 }}>
        {[
          { label:"Overall Score", value:`${overall}%`, icon:"🎯", color:"var(--primary-light)" },
          { label:"Topics", value:topicsStudied, icon:"📚", color:"var(--accent)" },
          { label:"Sessions", value:sessions.length, icon:"💬", color:"var(--success)" },
        ].map(({ label, value, icon, color }) => (
          <div key={label} style={{
            background:"var(--surface)", border:"1px solid var(--border)",
            borderRadius:12, padding:"14px 10px", textAlign:"center"
          }}>
            <div style={{ fontSize:22, marginBottom:4 }}>{icon}</div>
            <div style={{ fontFamily:"var(--font-display)", fontSize:20, fontWeight:700, color }}>{value}</div>
            <div style={{ fontSize:11, color:"var(--text-muted)", marginTop:2 }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Start learning CTA */}
      <button
        onClick={() => navigate("/chat")}
        style={{
          width:"100%", background:"linear-gradient(135deg,var(--primary),var(--accent))",
          border:"none", borderRadius:14, padding:"18px 20px",
          display:"flex", alignItems:"center", justifyContent:"space-between",
          cursor:"pointer", marginBottom:20, WebkitTapHighlightColor:"transparent"
        }}
      >
        <div style={{ textAlign:"left" }}>
          <div style={{ fontFamily:"var(--font-display)", fontSize:17, fontWeight:700, color:"white", marginBottom:3 }}>
            Start Learning Now
          </div>
          <div style={{ fontSize:13, color:"rgba(255,255,255,0.8)" }}>
            Chat with your AI tutor
          </div>
        </div>
        <span style={{ fontSize:32 }}>🚀</span>
      </button>

      {/* Recent topics */}
      {progress.length > 0 && (
        <div style={{ marginBottom:20 }}>
          <h2 style={{ fontSize:15, fontWeight:600, marginBottom:12 }}>Recent Topics</h2>
          <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
            {progress.slice(0, 4).map((p) => (
              <div
                key={p.topic}
                onClick={() => navigate("/progress")}
                style={{
                  background:"var(--surface)", border:"1px solid var(--border)",
                  borderRadius:10, padding:"12px 14px",
                  display:"flex", alignItems:"center", gap:12,
                  cursor:"pointer", WebkitTapHighlightColor:"transparent"
                }}
              >
                <div style={{
                  width:40, height:40, borderRadius:10,
                  background:`conic-gradient(${levelColor(p.score)} ${p.score * 3.6}deg, var(--surface3) 0)`,
                  display:"flex", alignItems:"center", justifyContent:"center",
                  fontSize:12, fontWeight:700, color: levelColor(p.score), flexShrink:0
                }}>
                  {p.score}%
                </div>
                <div style={{ flex:1, overflow:"hidden" }}>
                  <div style={{ fontSize:14, fontWeight:500, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                    {p.topic}
                  </div>
                  <div style={{ fontSize:12, color:"var(--text-muted)", marginTop:2 }}>
                    {p.level} · {p.questionsAnswered} questions answered
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent sessions */}
      {sessions.length > 0 && (
        <div style={{ marginBottom:20 }}>
          <h2 style={{ fontSize:15, fontWeight:600, marginBottom:12 }}>Recent Chats</h2>
          <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
            {sessions.map((s) => (
              <div
                key={s.id}
                onClick={() => navigate(`/chat/${s.id}`)}
                style={{
                  background:"var(--surface)", border:"1px solid var(--border)",
                  borderRadius:10, padding:"12px 14px", cursor:"pointer",
                  WebkitTapHighlightColor:"transparent"
                }}
              >
                <div style={{ fontSize:13, fontWeight:500, marginBottom:3, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                  {s.topics?.join(", ") || "Chat session"}
                </div>
                <div style={{ fontSize:12, color:"var(--text-muted)" }}>
                  {s.messageCount} messages · {new Date(s.createdAt).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {progress.length === 0 && sessions.length === 0 && (
        <div style={{ textAlign:"center", padding:"32px 20px" }}>
          <div style={{ fontSize:48, marginBottom:12 }}>📚</div>
          <h3 style={{ fontSize:16, marginBottom:8 }}>Your learning journey starts here</h3>
          <p style={{ color:"var(--text-muted)", fontSize:13, marginBottom:20 }}>
            Start a chat to learn about any topic. Your progress will appear here.
          </p>
          <button className="btn btn-primary" onClick={() => navigate("/chat")}>
            Start First Lesson
          </button>
        </div>
      )}
    </div>
  );
}
