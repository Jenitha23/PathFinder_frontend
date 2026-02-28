/**
 * File: src/pages/student/StudentHome.jsx
 * Purpose: Student-facing page for authentication and workflow.
 */
import { Link } from "react-router-dom";
import { getAuth } from "../../services/auth";

// Real data only — zeros are honest placeholders until API is connected
const DASHBOARD_ACTIONS = [
  {
    icon: "👤",
    title: "Complete your profile",
    desc: "Add your skills, education, and a short bio to stand out to companies.",
    action: "Edit Profile",
  },
  {
    icon: "📄",
    title: "Upload your CV",
    desc: "Attach a PDF resume so companies can learn more about you when you apply.",
    action: "Upload CV",
  },
  {
    icon: "🔍",
    title: "Browse job listings",
    desc: "Search and filter available internship and job opportunities on the platform.",
    action: "Browse Jobs",
  },
];

// Renders the StudentHome component.
export default function StudentHome() {
  const auth = getAuth();
  const firstName = auth.fullName ? auth.fullName.split(" ")[0] : "Student";

  // Fetches or derives data needed for this section.
  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  };

  // These will be replaced with real API data in a future sprint
  const stats = [
    { label: "Applications Sent", value: "—", icon: "📋", color: "var(--primary)", bg: "var(--primary-dim)", note: "Coming soon" },
    { label: "Saved Jobs", value: "—", icon: "🔖", color: "#FF9F1C", bg: "rgba(255,159,28,0.10)", note: "Coming soon" },
    { label: "Interviews", value: "—", icon: "🎯", color: "#FF6B6B", bg: "var(--coral-dim)", note: "Coming soon" },
  ];

  return (
    <div className="student-home-page" style={{ minHeight: "calc(100vh - 65px)", background: "var(--bg)", paddingBottom: 60 }}>

      {/* ── Hero strip ─────────────────────────────────── */}
      <div className="student-home-hero" style={{
        background: "linear-gradient(135deg, #0A2472 0%, #1a3a8f 100%)",
        padding: "56px 0 80px", position: "relative", overflow: "hidden",
      }}>
        <div style={{ position: "absolute", top: -80, right: -80, width: 300, height: 300, borderRadius: "50%", background: "rgba(46,196,182,0.10)" }} />
        <div style={{ position: "absolute", inset: 0, opacity: 0.03, backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "28px 28px" }} />

        <div className="container" style={{ position: "relative" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
            <div style={{
              width: 72, height: 72, borderRadius: 22, background: "#2EC4B6",
              display: "grid", placeItems: "center",
              fontWeight: 900, fontSize: 28, color: "white",
              fontFamily: "'Sora', sans-serif", flexShrink: 0,
            }}>
              {firstName[0].toUpperCase()}
            </div>

            <div>
              <div style={{ fontSize: 15, color: "rgba(255,255,255,0.6)", marginBottom: 6 }}>{getGreeting()},</div>
              <h1 style={{ fontFamily: "'Sora', sans-serif", fontSize: 36, fontWeight: 900, color: "white" }}>
                {auth.fullName || auth.email} 👋
              </h1>
              <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
                <span className="badge" style={{ background: "rgba(46,196,182,0.2)", color: "#2EC4B6", border: "1px solid rgba(46,196,182,0.3)", fontSize: 13, padding: "5px 12px" }}>
                  🎓 Student
                </span>
                <span className="badge" style={{ background: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.7)", fontSize: 13, padding: "5px 12px" }}>
                  {auth.email}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container" style={{ marginTop: -28 }}>

        {/* ── Stat Cards ─────────────────────────────────── */}
        <div className="student-stats-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 28 }}>
          {stats.map((s, i) => (
            <div key={i} className="card animate-fade-up" style={{ padding: "24px 22px", animationDelay: `${i * 0.08}s` }}>
              <div style={{ width: 46, height: 46, borderRadius: 14, background: s.bg, display: "grid", placeItems: "center", fontSize: 22, marginBottom: 16 }}>
                {s.icon}
              </div>
              <div style={{ fontWeight: 900, fontSize: 28, color: "var(--muted)", fontFamily: "'Sora', sans-serif" }}>{s.value}</div>
              <div style={{ fontSize: 14, color: "var(--muted)", marginTop: 4, fontWeight: 500 }}>{s.label}</div>
              <div style={{ fontSize: 11, color: "var(--teal)", marginTop: 4, fontWeight: 600 }}>{s.note}</div>
            </div>
          ))}
        </div>

        <div className="student-main-grid" style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 20 }}>

          {/* ── Next Steps ──────────────────────────────── */}
          <div>
            <div style={{ fontWeight: 800, fontSize: 20, marginBottom: 16, fontFamily: "'Sora', sans-serif" }}>
              Get started — next steps
            </div>
            <div style={{ display: "grid", gap: 14 }}>
              {DASHBOARD_ACTIONS.map((step, i) => (
                <div key={i} className="card animate-fade-up student-action-card" style={{
                  padding: "22px 24px", display: "flex", gap: 18, alignItems: "flex-start",
                  animationDelay: `${0.2 + i * 0.1}s`,
                }}>
                  <div style={{ width: 48, height: 48, borderRadius: 14, background: "var(--primary-dim)", display: "grid", placeItems: "center", fontSize: 24, flexShrink: 0 }}>
                    {step.icon}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 6 }}>{step.title}</div>
                    <p className="helper" style={{ marginBottom: 14, fontSize: 14 }}>{step.desc}</p>
                    <button className="btn btn-outline btn-sm" style={{ fontSize: 13 }}>{step.action} →</button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Profile Card ────────────────────────────── */}
          <div>
            <div style={{ fontWeight: 800, fontSize: 20, marginBottom: 16, fontFamily: "'Sora', sans-serif" }}>
              Your profile
            </div>
            <div className="card animate-fade-up" style={{ padding: "26px 22px", animationDelay: "0.3s" }}>

              {/* Profile completeness — no fake % */}
              <div style={{ marginBottom: 24 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                  <span style={{ fontSize: 15, fontWeight: 600 }}>Profile strength</span>
                  <span style={{ fontSize: 13, color: "var(--muted)", fontWeight: 500 }}>Incomplete</span>
                </div>
                <div style={{ height: 8, background: "var(--bg)", borderRadius: 999, overflow: "hidden" }}>
                  <div style={{
                    height: "100%", width: "15%",
                    background: "linear-gradient(90deg, var(--primary), var(--teal))",
                    borderRadius: 999, transition: "width 1s ease",
                  }} />
                </div>
                <p className="helper" style={{ marginTop: 8, fontSize: 13 }}>
                  Add your skills, education, and CV to strengthen your profile.
                </p>
              </div>

              <hr className="divider" style={{ margin: "0 0 20px" }} />

              <div style={{ display: "grid", gap: 14 }}>
                {[
                  { label: "Full Name", value: auth.fullName || "—" },
                  { label: "Email", value: auth.email || "—" },
                  { label: "Role", value: "Student" },
                  { label: "Member since", value: new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" }) },
                ].map(r => (
                  <div key={r.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 14, color: "var(--muted)" }}>{r.label}</span>
                    <span style={{ fontSize: 14, fontWeight: 600, color: "var(--text)", maxWidth: 180, textAlign: "right", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.value}</span>
                  </div>
                ))}
              </div>

              <button className="btn btn-primary" style={{ width: "100%", justifyContent: "center", marginTop: 22, fontSize: 15 }}>
                Edit Profile →
              </button>
            </div>

            {/* Quick links */}
            <div className="card animate-fade-up" style={{ padding: "20px 22px", marginTop: 16, animationDelay: "0.4s" }}>
              <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 14 }}>Quick links</div>
              <div style={{ display: "grid", gap: 10 }}>
                {[
                  { label: "🔍 Browse Internships", to: "/" },
                  { label: "💼 Browse Jobs", to: "/" },
                  { label: "📩 My Applications", to: "/" },
                ].map(l => (
                  <Link key={l.label} to={l.to}
                    onMouseEnter={e => e.currentTarget.style.background = "var(--primary-dim)"}
                    onMouseLeave={e => e.currentTarget.style.background = "var(--bg)"}
                    style={{
                      display: "flex", alignItems: "center",
                      padding: "12px 14px", borderRadius: 10,
                      background: "var(--bg)", border: "1px solid var(--border)",
                      fontSize: 15, fontWeight: 500, color: "var(--text)", transition: "background 0.15s",
                    }}>
                    {l.label}
                    <span style={{ marginLeft: "auto", color: "var(--muted)" }}>→</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}

