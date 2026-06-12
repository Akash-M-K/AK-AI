import React, { useState, useEffect } from "react";

// Uses Unsplash Source for free educational images (no API key needed)
const getImageUrl = (query, index = 0) => {
  const seeds = [query, `${query} education`, `${query} science`];
  return `https://source.unsplash.com/400x300/?${encodeURIComponent(seeds[index] || query)}`;
};

export default function ImageGallery({ suggestions }) {
  const [expanded, setExpanded] = useState(false);
  const [loaded, setLoaded] = useState({});
  const [errors, setErrors] = useState({});

  if (!suggestions || suggestions.length === 0) return null;

  const shown = expanded ? suggestions : suggestions.slice(0, 2);

  return (
    <div style={{
      marginTop:12, background:"var(--surface2)",
      border:"1px solid var(--border)", borderRadius:"var(--radius)", overflow:"hidden"
    }}>
      <div
        onClick={() => setExpanded(!expanded)}
        style={{
          padding:"10px 14px", display:"flex", alignItems:"center", justifyContent:"space-between",
          cursor:"pointer", userSelect:"none"
        }}
      >
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <span>🖼️</span>
          <span style={{ fontSize:13, fontWeight:600 }}>Related Images</span>
          <span style={{
            background:"var(--primary)", color:"white", fontSize:10,
            borderRadius:10, padding:"2px 7px", fontWeight:600
          }}>{suggestions.length}</span>
        </div>
        <span style={{ color:"var(--text-muted)", fontSize:12 }}>{expanded ? "▲ Less" : "▼ More"}</span>
      </div>

      <div style={{ padding:"0 14px 14px", display:"flex", flexDirection:"column", gap:8 }}>
        {shown.map((query, i) => (
          <div key={i}>
            <p style={{ fontSize:11, color:"var(--text-muted)", marginBottom:4 }}>
              🔍 {query}
            </p>
            <div style={{
              borderRadius:8, overflow:"hidden", background:"var(--surface3)",
              height:180, position:"relative"
            }}>
              {!loaded[i] && !errors[i] && (
                <div style={{
                  position:"absolute", inset:0, display:"flex", alignItems:"center",
                  justifyContent:"center", flexDirection:"column", gap:8
                }}>
                  <div className="spinner" />
                  <span style={{ fontSize:11, color:"var(--text-muted)" }}>Loading image...</span>
                </div>
              )}
              {errors[i] ? (
                <div style={{
                  height:"100%", display:"flex", alignItems:"center", justifyContent:"center",
                  flexDirection:"column", gap:6
                }}>
                  <span style={{ fontSize:24 }}>🔍</span>
                  <span style={{ fontSize:12, color:"var(--text-muted)", textAlign:"center", padding:"0 20px" }}>
                    Search "{query}" online for images
                  </span>
                </div>
              ) : (
                <img
                  src={getImageUrl(query, i % 3)}
                  alt={query}
                  style={{
                    width:"100%", height:"100%", objectFit:"cover",
                    display:loaded[i] ? "block" : "none"
                  }}
                  onLoad={() => setLoaded((l) => ({ ...l, [i]: true }))}
                  onError={() => setErrors((e) => ({ ...e, [i]: true }))}
                />
              )}
            </div>
          </div>
        ))}

        {suggestions.length > 2 && !expanded && (
          <button
            onClick={() => setExpanded(true)}
            className="btn btn-ghost btn-sm w-full"
          >
            Show {suggestions.length - 2} more images
          </button>
        )}
      </div>
    </div>
  );
}
