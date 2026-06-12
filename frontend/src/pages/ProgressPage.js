import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const API = process.env.REACT_APP_API_URL || "";

const ScoreRing = ({ score, size = 60 }) => {
  const r = size / 2 - 6;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  const color = score >= 80 ? "#22c55e" : score >= 50 ? "#f59e0b" : "#818cf8";

  return (
    <svg width={size} height={size} style={{ transform:"rotate(-90deg)" }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="var(--surface3)" strokeWidth={5} />
      <circle
        cx={size/2} cy={size/2} r={r} fill="none"
        stroke={color} strokeWidth={5}
        strokeDasharray={circ} strokeDashoffset={offset}
        strokeLinecap="round"
        style={{ transition:"stroke-dashoffset 0.8s ease" }}
      />
      <text
        x={size/2} y={size/2 + 1}
        textAnchor="middle" dominantBaseline="middle"
        fill={color} fontSize={size/4.5} fontWeight="700"
        style={{ transform:"rotate(90deg)", transformOrigin:`${size/2}px ${size/2}px` }}
      >
        {score}%
      </text>
    </svg>
  );
};

const LevelBadge = ({ level }) => {
  const map = {
    Advanced: { bg:"rgba(34,197,94,0.15)", color:"#22c55e", icon:"🏆" },
    Intermediate: { bg:"rgba(245,158,11,0.15)", color:"#f59e0b", icon:"⭐" },
    Beginner: { bg:"rgba(129,140,248,0.15)", color:"#818cf8", icon:"🌱" },
  };
  const s = map[level] || map.Beginner;
  return (
    <span style={{
      background:s.bg, color:s.color, borderRadius:20, padding:"3px 10px",
      fontSize:11, fontWeight:600, display:"inline-flex", alignItems:"center", gap:4
    }}>
      {s.icon} {level}
    </span>
  );
};

export default function ProgressPage() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    axios.get(`${API}/api/progress`)
      .then((res) => setData(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"center", height:"100%", gap:12, flexDirection:"column" }}>
      <div className="spinner" style={{ width:32, height:32 }} />
      <span style={{ color:"var(--text-muted)", fontSize:13 }}>Loading progress...</span>
    </div>
  );

  if (!data || data.progress.length === 0) return (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"center", height:"100%", flexDirection:"column", gap:12, padding:24 }}>
      <div style={{ fontSize:48 }}>📊</div>
      <h2 style={{ fontFamily:"var(--font-display)", fontSize:20 }}>No progress yet</h2>
      <p style={{ color:"var(--text-muted)", fontSize:14, textAlign:"center" }}>
        Answer some quiz questions in the chat to track your learning progress.
      </p>
      <button className="btn btn-primary" onClick={() => navigate("/chat")}>
        Start Learning
      </button>
    </div>
  );

  const { progress, overall, topicsStudied } = data;

  return (
    <div style={{ overflowY:"auto", height:"100%", padding:"20px 16px" }}>
      <h1 style={{ fontFamily:"var(--font-display)", fontSize:22, marginBottom:4 }}>
        Your Progress 📊
      </h1>
      <p style={{ color:"var(--text-muted)", fontSize:13, marginBottom:20 }}>
        Track how much you've learned across topics
      </p>

      {/* Overall score */}
      <div style={{
        background:"linear-gradient(135deg,rgba(99,102,241,0.2),rgba(167,139,250,0.1))",
        border:"1px solid var(--border)", borderRadius:16, padding:20,
        display:"flex", alignItems:"center", gap:20, marginBottom:20
      }}>
        <ScoreRing score={overall} size={80} />
        <div>
          <div style={{ fontFamily:"var(--font-display)", fontSize:18, fontWeight:700, marginBottom:4 }}>
            Overall Score
          </div>
          <div style={{ color:"var(--text-muted)", fontSize:13, marginBottom:8 }}>
            {topicsStudied} topic{topicsStudied !== 1 ? "s" : ""} studied
          </div>
          <LevelBadge level={overall >= 80 ? "Advanced" : overall >= 50 ? "Intermediate" : "Beginner"} />
        </div>
      </div>

      {/* Topic list */}
      <h2 style={{ fontSize:15, fontWeight:600, marginBottom:12 }}>Topics Breakdown</h2>
      <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
        {progress.map((p) => (
          <div
            key={p.topic}
            onClick={() => setSelected(selected === p.topic ? null : p.topic)}
            style={{
              background:"var(--surface)", border:"1px solid var(--border)",
              borderRadius:12, padding:"14px 16px", cursor:"pointer",
              WebkitTapHighlightColor:"transparent", transition:"all 0.2s"
            }}
          >
            <div style={{ display:"flex", alignItems:"center", gap:12 }}>
              <ScoreRing score={p.score} size={52} />
              <div style={{ flex:1, overflow:"hidden" }}>
                <div style={{ fontSize:14, fontWeight:600, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", marginBottom:4 }}>
                  {p.topic}
                </div>
                <div style={{ display:"flex", alignItems:"center", gap:8, flexWrap:"wrap", gap:6 }}>
                  <LevelBadge level={p.level} />
                  <span style={{ fontSize:11, color:"var(--text-muted)" }}>
                    {p.questionsAnswered} Qs answered
                  </span>
                </div>
              </div>
              <span style={{ color:"var(--text-muted)", fontSize:14 }}>
                {selected === p.topic ? "▲" : "▼"}
              </span>
            </div>

            {selected === p.topic && (
              <div className="fade-in" style={{
                marginTop:14, paddingTop:14, borderTop:"1px solid var(--border)",
                display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:10
              }}>
                {[
                  { label:"Correct", value:p.correctAnswers, icon:"✓", color:"var(--success)" },
                  { label:"Total Qs", value:p.questionsAnswered, icon:"📝", color:"var(--primary-light)" },
                  { label:"Quizzes", value:p.quizzesTaken, icon:"🎯", color:"var(--accent)" },
                ].map(({ label, value, icon, color }) => (
                  <div key={label} style={{
                    background:"var(--surface2)", borderRadius:8, padding:"10px",
                    textAlign:"center"
                  }}>
                    <div style={{ fontSize:18, marginBottom:2 }}>{icon}</div>
                    <div style={{ fontWeight:700, color, fontSize:16 }}>{value}</div>
                    <div style={{ fontSize:10, color:"var(--text-muted)", marginTop:2 }}>{label}</div>
                  </div>
                ))}

                {/* Progress bar */}
                <div style={{ gridColumn:"1/-1" }}>
                  <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6, fontSize:12, color:"var(--text-muted)" }}>
                    <span>Accuracy</span>
                    <span>{p.score}%</span>
                  </div>
                  <div style={{ background:"var(--surface3)", borderRadius:20, height:8, overflow:"hidden" }}>
                    <div style={{
                      height:"100%", borderRadius:20,
                      background:p.score >= 80 ? "var(--success)" : p.score >= 50 ? "var(--warning)" : "var(--primary)",
                      width:`${p.score}%`, transition:"width 1s ease"
                    }} />
                  </div>
                </div>

                <div style={{ gridColumn:"1/-1" }}>
                  <button
                    className="btn btn-primary w-full btn-sm"
                    onClick={(e) => { e.stopPropagation(); navigate(`/chat?topic=${encodeURIComponent(p.topic)}`); }}
                  >
                    Continue Learning →
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div style={{ height:20 }} />
    </div>
  );
}
