import React from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div style={{ display:"flex", flexDirection:"column", height:"100vh", height:"100dvh" }}>
      {/* Top header */}
      <header style={{
        background:"var(--surface)", borderBottom:"1px solid var(--border)",
        padding:"12px 16px", display:"flex", alignItems:"center", justifyContent:"space-between",
        flexShrink:0, paddingTop:"max(12px, env(safe-area-inset-top))"
      }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <div style={{
            width:32, height:32, borderRadius:8, background:"var(--primary)",
            display:"flex", alignItems:"center", justifyContent:"center", fontSize:16
          }}>🧠</div>
          <span style={{ fontFamily:"var(--font-display)", fontWeight:700, fontSize:17, color:"var(--text)" }}>
            AK-AI
          </span>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <span style={{ fontSize:13, color:"var(--text-muted)" }}>Hi, {user?.name?.split(" ")[0]}</span>
          <button onClick={handleLogout} className="btn btn-ghost btn-sm">
            Exit
          </button>
        </div>
      </header>

      {/* Page content */}
      <main style={{ flex:1, overflow:"hidden", display:"flex", flexDirection:"column" }}>
        <Outlet />
      </main>

      {/* Bottom nav (mobile-style) */}
      <nav style={{
        background:"var(--surface)", borderTop:"1px solid var(--border)",
        display:"flex", alignItems:"stretch", flexShrink:0,
        paddingBottom:"env(safe-area-inset-bottom)",
      }}>
        {[
          { to:"/chat", icon:"💬", label:"Chat" },
          { to:"/dashboard", icon:"🏠", label:"Home" },
          { to:"/progress", icon:"📊", label:"Progress" },
        ].map(({ to, icon, label }) => (
          <NavLink
            key={to}
            to={to}
            style={({ isActive }) => ({
              flex:1, display:"flex", flexDirection:"column", alignItems:"center",
              justifyContent:"center", gap:3, padding:"10px 4px",
              textDecoration:"none",
              color: isActive ? "var(--primary-light)" : "var(--text-muted)",
              background: isActive ? "var(--surface2)" : "transparent",
              fontSize:11, fontWeight:500, transition:"all 0.2s",
              WebkitTapHighlightColor:"transparent",
            })}
          >
            <span style={{ fontSize:20 }}>{icon}</span>
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
