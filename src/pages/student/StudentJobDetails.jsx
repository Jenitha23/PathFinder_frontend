import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { jobsApi } from "../../services/jobs";
import { applicationsApi, localApplications } from "../../services/applications";
import { getAuth } from "../../services/auth";
import { formatDate, formatSalary } from "../../utils/jobFormatters";

/* ── max cover-letter chars ──────────────────────────── */
const MAX_CL = 1000;

/* ── overlay / modal styles ──────────────────────────── */
const overlay = {
  position: "fixed",
  inset: 0,
  zIndex: 1000,
  background: "rgba(10,20,40,0.55)",
  backdropFilter: "blur(4px)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: 20,
  animation: "fadeIn .18s ease",
};

const modalBox = {
  background: "var(--card)",
  borderRadius: 24,
  padding: "32px 30px 28px",
  maxWidth: 540,
  width: "100%",
  boxShadow: "0 28px 64px rgba(10,36,114,0.20)",
  position: "relative",
  animation: "fadeUp .22s ease",
};

export default function StudentJobDetails() {
  const { id } = useParams();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /* ── auth check ──────────────────────────────────────── */
  const auth = getAuth();
  const isStudent = !!auth.token && auth.role === "STUDENT";

  /* ── apply state ─────────────────────────────────────── */
  const [showModal, setShowModal] = useState(false);
  const [coverLetter, setCoverLetter] = useState("");
  const [applying, setApplying] = useState(false);
  const [applied, setApplied] = useState(() => localApplications.hasApplied(Number(id)));
  const [applyResult, setApplyResult] = useState(null); // { type: "success"|"error"|"profile", text, applicationId? }

  const getErrorMessage = (err, fallback) => {
    const data = err?.response?.data;
    if (typeof data === "string") return data;
    return data?.message || data?.error || fallback;
  };

  /* ── load job ────────────────────────────────────────── */
  useEffect(() => {
    let ignore = false;
    const loadJob = async () => {
      try {
        setLoading(true);
        setError("");
        const { data } = await jobsApi.getJobById(id);
        if (!ignore) setJob(data);
      } catch (err) {
        if (!ignore) setError(getErrorMessage(err, "Failed to load job details."));
      } finally {
        if (!ignore) setLoading(false);
      }
    };
    loadJob();
    return () => { ignore = true; };
  }, [id]);

  /* ── sync applied state when id changes ──────────────── */
  useEffect(() => {
    setApplied(localApplications.hasApplied(Number(id)));
    setApplyResult(null);
  }, [id]);

  /* ── open modal ──────────────────────────────────────── */
  const openModal = () => {
    setApplyResult(null);
    setCoverLetter("");
    setShowModal(true);
  };

  /* ── submit application ──────────────────────────────── */
  const handleApply = async () => {
    try {
      setApplying(true);
      setApplyResult(null);

      const { data } = await applicationsApi.applyForJob({
        jobId: Number(id),
        coverLetter: coverLetter.trim() || null,
      });

      // persist locally
      localApplications.add(job, data.applicationId);

      setApplied(true);
      setShowModal(false);
      setCoverLetter("");
      setApplyResult({
        type: "success",
        text: "Your application has been submitted successfully!",
        applicationId: data.applicationId,
      });
    } catch (err) {
      const status = err?.response?.status;
      const code = err?.response?.data?.code;
      const message = getErrorMessage(err, "Something went wrong. Please try again.");

      if (status === 409 && code === "duplicate_application") {
        setApplied(true);
        setShowModal(false);
        setApplyResult({ type: "error", text: message });
      } else if (status === 400 && code === "incomplete_profile") {
        setApplyResult({ type: "profile", text: message });
      } else {
        setApplyResult({ type: "error", text: message });
      }
    } finally {
      setApplying(false);
    }
  };

  /* ── render ──────────────────────────────────────────── */
  return (
    <div style={{ minHeight: "calc(100vh - 65px)", background: "var(--bg)", padding: "40px 0 80px" }}>
      <div className="container">
        <Link to="/student/jobs" className="btn btn-ghost" style={{ marginBottom: 22 }}>
          ← Back to jobs
        </Link>

        {loading ? (
          <div className="card" style={{ padding: 32, textAlign: "center", color: "var(--muted)" }}>
            <div style={{ fontSize: 32, marginBottom: 10 }}>⏳</div>
            Loading job details...
          </div>
        ) : error ? (
          <div className="alert error">{error}</div>
        ) : !job ? (
          <div className="card" style={{ padding: 26, textAlign: "center" }}>Job not found.</div>
        ) : (
          <>
            {/* ── job header card ─────────────────────────────── */}
            <div
              className="card"
              style={{
                padding: "32px 30px 26px",
                borderRadius: 24,
                marginBottom: 20,
                boxShadow: "var(--shadow-lg)",
                border: "1px solid rgba(10,36,114,0.10)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 18,
                  alignItems: "flex-start",
                  flexWrap: "wrap",
                  marginBottom: 22,
                }}
              >
                <div>
                  <div className="badge badge-primary" style={{ marginBottom: 12 }}>
                    💼 Job Details
                  </div>
                  <h1 style={{ fontSize: "clamp(1.8rem, 4vw, 2.7rem)", marginBottom: 10, color: "var(--primary)" }}>
                    {job.title}
                  </h1>
                  <div style={{ fontSize: 18, fontWeight: 600, color: "var(--text)" }}>
                    {job.companyName}
                  </div>
                </div>
                <span className="badge badge-teal">{job.type || "Open"}</span>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12 }}>
                {[
                  { label: "📍 Location",   value: job.location || "Not specified" },
                  { label: "🗂️ Category",   value: job.category || "General" },
                  { label: "💰 Salary",     value: formatSalary(job.salary) },
                  { label: "📅 Deadline",   value: formatDate(job.deadline) },
                ].map(({ label, value }) => (
                  <div
                    key={label}
                    className="card"
                    style={{ padding: "14px 16px", borderRadius: 14, boxShadow: "none", background: "var(--bg)" }}
                  >
                    <div className="helper" style={{ marginBottom: 4 }}>{label}</div>
                    <div style={{ fontWeight: 700, fontSize: 15 }}>{value}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* ── description card ─────────────────────────────── */}
            <div className="card" style={{ padding: "26px 28px", borderRadius: 22, marginBottom: 22 }}>
              <h2 style={{ marginBottom: 16 }}>Full Description</h2>
              <div style={{ color: "var(--text)", lineHeight: 1.9, whiteSpace: "pre-wrap", fontSize: 15 }}>
                {job.description || "No description available."}
              </div>
            </div>

            {/* ── result banners ────────────────────────────────── */}
            {applyResult && (
              <div
                className={`alert ${applyResult.type === "success" ? "success" : "error"}`}
                style={{ marginBottom: 20, padding: "16px 20px", borderRadius: 14, animation: "fadeUp .3s ease" }}
              >
                {applyResult.type === "success" ? (
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 8 }}>
                      🎉 Application Submitted!
                    </div>
                    <div style={{ marginBottom: 10 }}>{applyResult.text}</div>
                    <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
                      <span
                        style={{
                          background: "rgba(46,196,182,0.18)",
                          color: "#0f7a72",
                          border: "1px solid rgba(46,196,182,0.35)",
                          borderRadius: 999,
                          padding: "4px 14px",
                          fontSize: 13,
                          fontWeight: 700,
                        }}
                      >
                        🕐 Status: Pending
                      </span>
                      {applyResult.applicationId && (
                        <span className="helper">Application #{applyResult.applicationId}</span>
                      )}
                    </div>
                    <Link
                      to="/student/applications"
                      style={{ display: "inline-block", marginTop: 12, fontWeight: 600, color: "#0f7a72", fontSize: 14 }}
                    >
                      View My Applications →
                    </Link>
                  </div>
                ) : applyResult.type === "profile" ? (
                  <div>
                    <div style={{ fontWeight: 700, marginBottom: 6 }}>⚠️ Incomplete Profile</div>
                    <div style={{ marginBottom: 12 }}>{applyResult.text}</div>
                    <Link to="/student/profile" className="btn btn-primary" style={{ fontSize: 14, padding: "10px 20px" }}>
                      Complete My Profile →
                    </Link>
                  </div>
                ) : (
                  <div>{applyResult.text}</div>
                )}
              </div>
            )}

            {/* ── apply now button (students only) ─────────────── */}
            {isStudent && (
              <div style={{ display: "flex", justifyContent: "center", marginTop: 8 }}>
                {applied ? (
                  <div
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 10,
                      background: "rgba(46,196,182,0.12)",
                      border: "1.5px solid rgba(46,196,182,0.35)",
                      borderRadius: 14,
                      padding: "14px 32px",
                      fontWeight: 700,
                      fontSize: 16,
                      color: "#0f7a72",
                    }}
                  >
                    ✅ Applied — Status: Pending
                  </div>
                ) : (
                  <button
                    className="btn btn-primary"
                    onClick={openModal}
                    style={{
                      padding: "15px 48px",
                      fontSize: 17,
                      borderRadius: 14,
                      fontWeight: 700,
                      letterSpacing: 0.4,
                      boxShadow: "0 8px 28px rgba(10,36,114,0.28)",
                      transition: "all 0.2s ease",
                    }}
                    onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 12px 36px rgba(10,36,114,0.38)"; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = "0 8px 28px rgba(10,36,114,0.28)"; }}
                  >
                    🚀 Apply Now
                  </button>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* ── apply confirmation modal ───────────────────────── */}
      {showModal && (
        <div
          style={overlay}
          onClick={e => { if (e.target === e.currentTarget) setShowModal(false); }}
        >
          <div style={modalBox}>
            {/* close */}
            <button
              onClick={() => setShowModal(false)}
              aria-label="Close"
              style={{
                position: "absolute", top: 14, right: 18,
                background: "none", border: "none", fontSize: 20,
                cursor: "pointer", color: "var(--muted)", lineHeight: 1,
                borderRadius: 8, padding: 4,
                transition: "background 0.15s",
              }}
              onMouseEnter={e => { e.currentTarget.style.background = "var(--primary-dim)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "none"; }}
            >
              ✕
            </button>

            {/* header */}
            <div style={{ marginBottom: 20 }}>
              <div className="badge badge-primary" style={{ marginBottom: 10 }}>📋 Confirm Application</div>
              <h2 style={{ color: "var(--primary)", marginBottom: 6 }}>Apply for this Job</h2>
              <p className="helper" style={{ lineHeight: 1.7 }}>
                You're applying for <strong style={{ color: "var(--text)" }}>{job?.title}</strong> at{" "}
                <strong style={{ color: "var(--text)" }}>{job?.companyName}</strong>.
              </p>
            </div>

            {/* checklist */}
            <div
              style={{
                background: "var(--bg)",
                borderRadius: 12,
                padding: "12px 16px",
                marginBottom: 20,
                border: "1px solid var(--border)",
              }}
            >
              {[
                "Your profile (CV & skills) will be verified",
                "Your application status will start as Pending",
                "You can only apply once per job",
              ].map(item => (
                <div key={item} style={{ display: "flex", gap: 8, alignItems: "center", padding: "5px 0", fontSize: 13, color: "var(--muted)" }}>
                  <span style={{ color: "var(--teal)", fontSize: 15 }}>✓</span> {item}
                </div>
              ))}
            </div>

            {/* cover letter */}
            <label className="label" htmlFor="coverLetter">
              Cover Letter <span className="helper">(optional)</span>
            </label>
            <div style={{ position: "relative", marginBottom: 18 }}>
              <textarea
                id="coverLetter"
                className="input"
                rows={5}
                maxLength={MAX_CL}
                placeholder="Write a short cover letter to stand out from other applicants..."
                value={coverLetter}
                onChange={e => setCoverLetter(e.target.value)}
                style={{ resize: "vertical", paddingBottom: 28 }}
                disabled={applying}
              />
              <span
                style={{
                  position: "absolute",
                  bottom: 8,
                  right: 12,
                  fontSize: 11,
                  color: coverLetter.length > MAX_CL * 0.9 ? "var(--coral)" : "var(--muted)",
                }}
              >
                {coverLetter.length}/{MAX_CL}
              </span>
            </div>

            {/* inline errors inside modal */}
            {applyResult?.type === "profile" && (
              <div className="alert error" style={{ marginBottom: 14, borderRadius: 12 }}>
                <div style={{ fontWeight: 600, marginBottom: 6 }}>⚠️ Incomplete Profile</div>
                <div style={{ marginBottom: 10, fontSize: 13 }}>{applyResult.text}</div>
                <Link
                  to="/student/profile"
                  className="btn btn-primary"
                  style={{ fontSize: 13, padding: "9px 18px" }}
                  onClick={() => setShowModal(false)}
                >
                  Complete My Profile →
                </Link>
              </div>
            )}
            {applyResult?.type === "error" && !applied && (
              <div className="alert error" style={{ marginBottom: 14, borderRadius: 12, fontSize: 13 }}>
                {applyResult.text}
              </div>
            )}

            {/* actions */}
            <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
              <button
                className="btn btn-outline"
                onClick={() => setShowModal(false)}
                disabled={applying}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary"
                onClick={handleApply}
                disabled={applying}
                style={{ minWidth: 160, position: "relative" }}
              >
                {applying ? (
                  <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span
                      style={{
                        width: 14, height: 14,
                        border: "2px solid rgba(255,255,255,0.4)",
                        borderTopColor: "white",
                        borderRadius: "50%",
                        display: "inline-block",
                        animation: "spin 0.7s linear infinite",
                      }}
                    />
                    Submitting...
                  </span>
                ) : "Submit Application"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* spinner keyframe */}
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}