import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate("/chat");
    } catch (err) {
      setError(err.response?.data?.error || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight:"100vh", display:"flex", flexDirection:"column",
      alignItems:"center", justifyContent:"center", padding:"24px 20px",
      background:"var(--bg)"
    }}>
      <div style={{ width:"100%", maxWidth:400 }}>
        {/* Logo */}
        <div style={{ textAlign:"center", marginBottom:36 }}>
          <div style={{
            width:64, height:64, borderRadius:16, background:"linear-gradient(135deg,#6366f1,#a78bfa)",
            display:"inline-flex", alignItems:"center", justifyContent:"center",
            fontSize:32, marginBottom:16, boxShadow:"0 8px 32px rgba(99,102,241,0.4)"
          }}>🧠</div>
          <h1 style={{ fontFamily:"var(--font-display)", fontSize:28, fontWeight:700, color:"var(--text)" }}>
            LearnAI
          </h1>
          <p style={{ color:"var(--text-muted)", marginTop:6, fontSize:14 }}>
            Your AI-powered learning companion
          </p>
        </div>

        <div className="card">
          <h2 style={{ fontSize:20, marginBottom:20 }}>Sign In</h2>

          {error && (
            <div style={{
              background:"rgba(239,68,68,0.1)", border:"1px solid var(--error)",
              borderRadius:var_sm, padding:"10px 14px", marginBottom:16,
              color:"var(--error)", fontSize:13
            }}>{error}</div>
          )}

          <form onSubmit={handleSubmit} style={{ display:"flex", flexDirection:"column", gap:14 }}>
            <div>
              <label style={{ fontSize:13, color:"var(--text-muted)", display:"block", marginBottom:6 }}>Email</label>
              <input
                className="input"
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
                autoComplete="email"
              />
            </div>
            <div>
              <label style={{ fontSize:13, color:"var(--text-muted)", display:"block", marginBottom:6 }}>Password</label>
              <input
                className="input"
                type="password"
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
                autoComplete="current-password"
              />
            </div>
            <button
              type="submit"
              className="btn btn-primary w-full"
              disabled={loading}
              style={{ marginTop:8 }}
            >
              {loading ? <><span className="spinner" />Signing in...</> : "Sign In"}
            </button>
          </form>

          <p style={{ textAlign:"center", marginTop:20, fontSize:13, color:"var(--text-muted)" }}>
            No account?{" "}
            <Link to="/register" style={{ color:"var(--primary-light)", textDecoration:"none", fontWeight:500 }}>
              Create one free
            </Link>
          </p>
        </div>

        <p style={{ textAlign:"center", marginTop:20, fontSize:12, color:"var(--text-muted)" }}>
          🔒 Your learning data stays private
        </p>
      </div>
    </div>
  );
}

// Fix the CSS var usage
const var_sm = "var(--radius-sm)";
