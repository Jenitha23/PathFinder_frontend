/**
 * File: src/pages/company/CompanyJobDetails.jsx
 * Purpose: Company page to view a single job posting details
 */
import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import companyJobService from "../../services/companyJobService";
import { formatDate, formatSalary } from "../../utils/jobFormatters";

export default function CompanyJobDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadJob();
  }, [id]);

  const loadJob = async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await companyJobService.getJobById(id);
      setJob(data);
    } catch (err) {
      const status = err?.response?.status;
      const message = err?.response?.data?.message || "Failed to load job details.";
      if (status === 404) {
        setError("Job not found or does not belong to your company.");
      } else {
        setError(message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    const confirmed = window.confirm(`Are you sure you want to delete "${job?.title}"? This action cannot be undone.`);
    if (!confirmed) return;

    setDeleting(true);
    try {
      await companyJobService.deleteJob(id);
      navigate("/company/jobs", { replace: true });
    } catch (err) {
      const message = err?.response?.data?.message || "Failed to delete job.";
      setError(message);
      setDeleting(false);
    }
  };

  const isActive = job && new Date(job.deadline) >= new Date();

  return (
    <div style={{ minHeight: "calc(100vh - 65px)", background: "var(--bg)", paddingBottom: 60 }}>
      {/* Hero Section */}
      <div
        style={{
          background: "linear-gradient(135deg, #0A5F75 0%, #0A2472 100%)",
          padding: "48px 0 60px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: -80,
            right: -80,
            width: 300,
            height: 300,
            borderRadius: "50%",
            background: "rgba(46,196,182,0.10)",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            opacity: 0.03,
            backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />

        <div className="container" style={{ position: "relative" }}>
          <div style={{ marginBottom: 20 }}>
            <Link
              to="/company/jobs"
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
              ← Back to My Jobs
            </Link>
          </div>

          <div>
            <div
              className="badge"
              style={{
                background: "rgba(255,255,255,0.12)",
                color: "white",
                marginBottom: 14,
                border: "1px solid rgba(255,255,255,0.18)",
              }}
            >
              📄 Job Details
            </div>
            <h1 style={{ color: "white", fontSize: "clamp(1.8rem, 3.5vw, 2.6rem)", marginBottom: 10 }}>
              {loading ? "Loading..." : job?.title}
            </h1>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="container" style={{ marginTop: 24 }}>
        {loading ? (
          <div className="card" style={{ padding: 32, textAlign: "center", color: "var(--muted)" }}>
            Loading job details...
          </div>
        ) : error ? (
          <div className="alert error" style={{ borderRadius: 12 }}>
            ⚠️ {error}
            <div style={{ marginTop: 12 }}>
              <Link to="/company/jobs" className="btn btn-outline btn-sm">
                ← Back to My Jobs
              </Link>
            </div>
          </div>
        ) : job ? (
          <>
            {/* Status Banner */}
            <div
              className="card"
              style={{
                padding: "16px 22px",
                borderRadius: 16,
                marginBottom: 20,
                background: isActive ? "var(--teal-dim)" : "var(--coral-dim)",
                borderColor: isActive ? "rgba(46,196,182,0.3)" : "rgba(255,107,107,0.3)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 20 }}>{isActive ? "✅" : "⏰"}</span>
                <div>
                  <strong>{isActive ? "Active" : "Expired"}</strong>
                  {!isActive && (
                    <span style={{ marginLeft: 8, fontSize: 13, color: "var(--muted)" }}>
                      This job posting has passed its application deadline.
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Main Job Info */}
            <div className="card" style={{ padding: "28px 30px", borderRadius: 22, marginBottom: 20 }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 20, marginBottom: 24 }}>
                <div>
                  <div className="helper" style={{ marginBottom: 4 }}>📍 Location</div>
                  <div style={{ fontWeight: 600 }}>{job.location || "Not specified"}</div>
                </div>
                <div>
                  <div className="helper" style={{ marginBottom: 4 }}>💼 Job Type</div>
                  <div style={{ fontWeight: 600 }}>{job.type || "Not specified"}</div>
                </div>
                <div>
                  <div className="helper" style={{ marginBottom: 4 }}>🗂️ Category</div>
                  <div style={{ fontWeight: 600 }}>{job.category || "General"}</div>
                </div>
                <div>
                  <div className="helper" style={{ marginBottom: 4 }}>💰 Salary</div>
                  <div style={{ fontWeight: 600 }}>{formatSalary(job.salary)}</div>
                </div>
                <div>
                  <div className="helper" style={{ marginBottom: 4 }}>📅 Deadline</div>
                  <div style={{ fontWeight: 600, color: isActive ? "var(--teal)" : "var(--coral)" }}>
                    {formatDate(job.deadline)}
                  </div>
                </div>
                <div>
                  <div className="helper" style={{ marginBottom: 4 }}>📆 Posted On</div>
                  <div style={{ fontWeight: 600 }}>{formatDate(job.createdAt)}</div>
                </div>
              </div>

              <hr className="divider" style={{ margin: "16px 0" }} />

              <h3 style={{ marginBottom: 12, fontSize: 18 }}>Job Description</h3>
              <div style={{ color: "var(--text)", lineHeight: 1.8, whiteSpace: "pre-wrap", marginBottom: 24 }}>
                {job.description || "No description provided."}
              </div>

              <h3 style={{ marginBottom: 12, fontSize: 18 }}>Requirements</h3>
              <div style={{ color: "var(--text)", lineHeight: 1.8, whiteSpace: "pre-wrap" }}>
                {job.requirements || "No requirements specified."}
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
              <Link to="/company/jobs" className="btn btn-outline">
                Back to Jobs
              </Link>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="btn btn-ghost"
                style={{
                  color: "var(--coral)",
                  border: "1.5px solid var(--coral-dim)",
                  opacity: deleting ? 0.6 : 1,
                }}
              >
                {deleting ? "Deleting..." : "Delete Job"}
              </button>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}