/**
 * File: src/pages/student/StudentSavedJobs.jsx
 * Purpose: "My Saved Jobs" page – shows jobs bookmarked by the student.
 */
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { localSavedJobs } from "../../services/applications";
import { formatDate } from "../../utils/jobFormatters";
import { Bookmark, Search, MapPin, Clock } from "lucide-react";

export default function StudentSavedJobs() {
  const [savedJobs, setSavedJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading for better UX and fetch from localStorage
    const timer = setTimeout(() => {
      setSavedJobs(localSavedJobs.getAll());
      setLoading(false);
    }, 400);
    return () => clearTimeout(timer);
  }, []);

  const handleRemove = (jobId) => {
    // Use the toggle method (it will remove if it exists)
    // We pass a dummy object with just the id since we only care about removing
    localSavedJobs.toggle({ id: jobId });
    setSavedJobs(localSavedJobs.getAll());
  };

  return (
    <div style={{ background: "var(--bg)", paddingBottom: 80 }}>
      {/* ── Hero ─────────────────────────────────────────── */}
      <div
        style={{
          background: "linear-gradient(135deg, #0A2472 0%, #1a3a8f 100%)",
          padding: "48px 0 60px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute", top: -80, right: -120,
            width: 380, height: 380, borderRadius: "50%",
            background: "rgba(255,107,107,0.06)",
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
          <div style={{ marginBottom: 20 }}>
            <Link
              to="/student/home"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                color: "rgba(255,255,255,0.7)",
                fontSize: 14,
                fontWeight: 500,
                transition: "color 0.15s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "white")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.7)")}
            >
              ← Back to Dashboard
            </Link>
          </div>

          <div style={{ maxWidth: 620 }}>
            <div
              className="badge"
              style={{
                background: "rgba(255,255,255,0.12)",
                color: "white",
                marginBottom: 14,
                border: "1px solid rgba(255,255,255,0.18)",
              }}
            >
              <Bookmark size={16} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: 4 }} /> Favorites
            </div>
            <h1 style={{ color: "white", fontSize: "clamp(1.8rem, 3.5vw, 2.6rem)", marginBottom: 10 }}>
              My Saved Jobs
            </h1>
            <p style={{ color: "rgba(255,255,255,0.75)", fontSize: 15, maxWidth: 520, lineHeight: 1.7 }}>
              Keep track of roles you're interested in. You can apply whenever you're ready.
            </p>
          </div>
        </div>
      </div>

      <div className="container" style={{ marginTop: 24 }}>
        {loading ? (
          <div style={{ display: "grid", gap: 14 }}>
            {[1, 2].map(i => (
              <div key={i} className="card" style={{ padding: 26, height: 120, background: "var(--card)", borderRadius: 18, opacity: 0.6 }} />
            ))}
          </div>
        ) : savedJobs.length === 0 ? (
          <div
            className="card"
            style={{
              padding: "60px 32px",
              textAlign: "center",
              borderRadius: 22,
              border: "2px dashed var(--border)",
              boxShadow: "none",
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'center', color: 'var(--muted)', marginBottom: 16 }}><Bookmark size={46} /></div>
            <h3 style={{ marginBottom: 10, color: "var(--text)" }}>No saved jobs yet</h3>
            <p className="helper" style={{ maxWidth: 400, margin: "0 auto 24px" }}>
              Found a job you like? Click the bookmark icon to save it for later.
            </p>
            <Link to="/student/jobs" className="btn btn-primary" style={{ fontSize: 15, padding: "13px 32px", display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <Search size={16} /> Browse Jobs
            </Link>
          </div>
        ) : (
          <>
            <div style={{ fontSize: 14, color: "var(--muted)", fontWeight: 500, marginBottom: 18 }}>
              {savedJobs.length} Job{savedJobs.length !== 1 ? "s" : ""} Saved
            </div>

            <div style={{ display: "grid", gap: 14 }}>
              {savedJobs.map((job, idx) => (
                <div
                  key={job.id}
                  className="card"
                  style={{
                    padding: "20px 24px",
                    borderRadius: 18,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: 16,
                    flexWrap: "wrap",
                    animation: `fadeUp .3s ease ${idx * 0.05}s both`,
                  }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                      <Link
                        to={`/student/jobs/${job.id}`}
                        style={{ fontWeight: 750, fontSize: 16, color: "var(--primary)", textDecoration: "none" }}
                        onMouseEnter={e => e.currentTarget.style.textDecoration = "underline"}
                        onMouseLeave={e => e.currentTarget.style.textDecoration = "none"}
                      >
                        {job.title}
                      </Link>
                      <span className="badge badge-teal" style={{ fontSize: 10 }}>{job.type}</span>
                    </div>
                    <div style={{ color: "var(--text)", fontSize: 14, fontWeight: 500, marginBottom: 8 }}>
                      {job.companyName} • <span className="helper" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><MapPin size={14} /> {job.location || "Remote"}</span>
                    </div>
                    <div className="helper" style={{ fontSize: 12, display: 'flex', alignItems: 'center', gap: 4 }}>
                      Saved on {formatDate(job.savedAt)} • <Clock size={12} /> Deadline: {formatDate(job.deadline)}
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: 10 }}>
                    <button
                      onClick={() => handleRemove(job.id)}
                      className="btn btn-ghost"
                      style={{ color: "var(--muted)", padding: "8px 14px", fontSize: 13 }}
                      onMouseEnter={e => e.currentTarget.style.color = "var(--danger)"}
                      onMouseLeave={e => e.currentTarget.style.color = "var(--muted)"}
                    >
                      Remove
                    </button>
                    <Link
                      to={`/student/jobs/${job.id}`}
                      className="btn btn-primary"
                      style={{ padding: "8px 20px", fontSize: 13, borderRadius: 10 }}
                    >
                      Apply Now →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
