import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { jobsApi } from "../../services/jobs";
import { applicationsApi } from "../../services/applications";
import { getAuth } from "../../services/auth";
import { formatDate, formatSalary } from "../../utils/jobFormatters";

/* ── tiny inline modal styles ─────────────────────────────────── */
const overlay = {
  position: "fixed",
  inset: 0,
  zIndex: 1000,
  background: "rgba(0,0,0,0.45)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: 20,
};

const modalBox = {
  background: "var(--card)",
  borderRadius: 22,
  padding: "32px 30px 28px",
  maxWidth: 520,
  width: "100%",
  boxShadow: "0 24px 48px rgba(0,0,0,0.22)",
  position: "relative",
  animation: "fadeUp .25s ease",
};

export default function StudentJobDetails() {
  const { id } = useParams();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /* ── auth check ──────────────────────────────────────────────── */
  const auth = getAuth();
  const isStudent = !!auth.token && auth.role === "STUDENT";

  /* ── apply state ─────────────────────────────────────────────── */
  const [showModal, setShowModal] = useState(false);
  const [coverLetter, setCoverLetter] = useState("");
  const [applying, setApplying] = useState(false);
  const [applied, setApplied] = useState(false);
  const [applyMsg, setApplyMsg] = useState({ type: "", text: "" }); // type: success | error | profile

  const getErrorMessage = (err, fallback) => {
    const data = err?.response?.data;
    if (typeof data === "string") return data;
    return data?.message || data?.error || fallback;
  };

  /* ── load job ─────────────────────────────────────────────────── */
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

    return () => {
      ignore = true;
    };
  }, [id]);

  /* ── submit application ──────────────────────────────────────── */
  const handleApply = async () => {
    try {
      setApplying(true);
      setApplyMsg({ type: "", text: "" });

      await applicationsApi.applyForJob({
        jobId: Number(id),
        coverLetter: coverLetter.trim() || null,
      });

      setApplied(true);
      setShowModal(false);
      setCoverLetter("");
      setApplyMsg({
        type: "success",
        text: "🎉 Your application has been submitted successfully! Status: Pending.",
      });
    } catch (err) {
      const status = err?.response?.status;
      const code = err?.response?.data?.code;
      const message = getErrorMessage(err, "Something went wrong.");

      if (status === 409 && code === "duplicate_application") {
        // already applied – close modal & update button
        setApplied(true);
        setShowModal(false);
        setApplyMsg({ type: "error", text: message });
      } else if (status === 400 && code === "incomplete_profile") {
        // incomplete profile – keep modal open, show guidance
        setApplyMsg({ type: "profile", text: message });
      } else {
        setApplyMsg({ type: "error", text: message });
      }
    } finally {
      setApplying(false);
    }
  };

  /* ── render ──────────────────────────────────────────────────── */
  return (
    <div style={{ minHeight: "calc(100vh - 65px)", background: "var(--bg)", padding: "40px 0 70px" }}>
      <div className="container">
        <Link to="/student/jobs" className="btn btn-ghost" style={{ marginBottom: 18 }}>
          ← Back to jobs
        </Link>

        {loading ? (
          <div className="card" style={{ padding: 26, textAlign: "center", color: "var(--muted)" }}>
            Loading job details...
          </div>
        ) : error ? (
          <div className="alert error">{error}</div>
        ) : !job ? (
          <div className="card" style={{ padding: 26, textAlign: "center" }}>
            Job not found.
          </div>
        ) : (
          <>
            {/* ── job header card ───────────────────────────────── */}
            <div
              className="card"
              style={{
                padding: "28px 28px 24px",
                borderRadius: 24,
                marginBottom: 22,
                boxShadow: "var(--shadow-lg)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 18,
                  alignItems: "flex-start",
                  flexWrap: "wrap",
                  marginBottom: 18,
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

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                  gap: 14,
                }}
              >
                <div className="card" style={{ padding: 16, borderRadius: 16, boxShadow: "none" }}>
                  <div className="helper">Location</div>
                  <div style={{ fontWeight: 700, marginTop: 4 }}>{job.location || "Not specified"}</div>
                </div>

                <div className="card" style={{ padding: 16, borderRadius: 16, boxShadow: "none" }}>
                  <div className="helper">Category</div>
                  <div style={{ fontWeight: 700, marginTop: 4 }}>{job.category || "General"}</div>
                </div>

                <div className="card" style={{ padding: 16, borderRadius: 16, boxShadow: "none" }}>
                  <div className="helper">Salary</div>
                  <div style={{ fontWeight: 700, marginTop: 4 }}>{formatSalary(job.salary)}</div>
                </div>

                <div className="card" style={{ padding: 16, borderRadius: 16, boxShadow: "none" }}>
                  <div className="helper">Deadline</div>
                  <div style={{ fontWeight: 700, marginTop: 4 }}>{formatDate(job.deadline)}</div>
                </div>
              </div>
            </div>

            {/* ── description card ──────────────────────────────── */}
            <div className="card" style={{ padding: 26, borderRadius: 22, marginBottom: 22 }}>
              <h2 style={{ marginBottom: 14 }}>Full description</h2>
              <div
                style={{
                  color: "var(--text)",
                  lineHeight: 1.8,
                  whiteSpace: "pre-wrap",
                  fontSize: 15,
                }}
              >
                {job.description || "No description available."}
              </div>
            </div>

            {/* ── apply message banner ──────────────────────────── */}
            {applyMsg.text && (
              <div
                className={`alert ${applyMsg.type === "success" ? "success" : "error"}`}
                style={{ marginBottom: 18 }}
              >
                <div>{applyMsg.text}</div>
                {applyMsg.type === "profile" && (
                  <Link
                    to="/student/profile"
                    className="btn btn-primary"
                    style={{ marginTop: 12, display: "inline-block" }}
                  >
                    Go to My Profile →
                  </Link>
                )}
              </div>
            )}

            {/* ── apply now button (students only) ──────────────── */}
            {isStudent && (
              <div style={{ display: "flex", justifyContent: "center" }}>
                <button
                  className="btn btn-primary"
                  disabled={applied}
                  onClick={() => {
                    setApplyMsg({ type: "", text: "" });
                    setShowModal(true);
                  }}
                  style={{
                    padding: "14px 44px",
                    fontSize: 17,
                    borderRadius: 14,
                    fontWeight: 700,
                    letterSpacing: 0.5,
                    ...(applied
                      ? { opacity: 0.7, cursor: "not-allowed" }
                      : {}),
                  }}
                >
                  {applied ? "✅ Applied – Pending" : "🚀 Apply Now"}
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* ── apply confirmation modal ───────────────────────────── */}
      {showModal && (
        <div
          style={overlay}
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowModal(false);
          }}
        >
          <div style={modalBox}>
            <button
              onClick={() => setShowModal(false)}
              aria-label="Close"
              style={{
                position: "absolute",
                top: 14,
                right: 18,
                background: "none",
                border: "none",
                fontSize: 22,
                cursor: "pointer",
                color: "var(--muted)",
                lineHeight: 1,
              }}
            >
              ✕
            </button>

            <h2 style={{ marginBottom: 6, color: "var(--primary)" }}>Confirm Application</h2>
            <p className="helper" style={{ marginBottom: 20, lineHeight: 1.6 }}>
              You are applying for <strong style={{ color: "var(--text)" }}>{job?.title}</strong> at{" "}
              <strong style={{ color: "var(--text)" }}>{job?.companyName}</strong>.
            </p>

            <label className="label" htmlFor="coverLetter">
              Cover Letter <span className="helper">(optional)</span>
            </label>
            <textarea
              id="coverLetter"
              className="input"
              rows={5}
              placeholder="Write a short cover letter to stand out..."
              value={coverLetter}
              onChange={(e) => setCoverLetter(e.target.value)}
              style={{ resize: "vertical", marginBottom: 18 }}
            />

            {/* inline error inside modal for profile issues */}
            {applyMsg.type === "profile" && (
              <div className="alert error" style={{ marginBottom: 14 }}>
                <div>{applyMsg.text}</div>
                <Link
                  to="/student/profile"
                  className="btn btn-primary"
                  style={{ marginTop: 10, display: "inline-block", fontSize: 14 }}
                >
                  Go to My Profile →
                </Link>
              </div>
            )}

            {applyMsg.type === "error" && !applied && (
              <div className="alert error" style={{ marginBottom: 14 }}>
                {applyMsg.text}
              </div>
            )}

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
                style={{ minWidth: 130 }}
              >
                {applying ? "Submitting..." : "Submit Application"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}