import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (form.password !== form.confirm) return setError("Passwords do not match");
    if (form.password.length < 6) return setError("Password must be at least 6 characters");
    setLoading(true);
    try {
      await register(form.name, form.email, form.password);
      navigate("/chat");
    } catch (err) {
      setError(err.response?.data?.error || "Registration failed");
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
        <div style={{ textAlign:"center", marginBottom:32 }}>
          <div style={{
            width:56, height:56, borderRadius:14, background:"linear-gradient(135deg,#6366f1,#a78bfa)",
            display:"inline-flex", alignItems:"center", justifyContent:"center",
            fontSize:28, marginBottom:12, boxShadow:"0 8px 32px rgba(99,102,241,0.4)"
          }}>🧠</div>
          <h1 style={{ fontFamily:"var(--font-display)", fontSize:24, fontWeight:700 }}>
            Join LearnAI
          </h1>
          <p style={{ color:"var(--text-muted)", marginTop:4, fontSize:13 }}>
            Start learning anything with AI
          </p>
        </div>

        <div className="card">
          <h2 style={{ fontSize:18, marginBottom:18 }}>Create Account</h2>

          {error && (
            <div style={{
              background:"rgba(239,68,68,0.1)", border:"1px solid #ef4444",
              borderRadius:8, padding:"10px 14px", marginBottom:14,
              color:"#ef4444", fontSize:13
            }}>{error}</div>
          )}

          <form onSubmit={handleSubmit} style={{ display:"flex", flexDirection:"column", gap:12 }}>
            {[
              { key:"name", label:"Full Name", type:"text", placeholder:"John Doe", autoComplete:"name" },
              { key:"email", label:"Email", type:"email", placeholder:"you@example.com", autoComplete:"email" },
              { key:"password", label:"Password", type:"password", placeholder:"Min 6 characters", autoComplete:"new-password" },
              { key:"confirm", label:"Confirm Password", type:"password", placeholder:"Repeat password", autoComplete:"new-password" },
            ].map(({ key, label, type, placeholder, autoComplete }) => (
              <div key={key}>
                <label style={{ fontSize:13, color:"var(--text-muted)", display:"block", marginBottom:5 }}>{label}</label>
                <input
                  className="input"
                  type={type}
                  placeholder={placeholder}
                  autoComplete={autoComplete}
                  value={form[key]}
                  onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                  required
                />
              </div>
            ))}
            <button
              type="submit"
              className="btn btn-primary w-full"
              disabled={loading}
              style={{ marginTop:6 }}
            >
              {loading ? <><span className="spinner" />Creating account...</> : "Create Account"}
            </button>
          </form>

          <p style={{ textAlign:"center", marginTop:18, fontSize:13, color:"var(--text-muted)" }}>
            Already have an account?{" "}
            <Link to="/login" style={{ color:"var(--primary-light)", textDecoration:"none", fontWeight:500 }}>
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
