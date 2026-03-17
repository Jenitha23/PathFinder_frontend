import { useState } from "react";
import { Link } from "react-router-dom";
import { localApplications } from "../../services/applications";

function StatusBadge({ status }) {
  const styles = {
    Pending: { bg: "rgba(46,196,182,0.12)", border: "rgba(46,196,182,0.35)", color: "#0f7a72", icon: "🕐" },
    Accepted: { bg: "rgba(10,36,114,0.08)", border: "rgba(10,36,114,0.22)", color: "var(--primary)", icon: "✅" },
    Rejected: { bg: "rgba(255,107,107,0.10)", border: "rgba(255,107,107,0.30)", color: "#c0392b", icon: "❌" },
  };
  const s = styles[status] || styles.Pending;
  return (
    <span
      style={{
        background: s.bg,
        border: `1px solid ${s.border}`,
        color: s.color,
        borderRadius: 999,
        padding: "4px 12px",
        fontSize: 12,
        fontWeight: 700,
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
      }}
    >
      {s.icon} {status}
    </span>
  );
}

function formatDateTime(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" });
}

export default function StudentApplications() {
  const [applications] = useState(() => localApplications.getAll());

  return (
    <div style={{ minHeight: "calc(100vh - 65px)", background: "var(--bg)", paddingBottom: 80 }}>
      {/* ── Hero ─────────────────────────────────────────── */}
      <div
        style={{
          background: "linear-gradient(135deg, #0A2472 0%, #1a3a8f 100%)",
          padding: "54px 0 86px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* decorative blobs */}
        <div
          style={{
            position: "absolute", top: -80, right: -90,
            width: 320, height: 320, borderRadius: "50%",
            background: "rgba(46,196,182,0.10)",
          }}
        />
        <div
          style={{
            position: "absolute", inset: 0, opacity: 0.04,
            backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />

        <div className="container" style={{ position: "relative" }}>
          <div style={{ maxWidth: 720 }}>
            <div
              className="badge"
              style={{
                background: "rgba(255,255,255,0.12)",
                color: "white",
                marginBottom: 18,
                border: "1px solid rgba(255,255,255,0.18)",
              }}
            >
              📋 Application Tracker
            </div>
            <h1 style={{ color: "white", fontSize: "clamp(2rem, 4vw, 3rem)", marginBottom: 14 }}>
              My Job Applications
            </h1>
            <p style={{ color: "rgba(255,255,255,0.82)", fontSize: 16, maxWidth: 600, lineHeight: 1.8 }}>
              Track every job you've applied for. All applications start with a{" "}
              <strong style={{ color: "rgba(255,255,255,0.95)" }}>Pending</strong> status until the company responds.
            </p>
          </div>
        </div>
      </div>

      {/* ── Content ──────────────────────────────────────── */}
      <div className="container" style={{ marginTop: -44 }}>
        {/* stat + back button row */}
        <div
          className="card"
          style={{
            padding: "18px 24px",
            borderRadius: 18,
            marginBottom: 22,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 12,
            boxShadow: "var(--shadow-lg)",
          }}
        >
          <div>
            <h2 style={{ fontSize: 20, marginBottom: 4 }}>
              {applications.length === 0
                ? "No applications yet"
                : `${applications.length} application${applications.length > 1 ? "s" : ""} submitted`}
            </h2>
            <div className="helper">Applications are tracked locally in this browser session</div>
          </div>
          <Link to="/student/home" className="btn btn-ghost">
            ← Back to Dashboard
          </Link>
        </div>

        {/* info note */}
        <div
          className="alert info"
          style={{ marginBottom: 20, borderRadius: 12, display: "flex", gap: 10, alignItems: "flex-start" }}
        >
          <span style={{ fontSize: 16 }}>ℹ️</span>
          <span style={{ fontSize: 13 }}>
            Application statuses are updated by companies. Check back later for updates on your applications.
          </span>
        </div>

        {/* ── Empty state ───────────────────────────────── */}
        {applications.length === 0 ? (
          <div
            className="card"
            style={{
              padding: "56px 32px",
              textAlign: "center",
              borderRadius: 22,
              border: "2px dashed var(--border)",
              boxShadow: "none",
            }}
          >
            <div style={{ fontSize: 56, marginBottom: 16 }}>📭</div>
            <h3 style={{ marginBottom: 10, color: "var(--text)" }}>No applications yet</h3>
            <p className="helper" style={{ maxWidth: 380, margin: "0 auto 24px" }}>
              Browse open positions and click "Apply Now" on any job you're interested in.
            </p>
            <Link to="/student/jobs" className="btn btn-primary" style={{ fontSize: 15, padding: "13px 32px" }}>
              🔍 Browse Jobs
            </Link>
          </div>
        ) : (
          /* ── Application cards ───────────────────────── */
          <div style={{ display: "grid", gap: 14 }}>
            {applications.map((app, idx) => (
              <div
                key={app.jobId ?? idx}
                className="card"
                style={{
                  padding: "20px 24px",
                  borderRadius: 18,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 16,
                  flexWrap: "wrap",
                  transition: "box-shadow 0.2s, transform 0.2s",
                  cursor: "default",
                  animation: `fadeUp .3s ease ${idx * 0.05}s both`,
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.boxShadow = "var(--shadow-lg)";
                  e.currentTarget.style.transform = "translateY(-1px)";
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.boxShadow = "";
                  e.currentTarget.style.transform = "";
                }}
              >
                {/* left: job info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6, flexWrap: "wrap" }}>
                    <span style={{ fontWeight: 700, fontSize: 16, color: "var(--text)" }}>
                      {app.title}
                    </span>
                    {app.type && (
                      <span className="badge badge-primary" style={{ fontSize: 11 }}>
                        {app.type}
                      </span>
                    )}
                  </div>
                  <div style={{ color: "var(--muted)", fontSize: 14, marginBottom: 8 }}>
                    🏢 {app.companyName}
                    {app.location && <span style={{ marginLeft: 12 }}>📍 {app.location}</span>}
                  </div>
                  <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
                    <StatusBadge status={app.status || "Pending"} />
                    <span className="helper" style={{ fontSize: 12 }}>
                      Applied on {formatDateTime(app.appliedAt)}
                    </span>
                    {app.applicationId && (
                      <span className="helper" style={{ fontSize: 12 }}>
                        Ref #{app.applicationId}
                      </span>
                    )}
                  </div>
                </div>

                {/* right: view job link */}
                {app.jobId && (
                  <Link
                    to={`/student/jobs/${app.jobId}`}
                    className="btn btn-outline"
                    style={{ fontSize: 13, flexShrink: 0 }}
                  >
                    View Job →
                  </Link>
                )}
              </div>
            ))}
          </div>
        )}

        {/* browse more */}
        {applications.length > 0 && (
          <div style={{ textAlign: "center", marginTop: 30 }}>
            <Link to="/student/jobs" className="btn btn-ghost">
              🔍 Browse More Jobs
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
