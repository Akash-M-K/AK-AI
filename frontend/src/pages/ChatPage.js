import React, { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import QuizCard from "../components/QuizCard";
import DownloadPanel from "../components/DownloadPanel";
import ImageGallery from "../components/ImageGallery";
import { useAuth } from "../context/AuthContext";

const API = process.env.REACT_APP_API_URL || "";

const TypingDots = () => (
  <div style={{ display:"flex", gap:4, padding:"4px 0" }}>
    {[0,1,2].map(i => (
      <div key={i} style={{
        width:8, height:8, borderRadius:"50%", background:"var(--primary)",
        animation:"pulse 1.4s ease-in-out infinite",
        animationDelay:`${i*0.2}s`
      }} />
    ))}
  </div>
);

function ChatMessage({ msg, topic, onQuizResult }) {
  const [showDownload, setShowDownload] = useState(false);
  const isUser = msg.role === "user";

  return (
    <div className="fade-in" style={{
      display:"flex", justifyContent:isUser ? "flex-end" : "flex-start",
      marginBottom:16, gap:8, alignItems:"flex-end"
    }}>
      {!isUser && (
        <div style={{
          width:30, height:30, borderRadius:8, background:"var(--primary)",
          display:"flex", alignItems:"center", justifyContent:"center",
          fontSize:14, flexShrink:0
        }}>🧠</div>
      )}

      <div style={{ maxWidth:"85%", minWidth:60 }}>
        {msg.hasImage && (
          <div style={{
            background:"var(--surface3)", borderRadius:8, padding:"8px 12px",
            marginBottom:6, fontSize:12, color:"var(--text-muted)",
            display:"flex", alignItems:"center", gap:6
          }}>
            <span>🖼️</span> Image uploaded
          </div>
        )}

        <div style={{
          background: isUser ? "var(--primary)" : "var(--surface2)",
          borderRadius: isUser ? "14px 14px 4px 14px" : "14px 14px 14px 4px",
          padding:"12px 15px",
          border: isUser ? "none" : "1px solid var(--border)"
        }}>
          {isUser ? (
            <p style={{ fontSize:15, lineHeight:1.5, margin:0 }}>{msg.content}</p>
          ) : (
            <div className="markdown">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
            </div>
          )}
        </div>

        {/* Quiz */}
        {msg.quiz && (
          <QuizCard quiz={msg.quiz} topic={topic} onResult={onQuizResult} />
        )}

        {/* Image suggestions */}
        {msg.imageSuggestions?.length > 0 && (
          <ImageGallery suggestions={msg.imageSuggestions} />
        )}

        {/* Download suggestion */}
        {msg.downloads?.length > 0 && !showDownload && (
          <button
            onClick={() => setShowDownload(true)}
            style={{
              marginTop:8, background:"rgba(99,102,241,0.1)", border:"1px solid var(--primary)",
              borderRadius:8, padding:"8px 14px", color:"var(--primary-light)",
              cursor:"pointer", fontSize:13, display:"flex", alignItems:"center", gap:8,
              WebkitTapHighlightColor:"transparent"
            }}
          >
            <span>📥</span> Download study materials for this topic
          </button>
        )}

        {showDownload && topic && (
          <DownloadPanel topic={topic} onClose={() => setShowDownload(false)} />
        )}

        <div style={{ fontSize:10, color:"var(--text-muted)", marginTop:4, textAlign:isUser?"right":"left" }}>
          {msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString([], { hour:"2-digit", minute:"2-digit" }) : ""}
        </div>
      </div>

      {isUser && (
        <div style={{
          width:30, height:30, borderRadius:8, background:"var(--surface3)",
          display:"flex", alignItems:"center", justifyContent:"center",
          fontSize:14, flexShrink:0
        }}>👤</div>
      )}
    </div>
  );
}

export default function ChatPage() {
  const { sessionId: urlSessionId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [messages, setMessages] = useState([]);
  const [sessionId, setSessionId] = useState(urlSessionId || null);
  const [currentTopic, setCurrentTopic] = useState(null);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [showSidebar, setShowSidebar] = useState(false);
  const [toast, setToast] = useState(null);

  const bottomRef = useRef(null);
  const fileRef = useRef(null);
  const textareaRef = useRef(null);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2500);
  };

  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => { scrollToBottom(); }, [messages, loading]);

  // Load sessions list
  const loadSessions = useCallback(async () => {
    try {
      const res = await axios.get(`${API}/api/chat/sessions`);
      setSessions(res.data.sessions || []);
    } catch (err) { console.error(err); }
  }, []);

  useEffect(() => { loadSessions(); }, [loadSessions]);

  // Load session if URL has sessionId
  useEffect(() => {
    if (urlSessionId) {
      axios.get(`${API}/api/chat/session/${urlSessionId}`)
        .then((res) => {
          const s = res.data.session;
          setSessionId(s.id);
          setMessages(s.messages || []);
          if (s.topics?.length) setCurrentTopic(s.topics[s.topics.length - 1]);
        })
        .catch(() => navigate("/chat"));
    }
  }, [urlSessionId, navigate]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setImagePreview(ev.target.result);
    reader.readAsDataURL(file);
  };

  const clearImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  const newChat = () => {
    setSessionId(null);
    setMessages([]);
    setCurrentTopic(null);
    setInput("");
    clearImage();
    setShowSidebar(false);
    navigate("/chat");
  };

  const sendMessage = async () => {
    if ((!input.trim() && !imageFile) || loading) return;

    const userMsg = {
      role: "user",
      content: input.trim() || (imageFile ? "What can you teach me about this image?" : ""),
      hasImage: !!imageFile,
      timestamp: new Date(),
    };
    setMessages((m) => [...m, userMsg]);
    const msgText = input.trim();
    setInput("");
    clearImage();
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("message", msgText);
      if (sessionId) formData.append("sessionId", sessionId);
      if (imageFile) formData.append("image", imageFile);

      const res = await axios.post(`${API}/api/chat/message`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const { sessionId: newSid, message, quiz, downloads, imageSuggestions, topic } = res.data;

      if (!sessionId) {
        setSessionId(newSid);
        navigate(`/chat/${newSid}`, { replace: true });
        loadSessions();
      }
      if (topic) setCurrentTopic(topic);

      setMessages((m) => [...m, {
        role: "assistant",
        content: message,
        quiz,
        downloads,
        imageSuggestions,
        timestamp: new Date(),
      }]);
    } catch (err) {
      const errMsg = err.response?.data?.error || "Failed to get response";
      setMessages((m) => [...m, { role:"assistant", content:`⚠️ ${errMsg}`, timestamp:new Date() }]);
      showToast(errMsg, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const handleQuizResult = ({ correct, score }) => {
    showToast(correct ? `✓ Correct! Score: ${score}%` : `Keep going! Score: ${score}%`, correct ? "success" : "error");
  };

  const SUGGESTIONS = [
    "Explain quantum physics simply",
    "Teach me Python basics",
    "How does the human heart work?",
    "What is photosynthesis?",
    "Explain machine learning",
    "History of ancient Rome",
  ];

  return (
    <div style={{ display:"flex", height:"100%", overflow:"hidden", position:"relative" }}>
      {/* Sidebar */}
      {showSidebar && (
        <div
          style={{
            position:"absolute", inset:0, background:"rgba(0,0,0,0.6)",
            zIndex:50, display:"flex"
          }}
          onClick={() => setShowSidebar(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width:"80%", maxWidth:280, background:"var(--surface)",
              borderRight:"1px solid var(--border)", display:"flex", flexDirection:"column",
              height:"100%", overflow:"hidden"
            }}
          >
            <div style={{ padding:16, borderBottom:"1px solid var(--border)", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <span style={{ fontWeight:700, fontSize:15 }}>Chat History</span>
              <button onClick={newChat} className="btn btn-primary btn-sm">+ New</button>
            </div>
            <div style={{ flex:1, overflowY:"auto", padding:8 }}>
              {sessions.length === 0 ? (
                <p style={{ color:"var(--text-muted)", fontSize:13, padding:12, textAlign:"center" }}>
                  No chats yet
                </p>
              ) : sessions.map((s) => (
                <button
                  key={s.id}
                  onClick={() => { navigate(`/chat/${s.id}`); setShowSidebar(false); }}
                  style={{
                    width:"100%", background:s.id === sessionId ? "var(--surface2)":"transparent",
                    border:"none", borderRadius:8, padding:"10px 12px",
                    color:"var(--text)", cursor:"pointer", textAlign:"left",
                    display:"flex", flexDirection:"column", gap:3, marginBottom:4,
                    WebkitTapHighlightColor:"transparent"
                  }}
                >
                  <span style={{ fontSize:13, fontWeight:500, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                    {s.topics?.join(", ") || "New Chat"}
                  </span>
                  <span style={{ fontSize:11, color:"var(--text-muted)" }}>
                    {s.messageCount} messages · {new Date(s.createdAt).toLocaleDateString()}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Main chat */}
      <div style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden" }}>
        {/* Chat toolbar */}
        <div style={{
          display:"flex", alignItems:"center", gap:10, padding:"8px 14px",
          borderBottom:"1px solid var(--border)", background:"var(--surface)", flexShrink:0
        }}>
          <button onClick={() => setShowSidebar(true)} className="btn btn-ghost btn-sm">
            ☰
          </button>
          <div style={{ flex:1, overflow:"hidden" }}>
            {currentTopic ? (
              <span style={{ fontSize:13, color:"var(--primary-light)", fontWeight:500, display:"block", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                📖 {currentTopic}
              </span>
            ) : (
              <span style={{ fontSize:13, color:"var(--text-muted)" }}>Ask anything to learn</span>
            )}
          </div>
          <button onClick={newChat} className="btn btn-ghost btn-sm">New Chat</button>
        </div>

        {/* Messages area */}
        <div style={{ flex:1, overflowY:"auto", padding:"16px 14px" }}>
          {messages.length === 0 ? (
            <div style={{ textAlign:"center", paddingTop:32 }}>
              <div style={{ fontSize:48, marginBottom:16 }}>🧠</div>
              <h2 style={{ fontFamily:"var(--font-display)", fontSize:22, marginBottom:8 }}>
                Learn Anything
              </h2>
              <p style={{ color:"var(--text-muted)", fontSize:14, marginBottom:28 }}>
                Ask a question, upload an image, or pick a topic below
              </p>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, maxWidth:360, margin:"0 auto" }}>
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => { setInput(s); textareaRef.current?.focus(); }}
                    style={{
                      background:"var(--surface2)", border:"1px solid var(--border)",
                      borderRadius:10, padding:"10px 12px", color:"var(--text)",
                      cursor:"pointer", fontSize:12, textAlign:"left", lineHeight:1.4,
                      WebkitTapHighlightColor:"transparent", transition:"all 0.2s"
                    }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <>
              {messages.map((msg, i) => (
                <ChatMessage
                  key={i}
                  msg={msg}
                  topic={currentTopic}
                  onQuizResult={handleQuizResult}
                />
              ))}
              {loading && (
                <div className="fade-in" style={{ display:"flex", gap:8, alignItems:"flex-end", marginBottom:16 }}>
                  <div style={{
                    width:30, height:30, borderRadius:8, background:"var(--primary)",
                    display:"flex", alignItems:"center", justifyContent:"center", fontSize:14
                  }}>🧠</div>
                  <div style={{
                    background:"var(--surface2)", border:"1px solid var(--border)",
                    borderRadius:"14px 14px 14px 4px", padding:"12px 16px"
                  }}>
                    <TypingDots />
                  </div>
                </div>
              )}
            </>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input area */}
        <div style={{
          borderTop:"1px solid var(--border)", background:"var(--surface)",
          padding:"10px 12px", paddingBottom:"max(10px, env(safe-area-inset-bottom))",
          flexShrink:0
        }}>
          {/* Image preview */}
          {imagePreview && (
            <div style={{ position:"relative", display:"inline-block", marginBottom:8 }}>
              <img
                src={imagePreview}
                alt="preview"
                style={{ height:64, borderRadius:8, objectFit:"cover" }}
              />
              <button
                onClick={clearImage}
                style={{
                  position:"absolute", top:-6, right:-6, width:20, height:20,
                  borderRadius:"50%", background:"var(--error)", border:"none",
                  color:"white", cursor:"pointer", fontSize:12, display:"flex",
                  alignItems:"center", justifyContent:"center", lineHeight:1
                }}
              >×</button>
            </div>
          )}

          <div style={{ display:"flex", gap:8, alignItems:"flex-end" }}>
            {/* Image upload */}
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              style={{ display:"none" }}
            />
            <button
              onClick={() => fileRef.current?.click()}
              className="btn btn-ghost btn-sm"
              style={{ padding:"10px", flexShrink:0, minHeight:44 }}
              title="Upload image"
            >
              🖼️
            </button>

            {/* Text input */}
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask anything to learn..."
              rows={1}
              style={{
                flex:1, background:"var(--surface2)", border:"1px solid var(--border)",
                borderRadius:12, padding:"11px 14px", color:"var(--text)",
                fontFamily:"var(--font)", fontSize:15, resize:"none", outline:"none",
                maxHeight:120, overflowY:"auto", lineHeight:1.5, minHeight:44,
                WebkitAppearance:"none"
              }}
              onInput={(e) => {
                e.target.style.height = "auto";
                e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
              }}
            />

            {/* Send */}
            <button
              onClick={sendMessage}
              disabled={(!input.trim() && !imageFile) || loading}
              className="btn btn-primary"
              style={{ padding:"10px 14px", flexShrink:0, minHeight:44 }}
            >
              {loading ? <span className="spinner" style={{ width:18, height:18 }} /> : "↑"}
            </button>
          </div>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div className="toast-container">
          <div className={`toast ${toast.type}`}>{toast.msg}</div>
        </div>
      )}
    </div>
  );
}
