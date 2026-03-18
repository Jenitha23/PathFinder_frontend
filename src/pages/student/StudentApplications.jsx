/**
 * File: src/pages/student/StudentApplications.jsx
 * Purpose: "My Applications" page – shows all jobs the student has applied for.
 * Features: status badges, filter by status, sort by date, view job details.
 */
import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { applicationsApi } from "../../services/applications";

/* ── Status badge colour mapping ────────────────────── */
const STATUS_STYLES = {
  Pending: { bg: "rgba(255,193,7,0.12)", border: "rgba(255,193,7,0.35)", color: "#9a7b00", icon: "🕐", label: "Pending" },
  Shortlisted: { bg: "rgba(108,92,231,0.10)", border: "rgba(108,92,231,0.30)", color: "#6C5CE7", icon: "⭐", label: "Shortlisted" },
  Accepted: { bg: "rgba(0,184,148,0.10)", border: "rgba(0,184,148,0.30)", color: "#00b894", icon: "✅", label: "Accepted" },
  Rejected: { bg: "rgba(255,107,107,0.10)", border: "rgba(255,107,107,0.30)", color: "#c0392b", icon: "❌", label: "Rejected" },
};

const STATUS_OPTIONS = ["All", "Pending", "Shortlisted", "Accepted", "Rejected"];

function StatusBadge({ status }) {
  const s = STATUS_STYLES[status] || STATUS_STYLES.Pending;
  return (
    <span
      style={{
        background: s.bg,
        border: `1.5px solid ${s.border}`,
        color: s.color,
        borderRadius: 999,
        padding: "5px 14px",
        fontSize: 12,
        fontWeight: 700,
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        letterSpacing: "0.02em",
      }}
    >
      {s.icon} {status}
    </span>
  );
}

function formatDate(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" });
}

/* ── Skeleton loader for cards ──────────────────────── */
function SkeletonCard() {
  return (
    <div
      className="card"
      style={{
        padding: "22px 26px",
        borderRadius: 18,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: 16,
      }}
    >
      <div style={{ flex: 1 }}>
        <div style={{ height: 16, width: "45%", background: "var(--border)", borderRadius: 8, marginBottom: 10 }} />
        <div style={{ height: 14, width: "30%", background: "var(--border)", borderRadius: 8, marginBottom: 10 }} />
        <div style={{ height: 12, width: "55%", background: "var(--border)", borderRadius: 8 }} />
      </div>
      <div style={{ height: 36, width: 100, background: "var(--border)", borderRadius: 999 }} />
    </div>
  );
}

export default function StudentApplications() {
  const [searchParams] = useSearchParams();
  const initialStatus = searchParams.get("status");
  const validStatuses = ["Pending", "Shortlisted", "Accepted", "Rejected"];

  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState(
    validStatuses.includes(initialStatus) ? initialStatus : "All"
  );
  const [sortBy, setSortBy] = useState("date_desc");
  const [totalCount, setTotalCount] = useState(0);

  /* ── Fetch applications whenever filter / sort changes ── */
  useEffect(() => {
    let cancelled = false;

    const fetchApplications = async () => {
      setLoading(true);
      setError("");
      try {
        const params = { sortBy };
        if (statusFilter !== "All") params.status = statusFilter;

        const { data } = await applicationsApi.getApplications(params);
        if (!cancelled) {
          setApplications(data.applications || []);
        }
      } catch (err) {
        if (!cancelled) {
          const msg =
            err?.response?.data?.message ||
            "Failed to load applications. Please try again.";
          setError(msg);
          setApplications([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchApplications();
    return () => { cancelled = true; };
  }, [statusFilter, sortBy]);

  /* ── Fetch total count (for header) ── */
  useEffect(() => {
    applicationsApi.getApplicationCount()
      .then(({ data }) => setTotalCount(data.count ?? 0))
      .catch(() => { });
  }, []);

  return (
    <div style={{ minHeight: "calc(100vh - 65px)", background: "var(--bg)", paddingBottom: 80 }}>
      {/* ── Hero ─────────────────────────────────────────── */}
      <div
        style={{
          background: "linear-gradient(135deg, #0A2472 0%, #1a3a8f 60%, #0d2e7a 100%)",
          padding: "48px 0 40px",
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
            position: "absolute", bottom: -100, left: -60,
            width: 260, height: 260, borderRadius: "50%",
            background: "rgba(108,92,231,0.08)",
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
          {/* Top row: Back link */}
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

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 20 }}>
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
                📋 Application Tracker
              </div>
              <h1 style={{ color: "white", fontSize: "clamp(1.8rem, 3.5vw, 2.6rem)", marginBottom: 10 }}>
                My Job Applications
              </h1>
              <p style={{ color: "rgba(255,255,255,0.75)", fontSize: 15, maxWidth: 520, lineHeight: 1.7 }}>
                Track every job you've applied for and monitor your status updates.
              </p>
            </div>

            {/* Total count summary card */}
            <div
              style={{
                background: "rgba(255,255,255,0.1)",
                backdropFilter: "blur(12px)",
                border: "1px solid rgba(255,255,255,0.15)",
                borderRadius: 16,
                padding: "18px 24px",
                textAlign: "center",
                minWidth: 140,
              }}
            >
              <div
                style={{
                  fontSize: 32,
                  fontWeight: 900,
                  color: "white",
                  fontFamily: "'Sora', sans-serif",
                  lineHeight: 1,
                }}
              >
                {loading ? "…" : totalCount}
              </div>
              <div style={{ fontSize: 13, color: "rgba(255,255,255,0.7)", marginTop: 6, fontWeight: 500 }}>
                Total Applications
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Content ──────────────────────────────────────── */}
      <div className="container" style={{ marginTop: 24 }}>

        {/* ── Filter tabs + Sort controls ─────────────────── */}
        <div
          className="card"
          style={{
            padding: "16px 22px",
            borderRadius: 16,
            marginBottom: 20,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          {/* Status filter tabs */}
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {STATUS_OPTIONS.map((s) => {
              const isActive = statusFilter === s;
              const sStyle = s !== "All" ? STATUS_STYLES[s] : null;
              return (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  style={{
                    padding: "8px 18px",
                    borderRadius: 999,
                    border: isActive
                      ? `2px solid ${sStyle ? sStyle.color : "var(--primary)"}`
                      : "1.5px solid var(--border)",
                    background: isActive
                      ? (sStyle ? sStyle.bg : "var(--primary)")
                      : "transparent",
                    color: isActive
                      ? (sStyle ? sStyle.color : "white")
                      : "var(--muted)",
                    fontWeight: 600,
                    fontSize: 13,
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.borderColor = sStyle ? sStyle.color : "var(--primary)";
                      e.currentTarget.style.background = sStyle ? sStyle.bg : "var(--primary-dim)";
                      e.currentTarget.style.color = sStyle ? sStyle.color : "var(--primary)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.borderColor = "var(--border)";
                      e.currentTarget.style.background = "transparent";
                      e.currentTarget.style.color = "var(--muted)";
                    }
                  }}
                >
                  {s === "All" ? "📋 All" : `${sStyle?.icon || ""} ${s}`}
                </button>
              );
            })}
          </div>

          {/* Sort control */}
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 13, color: "var(--muted)", fontWeight: 500 }}>Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={{
                padding: "8px 14px",
                borderRadius: 10,
                border: "1.5px solid var(--border)",
                background: "white",
                color: "var(--text)",
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
                outline: "none",
                transition: "border-color 0.2s",
              }}
              onFocus={(e) => (e.currentTarget.style.borderColor = "var(--teal)")}
              onBlur={(e) => (e.currentTarget.style.borderColor = "var(--border)")}
            >
              <option value="date_desc">Latest First</option>
              <option value="date_asc">Oldest First</option>
            </select>
          </div>
        </div>

        {/* ── Info note ──────────────────────────────────── */}
        <div
          className="alert info"
          style={{
            marginBottom: 20,
            borderRadius: 12,
            display: "flex",
            gap: 10,
            alignItems: "center",
            fontSize: 13,
          }}
        >
          <span style={{ fontSize: 16 }}>ℹ️</span>
          Application statuses are updated by companies. Check back later for updates.
        </div>

        {/* ── Error state ──────────────────────────────── */}
        {error && (
          <div
            className="alert error"
            style={{ marginBottom: 20, borderRadius: 12, display: "flex", gap: 10, alignItems: "center" }}
          >
            <span style={{ fontSize: 16 }}>⚠️</span>
            <span style={{ fontSize: 13 }}>{error}</span>
          </div>
        )}

        {/* ── Loading skeleton ──────────────────────────── */}
        {loading && (
          <div style={{ display: "grid", gap: 14 }}>
            {[0, 1, 2].map((i) => (
              <div key={i} style={{ animation: `fadeUp .3s ease ${i * 0.08}s both` }}>
                <SkeletonCard />
              </div>
            ))}
          </div>
        )}

        {/* ── Empty state ───────────────────────────────── */}
        {!loading && !error && applications.length === 0 && (
          <div
            className="card"
            style={{
              padding: "60px 32px",
              textAlign: "center",
              borderRadius: 22,
              border: "2px dashed var(--border)",
              boxShadow: "none",
              animation: "fadeUp .4s ease both",
            }}
          >
            <div style={{ fontSize: 56, marginBottom: 16 }}>📭</div>
            <h3 style={{ marginBottom: 10, color: "var(--text)" }}>
              {statusFilter !== "All"
                ? `No ${statusFilter.toLowerCase()} applications`
                : "No applications yet"}
            </h3>
            <p className="helper" style={{ maxWidth: 400, margin: "0 auto 24px" }}>
              {statusFilter !== "All"
                ? `You don't have any ${statusFilter.toLowerCase()} applications at the moment. Try another filter.`
                : "Browse open positions and click \"Apply Now\" on any job you're interested in."}
            </p>
            {statusFilter !== "All" ? (
              <button
                className="btn btn-outline"
                style={{ fontSize: 15, padding: "13px 32px" }}
                onClick={() => setStatusFilter("All")}
              >
                📋 View All Applications
              </button>
            ) : (
              <Link to="/student/jobs" className="btn btn-primary" style={{ fontSize: 15, padding: "13px 32px" }}>
                🔍 Browse Jobs
              </Link>
            )}
          </div>
        )}

        {/* ── Application cards ─────────────────────────── */}
        {!loading && !error && applications.length > 0 && (
          <>
            {/* Results count */}
            <div style={{ fontSize: 13, color: "var(--muted)", fontWeight: 500, marginBottom: 14 }}>
              Showing {applications.length} {statusFilter !== "All" ? statusFilter.toLowerCase() : ""} application{applications.length !== 1 ? "s" : ""}
            </div>

            <div style={{ display: "grid", gap: 14 }}>
              {applications.map((app, idx) => (
                <div
                  key={app.applicationId ?? idx}
                  className="card"
                  style={{
                    padding: "22px 26px",
                    borderRadius: 18,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: 16,
                    flexWrap: "wrap",
                    transition: "box-shadow 0.25s ease, transform 0.25s ease",
                    cursor: "default",
                    animation: `fadeUp .35s ease ${idx * 0.05}s both`,
                    borderLeft: `4px solid ${(STATUS_STYLES[app.status] || STATUS_STYLES.Pending).border}`,
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.boxShadow = "var(--shadow-lg)";
                    e.currentTarget.style.transform = "translateY(-2px)";
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
                        {app.jobTitle}
                      </span>
                      {app.jobType && (
                        <span className="badge badge-primary" style={{ fontSize: 11 }}>
                          {app.jobType}
                        </span>
                      )}
                    </div>
                    <div style={{ color: "var(--muted)", fontSize: 14, marginBottom: 10 }}>
                      🏢 {app.companyName}
                      {app.location && <span style={{ marginLeft: 14 }}>📍 {app.location}</span>}
                    </div>
                    <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
                      <StatusBadge status={app.status || "Pending"} />
                      <span className="helper" style={{ fontSize: 12 }}>
                        📅 Applied on {formatDate(app.appliedDate)}
                      </span>
                      {app.applicationId && (
                        <span
                          className="helper"
                          style={{
                            fontSize: 11,
                            background: "var(--bg)",
                            padding: "2px 8px",
                            borderRadius: 6,
                            border: "1px solid var(--border)",
                          }}
                        >
                          Ref #{app.applicationId}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* right: view job link */}
                  {app.jobId && (
                    <Link
                      to={`/student/jobs/${app.jobId}`}
                      state={{ fromApplications: true, applicationStatus: app.status }}
                      className="btn btn-outline"
                      style={{
                        fontSize: 13,
                        flexShrink: 0,
                        borderRadius: 12,
                      }}
                    >
                      View Job →
                    </Link>
                  )}
                </div>
              ))}
            </div>
          </>
        )}

        {/* browse more */}
        {!loading && applications.length > 0 && (
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
