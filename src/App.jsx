import { useState, useEffect, useRef, useCallback } from "react";

/* ═══════════════════════════════════════════
   HOOKS
═══════════════════════════════════════════ */
function useMouse() {
  const r = useRef({ x: 0, y: 0 });
  const [pos, setPos] = useState({ x: 0, y: 0 });
  useEffect(() => {
    const h = (e) => { r.current = { x: e.clientX, y: e.clientY }; setPos({ x: e.clientX, y: e.clientY }); };
    window.addEventListener("mousemove", h);
    return () => window.removeEventListener("mousemove", h);
  }, []);
  return pos;
}

function useScrollY() {
  const [y, setY] = useState(0);
  useEffect(() => {
    const h = () => setY(window.scrollY);
    window.addEventListener("scroll", h, { passive: true });
    return () => window.removeEventListener("scroll", h);
  }, []);
  return y;
}

function useInView(threshold = 0.12) {
  const ref = useRef(null);
  const [v, setV] = useState(false);
  useEffect(() => {
    const o = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setV(true); o.disconnect(); } }, { threshold });
    if (ref.current) o.observe(ref.current);
    return () => o.disconnect();
  }, []);
  return [ref, v];
}

function useActiveSection(ids) {
  const [a, setA] = useState(ids[0]);
  useEffect(() => {
    const o = new IntersectionObserver((entries) => entries.forEach(e => { if (e.isIntersecting) setA(e.target.id); }), { threshold: 0.25 });
    ids.forEach(id => { const el = document.getElementById(id); if (el) o.observe(el); });
    return () => o.disconnect();
  }, []);
  return a;
}

function useTypewriter(words) {
  const [display, setDisplay] = useState("");
  const [wi, setWi] = useState(0);
  const [ci, setCi] = useState(0);
  const [del, setDel] = useState(false);
  useEffect(() => {
    const w = words[wi];
    let t;
    if (!del && ci < w.length) t = setTimeout(() => setCi(c => c + 1), 70);
    else if (!del) t = setTimeout(() => setDel(true), 2600);
    else if (del && ci > 0) t = setTimeout(() => setCi(c => c - 1), 38);
    else { setDel(false); setWi(i => (i + 1) % words.length); }
    return () => clearTimeout(t);
  }, [ci, del, wi]);
  useEffect(() => setDisplay(words[wi].slice(0, ci)), [ci, wi]);
  return display;
}

function useCountUp(n, active) {
  const [v, setV] = useState(0);
  useEffect(() => {
    if (!active) return;
    let s = null, raf;
    const step = (ts) => { if (!s) s = ts; const p = Math.min((ts - s) / 1600, 1); setV(Math.floor(p * n)); if (p < 1) raf = requestAnimationFrame(step); };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [active, n]);
  return v;
}

/* ═══════════════════════════════════════════
   DATA
═══════════════════════════════════════════ */
const WORDS = ["Computer Vision", "Deep Learning", "Object Detection", "Neural Networks", "ML Pipelines"];

const PROJECTS = [
  { id: 1, icon: "🪖", title: "Helmet Detection", cat: "Computer Vision", desc: "Real-time safety system detecting helmet usage in live video with sub-30ms latency. Custom post-processing eliminates temporal flicker and false positives.", tech: ["OpenCV", "YOLO", "Python", "CNN"], metrics: [{v:"30ms",l:"Latency"},{v:"Live",l:"Inference"},{v:"Low FP",l:"Precision"}], color: "#00E5FF" },
  { id: 2, icon: "🧠", title: "Emotion Engine", cat: "Deep Learning", desc: "CNN classifier on FER-2013 (35k+ images) achieving 92% validation accuracy across 7 emotion classes with augmentation-driven generalization.", tech: ["TensorFlow", "Keras", "CNN", "OpenCV"], metrics: [{v:"92%",l:"Accuracy"},{v:"35k+",l:"Images"},{v:"7",l:"Classes"}], color: "#BF5FFF" },
  { id: 3, icon: "📊", title: "Churn Predictor", cat: "ML Pipeline", desc: "End-to-end pipeline on 7,043 telecom customers. Feature engineering + ensemble stacking yields 87% accuracy and 0.88 ROC-AUC.", tech: ["Scikit-learn", "Pandas", "Random Forest"], metrics: [{v:"87%",l:"Accuracy"},{v:"0.88",l:"ROC-AUC"},{v:"7k+",l:"Customers"}], color: "#00FF9D" },
  { id: 4, icon: "🌀", title: "Cluster Analysis", cat: "Unsupervised ML", desc: "DBSCAN density clustering with t-SNE dimensionality reduction — revealing high-dimensional patterns invisible to conventional k-means.", tech: ["DBSCAN", "t-SNE", "NumPy", "Matplotlib"], metrics: [{v:"t-SNE",l:"Reduction"},{v:"DBSCAN",l:"Algorithm"},{v:"2D",l:"Visualised"}], color: "#FF9500" },
  { id: 5, icon: "🏠", title: "Price Predictor", cat: "Regression", desc: "Compared Linear, Ridge and Random Forest regressors with full preprocessing pipeline. R² of 0.89 on residential property data.", tech: ["Ridge Regression", "Random Forest", "Pandas"], metrics: [{v:"0.89",l:"R² Score"},{v:"3",l:"Models"},{v:"Full",l:"Preprocessing"}], color: "#FF3E8A" },
  { id: 6, icon: "🎬", title: "Movie Recommender", cat: "RecSys", desc: "Collaborative filtering recommendation engine analysing user-item behaviour patterns to surface personalised content at scale.", tech: ["Collab Filter", "NumPy", "Scikit-learn"], metrics: [{v:"CF",l:"Algorithm"},{v:"User-Item",l:"Matrix"},{v:"Ranked",l:"Output"}], color: "#FFE500" },
];

const SKILLS = [
  { cat: "Languages",     items: ["Python", "C++", "JavaScript", "SQL"] },
  { cat: "ML / AI",       items: ["TensorFlow", "PyTorch", "Scikit-learn", "Keras"] },
  { cat: "Vision",        items: ["OpenCV", "YOLO", "CNN", "RCNN"] },
  { cat: "Data Science",  items: ["Pandas", "NumPy", "DBSCAN", "t-SNE", "Matplotlib"] },
  { cat: "Tools",         items: ["Git", "Linux", "Colab", "Jupyter"] },
];

/* ═══════════════════════════════════════════
   MAGNETIC BUTTON
═══════════════════════════════════════════ */
function MagBtn({ children, onClick, primary }) {
  const ref = useRef(null);
  const [off, setOff] = useState({ x: 0, y: 0 });
  const onMove = (e) => {
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    setOff({ x: (e.clientX - r.left - r.width / 2) * 0.28, y: (e.clientY - r.top - r.height / 2) * 0.28 });
  };
  return (
    <button ref={ref} onMouseMove={onMove} onMouseLeave={() => setOff({ x: 0, y: 0 })} onClick={onClick}
      style={{
        transform: `translate(${off.x}px,${off.y}px)`,
        transition: "transform 0.22s cubic-bezier(.16,1,.3,1)",
        padding: "14px 36px", borderRadius: 4, fontSize: 13, fontWeight: 700,
        fontFamily: "'Space Grotesk', sans-serif", letterSpacing: 1.5, textTransform: "uppercase",
        cursor: "pointer", border: primary ? "none" : "1px solid rgba(255,255,255,0.2)",
        background: primary ? "#00E5FF" : "transparent",
        color: primary ? "#020408" : "rgba(255,255,255,0.7)",
        boxShadow: primary ? "0 0 40px rgba(0,229,255,0.35)" : "none",
      }}>
      {children}
    </button>
  );
}

/* ═══════════════════════════════════════════
   MORPHING BLOB
═══════════════════════════════════════════ */
function Blob({ color, style }) {
  const ref = useRef(null);
  useEffect(() => {
    let t = 0, raf;
    const animate = () => {
      t += 0.003;
      const r1 = 50 + Math.sin(t * 1.1) * 8;
      const r2 = 50 + Math.cos(t * 0.9) * 10;
      const r3 = 50 + Math.sin(t * 1.3 + 1) * 7;
      const r4 = 50 + Math.cos(t * 0.7 + 2) * 9;
      const r5 = 50 + Math.sin(t * 1.5 + 0.5) * 8;
      const r6 = 50 + Math.cos(t * 1.1 + 1.5) * 10;
      if (ref.current) ref.current.style.borderRadius = `${r1}% ${100-r1}% ${r2}% ${100-r2}% / ${r3}% ${r4}% ${100-r4}% ${100-r3}%`;
      raf = requestAnimationFrame(animate);
    };
    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, []);
  return <div ref={ref} style={{ background: color, filter: "blur(70px)", opacity: 0.12, position: "absolute", ...style }} />;
}

/* ═══════════════════════════════════════════
   CUSTOM CURSOR
═══════════════════════════════════════════ */
function Cursor({ mouse }) {
  const dot = useRef(null);
  const ring = useRef(null);
  const pos = useRef({ x: 0, y: 0 });
  useEffect(() => {
    let raf;
    const lerp = (a, b, t) => a + (b - a) * t;
    const tick = () => {
      pos.current.x = lerp(pos.current.x, mouse.x, 0.1);
      pos.current.y = lerp(pos.current.y, mouse.y, 0.1);
      if (ring.current) ring.current.style.transform = `translate(${pos.current.x - 20}px, ${pos.current.y - 20}px)`;
      if (dot.current) dot.current.style.transform = `translate(${mouse.x - 4}px, ${mouse.y - 4}px)`;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [mouse]);
  return (
    <>
      {/* inner dot — snappy */}
      <div ref={dot} style={{ position: "fixed", width: 8, height: 8, borderRadius: "50%", background: "#00E5FF", zIndex: 9999, pointerEvents: "none", top: 0, left: 0, boxShadow: "0 0 10px rgba(0,229,255,0.8)" }} />
      {/* outer ring — lags behind */}
      <div ref={ring} style={{ position: "fixed", width: 40, height: 40, borderRadius: "50%", border: "1.5px solid rgba(0,229,255,0.55)", zIndex: 9998, pointerEvents: "none", top: 0, left: 0, background: "rgba(0,229,255,0.04)" }} />
    </>
  );
}

/* ═══════════════════════════════════════════
   REVEAL
═══════════════════════════════════════════ */
function R({ children, d = 0, x = 0, y = 40 }) {
  const [ref, v] = useInView();
  return (
    <div ref={ref} style={{ opacity: v ? 1 : 0, transform: v ? "none" : `translate(${x}px,${y}px)`, transition: `opacity .9s cubic-bezier(.16,1,.3,1) ${d}s, transform .9s cubic-bezier(.16,1,.3,1) ${d}s` }}>
      {children}
    </div>
  );
}

/* ═══════════════════════════════════════════
   NOISE + SCANLINES OVERLAY
═══════════════════════════════════════════ */
function Noise() {
  return (
    <>
      <div style={{ position: "fixed", inset: 0, zIndex: 1, pointerEvents: "none", opacity: 0.022, backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`, backgroundSize: "180px" }} />
      <div style={{ position: "fixed", inset: 0, zIndex: 1, pointerEvents: "none", background: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.03) 2px, rgba(0,0,0,0.03) 4px)" }} />
    </>
  );
}

/* ═══════════════════════════════════════════
   COUNTER
═══════════════════════════════════════════ */
function Counter({ n, suffix, label }) {
  const [ref, v] = useInView(0.3);
  const c = useCountUp(n, v);
  return (
    <div ref={ref} style={{ opacity: v ? 1 : 0, transform: v ? "none" : "translateY(20px)", transition: "all .8s ease" }}>
      <div style={{ fontSize: "clamp(40px,5vw,64px)", fontWeight: 900, fontFamily: "'Space Grotesk', sans-serif", color: "#fff", lineHeight: 1, letterSpacing: 2 }}>{c}{suffix}</div>
      <div style={{ fontSize: 11, color: "#3a4a5a", fontWeight: 700, letterSpacing: 2.5, textTransform: "uppercase", marginTop: 6, fontFamily: "'Space Grotesk', sans-serif" }}>{label}</div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   PROJECT CARD
═══════════════════════════════════════════ */
function ProjectCard({ p, i }) {
  const [hov, setHov] = useState(false);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [ref, v] = useInView(0.06);
  const cardRef = useRef(null);

  const onMove = (e) => {
    const r = cardRef.current?.getBoundingClientRect();
    if (!r) return;
    setTilt({
      x: ((e.clientY - r.top - r.height / 2) / r.height) * 7,
      y: -((e.clientX - r.left - r.width / 2) / r.width) * 7,
    });
  };

  return (
    <div
      ref={(el) => { ref.current = el; cardRef.current = el; }}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => { setHov(false); setTilt({ x: 0, y: 0 }); }}
      onMouseMove={onMove}
      style={{
        opacity: v ? 1 : 0,
        transform: v
          ? hov
            ? `perspective(900px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) translateY(-8px) scale(1.02)`
            : "perspective(900px) rotateX(0) rotateY(0) translateY(0) scale(1)"
          : "translateY(36px)",
        transition: v
          ? hov ? "opacity .5s, transform .12s ease-out" : "opacity .5s, transform .55s cubic-bezier(.16,1,.3,1)"
          : `opacity .7s ease ${i * 0.08}s, transform .7s ease ${i * 0.08}s`,
        background: hov
          ? `linear-gradient(145deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))`
          : "rgba(255,255,255,0.025)",
        border: `1px solid ${hov ? p.color + "55" : "rgba(255,255,255,0.07)"}`,
        borderRadius: 20, padding: 28,
        position: "relative", overflow: "hidden",
        cursor: "default", willChange: "transform",
        boxShadow: hov ? `0 24px 60px ${p.color}18` : "none",
      }}
    >
      {/* corner glow */}
      <div style={{ position: "absolute", top: -50, right: -50, width: 180, height: 180, borderRadius: "50%", background: p.color, filter: "blur(80px)", opacity: hov ? 0.2 : 0.055, transition: "opacity .4s", pointerEvents: "none" }} />

      {/* shine sweep */}
      <div style={{ position: "absolute", inset: 0, borderRadius: 20, background: `linear-gradient(110deg, transparent 38%, ${p.color}10 50%, transparent 62%)`, backgroundSize: "200% 100%", backgroundPositionX: hov ? "0%" : "200%", transition: "background-position-x .65s ease", pointerEvents: "none" }} />

      {/* header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
        <div style={{ width: 48, height: 48, borderRadius: 14, background: `${p.color}15`, border: `1px solid ${p.color}35`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>{p.icon}</div>
        <a href="https://github.com/yasmeen-086" target="_blank" rel="noopener noreferrer"
          style={{ fontSize: 11, padding: "5px 14px", borderRadius: 999, border: `1px solid ${hov ? p.color + "55" : "rgba(255,255,255,0.08)"}`, color: hov ? p.color : "#3a4a5a", fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, transition: "all .2s", background: hov ? `${p.color}10` : "transparent", letterSpacing: 0.5 }}>
          GitHub →
        </a>
      </div>

      {/* category */}
      <div style={{ fontSize: 10, color: p.color, fontFamily: "'Space Grotesk', sans-serif", fontWeight: 800, letterSpacing: 2, marginBottom: 8, textTransform: "uppercase" }}>{p.cat}</div>

      {/* title */}
      <h3 style={{ fontSize: 19, fontWeight: 800, color: "#f1f5f9", marginBottom: 12, fontFamily: "'Space Grotesk', sans-serif", lineHeight: 1.25 }}>{p.title}</h3>

      {/* desc */}
      <p style={{ fontSize: 13.5, color: "#4a6a7a", lineHeight: 1.75, marginBottom: 20 }}>{p.desc}</p>

      {/* metrics */}
      <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
        {p.metrics.map(({ v: val, l }) => (
          <div key={l} style={{ flex: 1, textAlign: "center", padding: "9px 6px", borderRadius: 10, background: `${p.color}0b`, border: `1px solid ${p.color}25` }}>
            <div style={{ fontSize: 15, fontWeight: 800, color: p.color, fontFamily: "'Space Grotesk', sans-serif", letterSpacing: 1 }}>{val}</div>
            <div style={{ fontSize: 10, color: "#3a4a5a", marginTop: 3, fontWeight: 700, letterSpacing: .5, fontFamily: "'Space Grotesk', sans-serif" }}>{l}</div>
          </div>
        ))}
      </div>

      {/* tags */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
        {p.tech.map(t => (
          <span key={t} style={{ fontSize: 11, padding: "3px 10px", borderRadius: 999, border: "1px solid rgba(255,255,255,0.07)", color: "#3a4a5a", fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600 }}>{t}</span>
        ))}
      </div>

      {/* bottom accent */}
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, transparent, ${p.color}, transparent)`, opacity: hov ? 1 : 0, transition: "opacity .35s" }} />
    </div>
  );
}

/* ═══════════════════════════════════════════
   SKILL PILL
═══════════════════════════════════════════ */
const PILL_COLORS = ["#00E5FF", "#BF5FFF", "#00FF9D", "#FF9500", "#FF3E8A", "#FFE500"];
function SkillGroup({ group, idx }) {
  const col = PILL_COLORS[idx % PILL_COLORS.length];
  return (
    <R d={idx * 0.08}>
      <div style={{ marginBottom: 36 }}>
        <div style={{ fontSize: 10, fontFamily: "'Space Grotesk', sans-serif", fontWeight: 800, letterSpacing: 3, textTransform: "uppercase", color: col, marginBottom: 14 }}>{group.cat}</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {group.items.map(item => (
            <SkillPill key={item} label={item} color={col} />
          ))}
        </div>
      </div>
    </R>
  );
}

function SkillPill({ label, color }) {
  const [hov, setHov] = useState(false);
  return (
    <span onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        padding: "7px 16px", borderRadius: 3,
        border: `1px solid ${hov ? color : "rgba(255,255,255,0.08)"}`,
        background: hov ? `${color}15` : "rgba(255,255,255,0.02)",
        color: hov ? color : "#5a7a8a",
        fontSize: 12, fontWeight: 700, fontFamily: "'Space Grotesk', sans-serif",
        letterSpacing: 0.5, transition: "all .2s", cursor: "default",
        transform: hov ? "translateY(-2px)" : "none",
      }}>{label}</span>
  );
}

/* ═══════════════════════════════════════════
   AI CHATBOT — PREMIUM
═══════════════════════════════════════════ */
const SUGGESTIONS = [
  "Introduce Yasmeen",
  "Why should we hire her?",
  "What projects has she built?",
  "What are her top skills?",
];

function Chatbot() {
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState([
    { role: "assistant", text: "Hi! 👋 I'm Yasmeen's AI assistant. Ask me anything about her skills, projects, background, or why she'd be a great hire!" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [usedSuggestions, setUsedSuggestions] = useState([]);
  const bottomRef = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs, loading]);

  const SYSTEM = `You are Yasmeen's personal AI portfolio assistant. Answer questions about her concisely and enthusiastically. Keep answers to 2-4 sentences max.

About Yasmeen:
- Final-year Robotics & AI student at Thapar Institute of Engineering & Technology (TIET), Patiala, India
- Specializes in Machine Learning, Computer Vision, and Deep Learning
- Actively looking for ML/Software internships

Skills: Python, C++, JavaScript, SQL, TensorFlow, PyTorch, Scikit-learn, Keras, OpenCV, YOLO, CNN, RCNN, Pandas, NumPy, DBSCAN, t-SNE, Matplotlib, Git, Linux, Google Colab, Jupyter

Projects:
1. Real-Time Helmet Detection — OpenCV, YOLO, CNN, sub-30ms latency, live video inference
2. Emotion Detection Engine — CNN on FER-2013 dataset, 92% accuracy, 7 emotion classes
3. Customer Churn Prediction — 87% accuracy, 0.88 ROC-AUC, 7,043 customers analysed
4. ML Clustering Analysis — DBSCAN + t-SNE visualization of high-dimensional data
5. House Price Prediction — R² of 0.89, compared Ridge Regression & Random Forest
6. Movie Recommendation Engine — Collaborative filtering, user-item matrix

Why hire Yasmeen: She combines strong theoretical foundations with practical deployment skills. She's shipped 6 real ML projects, achieves high accuracy metrics, and is passionate about solving real-world problems with AI.

Contact: yasmeenn00786@gmail.com | github.com/yasmeen-086`;

  const sendMsg = async (text) => {
    const msg = text || input.trim();
    if (!msg || loading) return;
    setInput("");
    if (SUGGESTIONS.includes(msg)) setUsedSuggestions(u => [...u, msg]);
    const newMsgs = [...msgs, { role: "user", text: msg }];
    setMsgs(newMsgs);
    setLoading(true);
    try {
      const history = newMsgs.map(m => ({ role: m.role, content: m.text }));
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history, system: SYSTEM }),
      });
      const data = await res.json();
      const reply = data.reply || "Sorry, couldn't get a response. Try again!";
      setMsgs(m => [...m, { role: "assistant", text: reply }]);
    } catch (err) {
      setMsgs(m => [...m, { role: "assistant", text: "⚠️ Chatbot is being set up. Please check back soon!" }]);
    }
    setLoading(false);
  };

  const availableSuggestions = SUGGESTIONS.filter(s => !usedSuggestions.includes(s));
  const showSuggestions = msgs.length <= 2 && availableSuggestions.length > 0;

  return (
    <>
      {/* ── Announcement banner ── */}
      {!open && (
        <div onClick={() => setOpen(true)} style={{
          position: "fixed", bottom: 104, right: 32, zIndex: 1998,
          display: "flex", alignItems: "center", gap: 12,
          padding: "10px 20px 10px 14px",
          background: "rgba(4,6,15,0.92)", backdropFilter: "blur(16px)",
          border: "1px solid rgba(255,255,255,0.08)", borderRadius: 999,
          cursor: "none", transition: "all .3s",
          boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
          animation: "fadeUp .6s ease .5s both",
        }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(0,229,255,0.3)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; e.currentTarget.style.transform = "none"; }}
        >
          <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#00FF9D", display: "inline-block", boxShadow: "0 0 8px #00FF9D", flexShrink: 0, animation: "pulse 2s ease-in-out infinite" }} />
          <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, color: "#64748b", fontFamily: "'Space Grotesk', sans-serif" }}>NEW</span>
          <span style={{ fontSize: 13, fontWeight: 600, color: "#cbd5e1" }}>Ask my <span style={{ color: "#00E5FF", fontWeight: 800 }}>AI Assistant</span> about my resume & projects</span>
          <span style={{ color: "#64748b", fontSize: 14 }}>→</span>
        </div>
      )}

      {/* ── Floating trigger button ── */}
      <button onClick={() => setOpen(o => !o)} style={{
        position: "fixed", bottom: 32, right: 32, zIndex: 2000,
        width: 58, height: 58, borderRadius: "50%",
        background: open ? "rgba(4,6,15,0.95)" : "linear-gradient(135deg, #00E5FF 0%, #818cf8 50%, #BF5FFF 100%)",
        border: open ? "1px solid rgba(0,229,255,0.3)" : "none",
        display: "flex", alignItems: "center", justifyContent: "center",
        cursor: "none", fontSize: 22,
        boxShadow: open ? "0 0 0 1px rgba(0,229,255,0.2)" : "0 4px 28px rgba(0,229,255,0.4), 0 0 0 6px rgba(0,229,255,0.06)",
        transition: "all .35s cubic-bezier(.16,1,.3,1)",
        transform: open ? "rotate(90deg) scale(0.88)" : "scale(1)",
      }}>
        <span style={{ fontSize: open ? 18 : 22, transition: "font-size .2s" }}>{open ? "✕" : "✦"}</span>
        {/* AI badge */}
        {!open && <div style={{ position: "absolute", top: -2, right: -2, width: 18, height: 18, borderRadius: "50%", background: "#00FF9D", border: "2px solid #020408", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 8, fontWeight: 900, color: "#020408" }}>AI</div>}
      </button>

      {/* ── Chat window ── */}
      <div style={{
        position: "fixed", bottom: 104, right: 32, zIndex: 1999,
        width: "clamp(320px, 92vw, 400px)",
        background: "rgba(6,9,20,0.98)",
        border: "1px solid rgba(0,229,255,0.15)",
        borderRadius: 24, overflow: "hidden",
        backdropFilter: "blur(24px)",
        boxShadow: "0 32px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(0,229,255,0.06)",
        opacity: open ? 1 : 0,
        transform: open ? "translateY(0) scale(1)" : "translateY(16px) scale(0.96)",
        pointerEvents: open ? "auto" : "none",
        transition: "all .4s cubic-bezier(.16,1,.3,1)",
      }}>

        {/* Header */}
        <div style={{ padding: "18px 20px 16px", background: "linear-gradient(135deg, rgba(0,229,255,0.06), rgba(191,95,255,0.04))", borderBottom: "1px solid rgba(255,255,255,0.05)", display: "flex", alignItems: "center", gap: 14 }}>
          {/* Avatar */}
          <div style={{ width: 44, height: 44, borderRadius: "50%", background: "linear-gradient(135deg, #00E5FF22, #BF5FFF33)", border: "1.5px solid rgba(0,229,255,0.35)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0, boxShadow: "0 0 20px rgba(0,229,255,0.15)" }}>✦</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 900, color: "#fff", fontFamily: "'Space Grotesk', sans-serif", letterSpacing: 0.3 }}>Yasmeen's AI Assistant</div>
            <div style={{ fontSize: 11, color: "#4a6a7a", fontWeight: 600, display: "flex", alignItems: "center", gap: 6, marginTop: 2, fontFamily: "'Space Grotesk', sans-serif" }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#00FF9D", display: "inline-block", boxShadow: "0 0 6px #00FF9D" }} />
              Online · Knows everything about my resume
            </div>
          </div>
          <button onClick={() => setOpen(false)} style={{ width: 28, height: 28, borderRadius: "50%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", color: "#64748b", fontSize: 12, cursor: "none", display: "flex", alignItems: "center", justifyContent: "center", transition: "all .2s" }}
            onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.1)"; e.currentTarget.style.color = "#fff"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.05)"; e.currentTarget.style.color = "#64748b"; }}
          >✕</button>
        </div>

        {/* Messages */}
        <div style={{ height: 300, overflowY: "auto", padding: "18px 16px", display: "flex", flexDirection: "column", gap: 14 }}>
          {msgs.map((m, i) => (
            <div key={i} style={{ display: "flex", gap: 10, justifyContent: m.role === "user" ? "flex-end" : "flex-start", alignItems: "flex-end" }}>
              {m.role === "assistant" && (
                <div style={{ width: 28, height: 28, borderRadius: "50%", background: "linear-gradient(135deg, #00E5FF22, #BF5FFF33)", border: "1px solid rgba(0,229,255,0.25)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, flexShrink: 0 }}>✦</div>
              )}
              <div style={{
                maxWidth: "78%", padding: "11px 15px",
                borderRadius: m.role === "user" ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                background: m.role === "user"
                  ? "linear-gradient(135deg, #00E5FF, #818cf8)"
                  : "rgba(255,255,255,0.045)",
                border: m.role === "user" ? "none" : "1px solid rgba(255,255,255,0.07)",
                color: m.role === "user" ? "#020408" : "#c8d8e8",
                fontSize: 13.5, lineHeight: 1.65,
                fontWeight: m.role === "user" ? 700 : 500,
                fontFamily: "'Space Grotesk', sans-serif",
              }}>{m.text}</div>
            </div>
          ))}

          {/* Loading dots */}
          {loading && (
            <div style={{ display: "flex", gap: 10, alignItems: "flex-end" }}>
              <div style={{ width: 28, height: 28, borderRadius: "50%", background: "linear-gradient(135deg, #00E5FF22, #BF5FFF33)", border: "1px solid rgba(0,229,255,0.25)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, flexShrink: 0 }}>✦</div>
              <div style={{ padding: "12px 16px", background: "rgba(255,255,255,0.045)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "18px 18px 18px 4px", display: "flex", gap: 5, alignItems: "center" }}>
                {[0,1,2].map(i => <span key={i} style={{ width: 7, height: 7, borderRadius: "50%", background: "#00E5FF", display: "inline-block", opacity: 0.7, animation: `float ${0.7 + i * 0.18}s ease-in-out infinite alternate` }} />)}
              </div>
            </div>
          )}

          {/* Suggestion chips */}
          {showSuggestions && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 4 }}>
              {availableSuggestions.map(s => (
                <button key={s} onClick={() => sendMsg(s)} style={{
                  padding: "7px 14px", borderRadius: 999, fontSize: 12, fontWeight: 600,
                  background: "transparent", border: "1px solid rgba(0,229,255,0.22)",
                  color: "#94a3b8", cursor: "none", transition: "all .2s",
                  fontFamily: "'Space Grotesk', sans-serif",
                }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(0,229,255,0.5)"; e.currentTarget.style.color = "#00E5FF"; e.currentTarget.style.background = "rgba(0,229,255,0.06)"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(0,229,255,0.22)"; e.currentTarget.style.color = "#94a3b8"; e.currentTarget.style.background = "transparent"; }}
                >{s}</button>
              ))}
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Input area */}
        <div style={{ padding: "12px 14px 16px", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
          <div style={{ display: "flex", gap: 8, background: "rgba(255,255,255,0.035)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, padding: "4px 4px 4px 14px", transition: "border-color .2s" }}
            onFocusCapture={e => { e.currentTarget.style.borderColor = "rgba(0,229,255,0.35)"; }}
            onBlurCapture={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; }}
          >
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") sendMsg(); }}
              placeholder="Ask anything about Yasmeen..."
              style={{ flex: 1, background: "transparent", border: "none", color: "#e2eaf2", fontSize: 13.5, outline: "none", padding: "8px 0", fontFamily: "'Inter', sans-serif", fontWeight: 500 }}
            />
            <button onClick={() => sendMsg()} disabled={loading || !input.trim()} style={{
              width: 38, height: 38, borderRadius: 10, border: "none",
              background: input.trim() ? "linear-gradient(135deg, #00E5FF, #818cf8)" : "rgba(255,255,255,0.04)",
              color: input.trim() ? "#020408" : "#3a4a5a",
              fontSize: 15, cursor: input.trim() ? "none" : "not-allowed",
              transition: "all .2s", display: "flex", alignItems: "center", justifyContent: "center",
              fontWeight: 900, flexShrink: 0,
            }}>↑</button>
          </div>
        </div>
      </div>

      <style>{`@keyframes pulse{0%,100%{box-shadow:0 0 6px #00FF9D}50%{box-shadow:0 0 14px #00FF9D}}`}</style>
    </>
  );
}


export default function Portfolio() {
  const mouse = useMouse();
  const scrollY = useScrollY();
  const typed = useTypewriter(WORDS);
  const active = useActiveSection(["hero", "about", "skills", "projects", "education", "contact"]);
  const [loaded, setLoaded] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", msg: "" });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const navAlpha = Math.min(scrollY / 100, 1);

  useEffect(() => { setTimeout(() => setLoaded(true), 100); }, []);
  const scrollTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  const send = () => { setSending(true); setTimeout(() => { setSending(false); setSent(true); }, 1800); };

  return (
    <div style={{ background: "#0B0F19", minHeight: "100vh", color: "#F8FAFC", fontFamily: "'Inter', sans-serif", overflowX: "hidden", opacity: loaded ? 1 : 0, transition: "opacity .4s", cursor: "none" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700;800&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600;700&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        html{scroll-behavior:smooth}
        ::-webkit-scrollbar{width:2px}::-webkit-scrollbar-track{background:#020408}::-webkit-scrollbar-thumb{background:#00E5FF}
        ::selection{background:rgba(0,229,255,0.2);color:#00E5FF}
        a{text-decoration:none;color:inherit}
        input,textarea,button{font-family:inherit;cursor:none}
        @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-14px)}}
        @keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}
        @keyframes blink{0%,100%{opacity:1}50%{opacity:0}}
        @keyframes glow{0%,100%{text-shadow:0 0 20px rgba(0,229,255,.4)}50%{text-shadow:0 0 60px rgba(0,229,255,.8)}}
        @keyframes scanline{0%{transform:translateY(-100%)}100%{transform:translateY(100vh)}}
        @keyframes marquee{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(30px)}to{opacity:1;transform:translateY(0)}}
        @keyframes gradPulse{0%,100%{opacity:.08}50%{opacity:.16}}
      `}</style>

      <Noise />
      <Cursor mouse={mouse} />

      {/* Progress bar */}
      <div style={{ position: "fixed", top: 0, left: 0, zIndex: 9000, height: 1, background: "linear-gradient(90deg,#00E5FF,#BF5FFF)", width: `${(scrollY / Math.max(1, document.documentElement.scrollHeight - window.innerHeight)) * 100}%`, transition: "width .1s linear" }} />

      {/* ══ NAV ══ */}
      <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 800, height: 60, background: `rgba(11,15,25,${0.4 + navAlpha * 0.5})`, backdropFilter: `blur(${navAlpha * 16}px)`, borderBottom: `1px solid rgba(255,255,255,${0.02 + navAlpha * 0.04})`, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 clamp(20px,5vw,80px)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {/* Creative Y logo — neural node mark */}
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="32" height="32" rx="8" fill="#020408"/>
            <rect width="32" height="32" rx="8" fill="url(#logoGrad)" fillOpacity="0.15"/>
            {/* outer ring */}
            <circle cx="16" cy="16" r="14" stroke="#00E5FF" strokeWidth="0.5" strokeOpacity="0.4"/>
            {/* Y strokes */}
            <line x1="16" y1="16" x2="9" y2="8" stroke="#00E5FF" strokeWidth="2" strokeLinecap="round"/>
            <line x1="16" y1="16" x2="23" y2="8" stroke="#00E5FF" strokeWidth="2" strokeLinecap="round"/>
            <line x1="16" y1="16" x2="16" y2="25" stroke="#00E5FF" strokeWidth="2" strokeLinecap="round"/>
            {/* nodes */}
            <circle cx="9" cy="8" r="2" fill="#00E5FF"/>
            <circle cx="23" cy="8" r="2" fill="#BF5FFF"/>
            <circle cx="16" cy="25" r="2" fill="#00FF9D"/>
            <circle cx="16" cy="16" r="2.5" fill="#020408" stroke="#00E5FF" strokeWidth="1.5"/>
            <defs>
              <linearGradient id="logoGrad" x1="0" y1="0" x2="32" y2="32">
                <stop offset="0%" stopColor="#00E5FF"/>
                <stop offset="100%" stopColor="#BF5FFF"/>
              </linearGradient>
            </defs>
          </svg>
          <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 900, fontSize: 14, color: "#fff", letterSpacing: 2, textTransform: "uppercase" }}>Yasmeen</span>
        </div>
        <div style={{ display: "flex", gap: 0 }}>
          {["about","skills","projects","education","contact"].map(id => (
            <button key={id} onClick={() => scrollTo(id)} style={{ background: "none", border: "none", color: active === id ? "#00E5FF" : "#3a4a5a", fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", padding: "6px 14px", cursor: "none", transition: "color .2s", fontFamily: "'Space Grotesk', sans-serif" }}>{id}</button>
          ))}
        </div>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, color: "#00E5FF", fontFamily: "'Space Grotesk', sans-serif", border: "1px solid rgba(0,229,255,0.3)", padding: "6px 14px", borderRadius: 2 }}>OPEN TO WORK</div>
      </nav>

      {/* ══ HERO ══ */}
      <section id="hero" style={{ minHeight: "100vh", display: "flex", flexDirection: "column", justifyContent: "center", padding: "100px clamp(20px,8vw,120px) 80px", position: "relative", overflow: "hidden" }}>

        {/* AI robot image — full bleed background */}
        <div style={{ position: "absolute", inset: 0, zIndex: 0 }}>
          <img src="/ai-bg.jpg" alt="" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center", display: "block" }} />
          {/* dark gradient overlay so text stays readable */}
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(90deg, rgba(2,4,8,0.93) 0%, rgba(2,4,8,0.75) 50%, rgba(2,4,8,0.4) 100%)" }} />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(2,4,8,1) 0%, transparent 30%)" }} />
        </div>

        {/* subtle grid over image */}
        <div style={{ position: "absolute", inset: 0, zIndex: 1, pointerEvents: "none", backgroundImage: "linear-gradient(rgba(0,229,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(0,229,255,0.04) 1px, transparent 1px)", backgroundSize: "60px 60px", maskImage: "radial-gradient(ellipse 60% 80% at 30% 50%, black 20%, transparent 100%)" }} />

        <div style={{ position: "relative", zIndex: 2, maxWidth: 1000 }}>
          {/* overline */}
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 32, animation: "fadeUp .8s ease .2s both" }}>
            <div style={{ width: 40, height: 1, background: "#00E5FF" }} />
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 3, textTransform: "uppercase", color: "#00E5FF", fontFamily: "'Space Grotesk', sans-serif" }}>Robotics & AI · Thapar Institute</span>
          </div>

          {/* headline */}
          <h1 style={{ fontSize: "clamp(52px,8vw,100px)", fontFamily: "'Space Grotesk', sans-serif", fontWeight: 800, lineHeight: 1.0, letterSpacing: -3, marginBottom: 24, animation: "fadeUp .9s ease .35s both" }}>
            <span style={{ display: "block", color: "#F8FAFC" }}>Building intelligent</span>
            <span style={{ display: "block", fontSize: "clamp(32px,4.5vw,58px)", fontWeight: 700, color: "#00E5FF", letterSpacing: -1, marginTop: 8 }}>
              {typed}<span style={{ animation: "blink 1s step-end infinite", color: "#00E5FF" }}>_</span>
            </span>
          </h1>

          {/* desc */}
          <p style={{ fontSize: "clamp(15px,1.6vw,18px)", color: "#4a6a7a", lineHeight: 1.8, maxWidth: 500, marginBottom: 52, fontWeight: 500, animation: "fadeUp .9s ease .55s both" }}>
            Final-year Robotics & AI undergraduate shipping production-grade machine learning systems — from live CV pipelines to deep learning models that actually work in the real world.
          </p>

          {/* CTAs */}
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap", animation: "fadeUp .9s ease .7s both" }}>
            <MagBtn primary onClick={() => scrollTo("projects")}>View Work</MagBtn>
            <MagBtn onClick={() => scrollTo("contact")}>Contact Me</MagBtn>
          </div>
        </div>

        {/* floating badge */}
        <div style={{ position: "absolute", bottom: 60, right: "clamp(20px,8vw,120px)", animation: "float 5s ease-in-out infinite", zIndex: 3 }}>
          <div style={{ background: "rgba(2,4,8,0.7)", border: "1px solid rgba(0,229,255,0.3)", backdropFilter: "blur(16px)", borderRadius: 4, padding: "20px 28px", textAlign: "center" }}>
            <div style={{ fontSize: 36, fontFamily: "'Space Grotesk', sans-serif", color: "#00E5FF", letterSpacing: 2 }}>6+</div>
            <div style={{ fontSize: 10, color: "#3a4a5a", fontWeight: 700, letterSpacing: 2.5, textTransform: "uppercase" }}>Projects</div>
          </div>
        </div>

        {/* scroll indicator */}
        <div style={{ position: "absolute", bottom: 32, left: "50%", transform: "translateX(-50%)", display: "flex", flexDirection: "column", alignItems: "center", gap: 8, opacity: .5, zIndex: 3 }}>
          <span style={{ fontSize: 9, letterSpacing: 3, fontWeight: 700, textTransform: "uppercase", color: "#3a4a5a" }}>Scroll</span>
          <div style={{ width: 1, height: 40, background: "linear-gradient(to bottom, #00E5FF, transparent)" }} />
        </div>
      </section>

      {/* ══ MARQUEE ══ */}
      <div style={{ overflow: "hidden", borderTop: "1px solid rgba(255,255,255,0.04)", borderBottom: "1px solid rgba(255,255,255,0.04)", padding: "16px 0", background: "rgba(0,229,255,0.03)" }}>
        <div style={{ display: "flex", animation: "marquee 18s linear infinite", whiteSpace: "nowrap" }}>
          {[...Array(2)].map((_, i) => (
            <span key={i} style={{ display: "flex", gap: 0 }}>
              {["Computer Vision", "·", "Deep Learning", "·", "Object Detection", "·", "Neural Networks", "·", "Python", "·", "TensorFlow", "·", "OpenCV", "·", "YOLO", "·", "Scikit-learn", "·"].map((w, j) => (
                <span key={j} style={{ fontSize: 11, fontWeight: 700, letterSpacing: w === "·" ? 0 : 2.5, textTransform: "uppercase", color: w === "·" ? "#00E5FF" : "#1a2a3a", padding: "0 20px", fontFamily: "'Space Grotesk', sans-serif" }}>{w}</span>
              ))}
            </span>
          ))}
        </div>
      </div>

      {/* ══ ABOUT ══ */}
      <section id="about" style={{ padding: "clamp(80px,10vw,140px) clamp(20px,8vw,120px)", position: "relative", zIndex: 2 }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "clamp(40px,6vw,100px)", alignItems: "start" }}>
          <div>
            <R>
              <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: 4, textTransform: "uppercase", color: "#00E5FF", marginBottom: 20, display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ width: 30, height: 1, background: "#00E5FF", display: "inline-block" }} /> About
              </div>
              <h2 style={{ fontSize: "clamp(36px,5vw,64px)", fontFamily: "'Space Grotesk', sans-serif", fontWeight: 900, lineHeight: 1.05, letterSpacing: -2, color: "#fff", marginBottom: 28 }}>
                I make machines<br /><span style={{ color: "#00E5FF" }}>see</span> & <span style={{ color: "#BF5FFF" }}>think</span>
              </h2>
              <p style={{ fontSize: 15, color: "#4a6a7a", lineHeight: 1.9, marginBottom: 18, fontWeight: 500 }}>
                I'm Yasmeen — a final-year Robotics & AI student obsessed with the intersection of perception and intelligence. From real-time video analysis to predictive models deployed in the wild, I build systems that actually ship.
              </p>
              <p style={{ fontSize: 15, color: "#4a6a7a", lineHeight: 1.9, marginBottom: 40, fontWeight: 500 }}>
                Actively hunting ML / Software internship roles where sharp engineering meets real-world impact.
              </p>
              <div style={{ display: "flex", gap: 40 }}>
                {[["📍", "India"], ["🎓", "TIET"]].map(([e, t]) => (
                  <div key={t} style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                    <span style={{ fontSize: 18 }}>{e}</span>
                    <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", color: "#3a4a5a" }}>{t}</span>
                  </div>
                ))}
              </div>
            </R>
          </div>

          {/* right: photo + stats */}
          <div>
            <R d={0.15}>
              {/* Photo */}
              <div style={{ position: "relative", marginBottom: 20 }}>
                <div style={{ borderRadius: 4, overflow: "hidden", border: "1px solid rgba(0,229,255,0.15)", position: "relative", aspectRatio: "3/4", maxHeight: 420 }}>
                  <img
                    src="/yasmeen.jpg"
                    alt="Yasmeen"
                    style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center top", display: "block", filter: "brightness(0.92) contrast(1.05)" }}
                  />
                  {/* cyan overlay tint */}
                  <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,229,255,0.12) 0%, transparent 50%)", pointerEvents: "none" }} />
                </div>
                {/* floating status chip */}
                <div style={{ position: "absolute", bottom: -14, right: 16, background: "rgba(2,4,8,0.92)", backdropFilter: "blur(16px)", border: "1px solid rgba(0,229,255,0.22)", borderRadius: 3, padding: "10px 16px", display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#00FF9D", display: "inline-block", boxShadow: "0 0 8px #00FF9D" }} />
                  <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", color: "#00FF9D", fontFamily: "'Space Grotesk', sans-serif" }}>Open to Work</span>
                </div>
              </div>
            </R>
            <R d={0.25}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1, border: "1px solid rgba(255,255,255,0.05)", borderRadius: 4, overflow: "hidden" }}>
                {[["6+", "Projects"], ["92%", "Best Accuracy"], ["35k+", "Images Trained"], ["4+", "ML Domains"]].map(([n, l], i) => (
                  <div key={l} style={{ padding: "20px 18px", background: i % 2 === 0 ? "rgba(255,255,255,0.015)" : "rgba(0,229,255,0.02)", borderRight: i % 2 === 0 ? "1px solid rgba(255,255,255,0.04)" : "none", borderBottom: i < 2 ? "1px solid rgba(255,255,255,0.04)" : "none" }}>
                    <div style={{ fontSize: 32, fontFamily: "'Space Grotesk', sans-serif", color: "#fff", letterSpacing: 2, lineHeight: 1 }}>{n}</div>
                    <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: "#3a4a5a", marginTop: 5, fontFamily: "'Space Grotesk', sans-serif" }}>{l}</div>
                  </div>
                ))}
              </div>
            </R>
          </div>
        </div>
      </section>

      {/* ══ SKILLS ══ */}
      <section id="skills" style={{ padding: "clamp(80px,10vw,140px) clamp(20px,8vw,120px)", background: "rgba(255,255,255,0.008)", position: "relative", zIndex: 2 }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <R>
            <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: 4, textTransform: "uppercase", color: "#00E5FF", display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
              <span style={{ width: 30, height: 1, background: "#00E5FF", display: "inline-block" }} /> Capabilities
            </div>
            <h2 style={{ fontSize: "clamp(28px,4vw,52px)", fontFamily: "'Space Grotesk', sans-serif", fontWeight: 900, color: "#fff", letterSpacing: -1.5, marginBottom: 60, lineHeight: 1.1 }}>Skills &<br />Expertise</h2>
          </R>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1.4fr", gap: "clamp(40px,6vw,80px)", alignItems: "start" }}>
            {/* Left — description */}
            <R x={-20} y={0}>
              <p style={{ fontSize: 15, color: "#4a6a7a", lineHeight: 1.9, marginBottom: 20, fontWeight: 500 }}>
                I'm a <strong style={{ color: "#cbd5e1" }}>Robotics & AI student at Thapar Institute of Engineering & Technology</strong> with a deep focus on machine learning, computer vision, and intelligent systems.
              </p>
              <p style={{ fontSize: 15, color: "#4a6a7a", lineHeight: 1.9, marginBottom: 20, fontWeight: 500 }}>
                My foundation in algorithms and data structures lets me think structurally — breaking down complex perception problems and building optimised ML pipelines that deploy in the real world.
              </p>
              <p style={{ fontSize: 15, color: "#4a6a7a", lineHeight: 1.9, marginBottom: 36, fontWeight: 500 }}>
                Over time this has evolved into expertise across <strong style={{ color: "#00E5FF" }}>deep learning, object detection, and data-driven decision making.</strong>
              </p>
              <button onClick={() => document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" })} style={{ background: "none", border: "none", color: "#00E5FF", fontSize: 12, fontWeight: 800, letterSpacing: 2.5, textTransform: "uppercase", cursor: "none", display: "flex", alignItems: "center", gap: 8, fontFamily: "'Space Grotesk', sans-serif", padding: 0 }}>
                LET'S BUILD SOMETHING <span>→</span>
              </button>
            </R>
            {/* Right — categorized tags */}
            <R x={20} y={0} d={0.1}>
              <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
                {SKILLS.map((g, i) => (
                  <div key={g.cat}>
                    <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: 2.5, textTransform: "uppercase", color: PILL_COLORS[i % PILL_COLORS.length], marginBottom: 12, fontFamily: "'Space Grotesk', sans-serif" }}>{g.cat}</div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                      {g.items.map(item => <SkillPill key={item} label={item} color={PILL_COLORS[i % PILL_COLORS.length]} />)}
                    </div>
                  </div>
                ))}
              </div>
            </R>
          </div>
        </div>
      </section>

      {/* ══ PROJECTS ══ */}
      <section id="projects" style={{ padding: "clamp(80px,10vw,140px) clamp(20px,8vw,120px)", position: "relative", zIndex: 2 }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <R>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 60, flexWrap: "wrap", gap: 20 }}>
              <div>
                <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: 4, textTransform: "uppercase", color: "#00E5FF", display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                  <span style={{ width: 30, height: 1, background: "#00E5FF", display: "inline-block" }} /> Selected Work
                </div>
                <h2 style={{ fontSize: "clamp(32px,4.5vw,60px)", fontFamily: "'Space Grotesk', sans-serif", fontWeight: 900, color: "#fff", letterSpacing: -2, lineHeight: 1 }}>Projects<br />built</h2>
              </div>
              <div style={{ fontSize: 12, color: "#3a4a5a", fontWeight: 700, letterSpacing: 1.5 }}>0{PROJECTS.length} Total</div>
            </div>
          </R>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 330px), 1fr))", gap: 22 }}>
            {PROJECTS.map((p, i) => <ProjectCard key={p.id} p={p} i={i} />)}
          </div>
        </div>
      </section>

      {/* ══ EDUCATION ══ */}
      <section id="education" style={{ padding: "clamp(80px,10vw,140px) clamp(20px,8vw,120px)", background: "rgba(255,255,255,0.008)", position: "relative", zIndex: 2 }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <R>
            <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: 4, textTransform: "uppercase", color: "#00E5FF", display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
              <span style={{ width: 30, height: 1, background: "#00E5FF", display: "inline-block" }} /> Education
            </div>
            <h2 style={{ fontSize: "clamp(32px,4.5vw,60px)", fontFamily: "'Space Grotesk', sans-serif", fontWeight: 900, color: "#fff", letterSpacing: -2, marginBottom: 60, lineHeight: 1 }}>Academic<br />background</h2>
          </R>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%,420px),1fr))", gap: 2 }}>
            {[
              { year: "2023 – Present", deg: "B.E. Robotics & AI", school: "Thapar Institute of Engineering & Technology", loc: "Patiala, Punjab", note: "ML, CV, DSA, ROS, Applied AI", color: "#00E5FF", icon: "🎓" },
            ].map((e, i) => (
              <R key={e.school} d={i * 0.15}>
                <div style={{ border: `1px solid ${e.color}20`, background: `${e.color}04`, borderRadius: 4, padding: "40px 36px", position: "relative", overflow: "hidden" }}>
                  <div style={{ position: "absolute", top: -30, right: -30, width: 120, height: 120, borderRadius: "50%", background: e.color, filter: "blur(60px)", opacity: .06 }} />
                  <div style={{ fontSize: 32, marginBottom: 20, animation: "float 5s ease-in-out infinite" }}>{e.icon}</div>
                  <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2.5, color: e.color, marginBottom: 12, textTransform: "uppercase", fontFamily: "'Space Grotesk', sans-serif" }}>{e.year}</div>
                  <h3 style={{ fontSize: 22, fontFamily: "'Space Grotesk', sans-serif", fontWeight: 900, color: "#fff", marginBottom: 6, lineHeight: 1.2 }}>{e.deg}</h3>
                  <div style={{ fontSize: 14, color: "#4a6a7a", fontWeight: 600, marginBottom: 20 }}>{e.school} · {e.loc}</div>
                  <div style={{ fontSize: 12, color: "#3a4a5a", padding: "12px 16px", border: "1px solid rgba(255,255,255,0.04)", borderRadius: 3, fontWeight: 600, letterSpacing: 0.3 }}>{e.note}</div>
                </div>
              </R>
            ))}
          </div>
        </div>
      </section>

      {/* ══ CONTACT ══ */}
      <section id="contact" style={{ padding: "clamp(80px,10vw,140px) clamp(20px,8vw,120px)", position: "relative", zIndex: 2 }}>
        <Blob color="#00E5FF" style={{ width: 500, height: 500, top: "10%", right: "-10%", opacity: 0.06 }} />
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <R>
            <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: 4, textTransform: "uppercase", color: "#00E5FF", display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
              <span style={{ width: 30, height: 1, background: "#00E5FF", display: "inline-block" }} /> Contact
            </div>
            <h2 style={{ fontSize: "clamp(40px,7vw,100px)", fontFamily: "'Space Grotesk', sans-serif", fontWeight: 900, color: "#fff", letterSpacing: -3, lineHeight: 0.95, marginBottom: 16 }}>
              Let's work<br /><span style={{ WebkitTextStroke: "2px #00E5FF", color: "transparent" }}>together</span>
            </h2>
            <p style={{ fontSize: 15, color: "#4a6a7a", marginBottom: 60, maxWidth: 400, lineHeight: 1.7, fontWeight: 500 }}>Open to internships, research collaborations, and interesting ML conversations.</p>
          </R>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 60, alignItems: "start" }}>
            {/* links */}
            <R d={0.1}>
              <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {[
                  { icon: "✉", label: "yasmeenn00786@gmail.com", href: "mailto:yasmeenn00786@gmail.com", color: "#00FF9D" },
                  { icon: "⬡", label: "github.com/yasmeen-086", href: "https://github.com/yasmeen-086", color: "#BF5FFF" },
                ].map(({ icon, label, href, color }) => (
                  <a key={label} href={href} target="_blank" rel="noopener noreferrer"
                    style={{ display: "flex", alignItems: "center", gap: 16, padding: "20px 24px", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 4, background: "rgba(255,255,255,0.01)", color, fontSize: 14, fontWeight: 700, transition: "all .2s", letterSpacing: 0.3 }}
                    onMouseEnter={e => { e.currentTarget.style.background = `${color}0a`; e.currentTarget.style.borderColor = `${color}30`; e.currentTarget.style.transform = "translateX(6px)"; }}
                    onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.01)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.05)"; e.currentTarget.style.transform = "none"; }}>
                    <span style={{ fontSize: 20 }}>{icon}</span>
                    <span>{label}</span>
                    <span style={{ marginLeft: "auto", opacity: .3 }}>→</span>
                  </a>
                ))}
              </div>
            </R>

            {/* form */}
            <R d={0.2}>
              {sent ? (
                <div style={{ textAlign: "center", padding: "60px 0" }}>
                  <div style={{ fontSize: 60, marginBottom: 20, animation: "float 3s ease-in-out infinite" }}>🚀</div>
                  <h3 style={{ fontSize: 28, fontFamily: "'Space Grotesk', sans-serif", fontWeight: 900, color: "#00FF9D", marginBottom: 10 }}>Message sent!</h3>
                  <p style={{ color: "#3a4a5a", fontSize: 14, fontWeight: 600 }}>I'll get back to you soon.</p>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    {[["name","Name","text"],["email","Email","email"]].map(([k,ph,t]) => (
                      <input key={k} type={t} placeholder={ph} value={form[k]} onChange={e => setForm(f=>({...f,[k]:e.target.value}))}
                        style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 3, padding: "13px 16px", color: "#e2eaf2", fontSize: 14, outline: "none", transition: "border-color .2s", fontWeight: 500 }}
                        onFocus={e=>{e.target.style.borderColor="rgba(0,229,255,.35)"}} onBlur={e=>{e.target.style.borderColor="rgba(255,255,255,.07)"}}
                      />
                    ))}
                  </div>
                  <textarea placeholder="Your message" rows={5} value={form.msg} onChange={e=>setForm(f=>({...f,msg:e.target.value}))}
                    style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 3, padding: "13px 16px", color: "#e2eaf2", fontSize: 14, outline: "none", resize: "vertical", transition: "border-color .2s", fontWeight: 500 }}
                    onFocus={e=>{e.target.style.borderColor="rgba(0,229,255,.35)"}} onBlur={e=>{e.target.style.borderColor="rgba(255,255,255,.07)"}}
                  />
                  <button onClick={send} disabled={sending||!form.name||!form.email}
                    style={{ padding: "14px", borderRadius: 3, background: sending?"rgba(0,229,255,0.1)":"#00E5FF", border: "none", color: sending?"#00E5FF":"#020408", fontSize: 13, fontWeight: 800, cursor: sending?"not-allowed":"none", letterSpacing: 2, textTransform: "uppercase", boxShadow: sending?"none":"0 0 30px rgba(0,229,255,0.3)", transition: "all .25s" }}>
                    {sending?"Sending…":"Send Message →"}
                  </button>
                </div>
              )}
            </R>
          </div>
        </div>
      </section>

      <Chatbot />

      {/* ══ FOOTER ══ */}
      <footer style={{ padding: "32px clamp(20px,8vw,120px)", borderTop: "1px solid rgba(255,255,255,0.04)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16, position: "relative", zIndex: 2 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <svg width="24" height="24" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="32" height="32" rx="8" fill="#020408"/>
            <circle cx="16" cy="16" r="14" stroke="#00E5FF" strokeWidth="0.5" strokeOpacity="0.3"/>
            <line x1="16" y1="16" x2="9" y2="8" stroke="#00E5FF" strokeWidth="2" strokeLinecap="round"/>
            <line x1="16" y1="16" x2="23" y2="8" stroke="#00E5FF" strokeWidth="2" strokeLinecap="round"/>
            <line x1="16" y1="16" x2="16" y2="25" stroke="#00E5FF" strokeWidth="2" strokeLinecap="round"/>
            <circle cx="9" cy="8" r="2" fill="#00E5FF"/>
            <circle cx="23" cy="8" r="2" fill="#BF5FFF"/>
            <circle cx="16" cy="25" r="2" fill="#00FF9D"/>
            <circle cx="16" cy="16" r="2.5" fill="#020408" stroke="#00E5FF" strokeWidth="1.5"/>
          </svg>
          <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: "#1a2a3a" }}>Yasmeen</span>
        </div>
        <span style={{ fontSize: 11, color: "#1a2a3a", fontWeight: 700, letterSpacing: 1 }}>Built in React · Hosted on Vercel</span>
        <div style={{ display: "flex", gap: 20 }}>
          {["about","skills","projects","education","contact"].map(id => (
            <button key={id} onClick={()=>scrollTo(id)} style={{ background:"none",border:"none",color:"#1a2a3a",fontSize:10,cursor:"none",fontWeight:700,letterSpacing:2,textTransform:"uppercase",transition:"color .2s" }} onMouseEnter={e=>{e.currentTarget.style.color="#00E5FF"}} onMouseLeave={e=>{e.currentTarget.style.color="#1a2a3a"}}>{id}</button>
          ))}
        </div>
      </footer>
    </div>
  );
}
