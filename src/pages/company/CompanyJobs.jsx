/**
 * File: src/pages/company/CompanyJobs.jsx
 * Purpose: Company page to view all jobs posted by the authenticated company
 */
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import companyJobService from "../../services/companyJobService";
import { formatDate } from "../../utils/jobFormatters";

export default function CompanyJobs() {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    loadJobs();
  }, []);

  const loadJobs = async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await companyJobService.getCompanyJobs();
      // Handle response structure (could be { jobs: [...] } or direct array)
      const jobsList = data?.jobs || data?.data || (Array.isArray(data) ? data : []);
      setJobs(jobsList);
    } catch (err) {
      const message = err.response?.data?.message || "Failed to load jobs.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleViewJob = (jobId) => {
    navigate(`/company/jobs/${jobId}`);
  };

  const handleDeleteJob = async (jobId, jobTitle) => {
    const confirmed = window.confirm(`Are you sure you want to delete "${jobTitle}"? This action cannot be undone.`);
    if (!confirmed) return;

    setDeletingId(jobId);
    try {
      await companyJobService.deleteJob(jobId);
      setJobs(jobs.filter(job => job.id !== jobId));
    } catch (err) {
      const message = err.response?.data?.message || "Failed to delete job.";
      setError(message);
    } finally {
      setDeletingId(null);
    }
  };

  const getStatusBadge = (deadline) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const deadlineDate = new Date(deadline);
    
    if (deadlineDate < today) {
      return <span className="badge badge-coral">Expired</span>;
    }
    return <span className="badge badge-teal">Active</span>;
  };

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
              to="/company/dashboard"
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
                📋 My Job Postings
              </div>
              <h1 style={{ color: "white", fontSize: "clamp(1.8rem, 3.5vw, 2.6rem)", marginBottom: 10 }}>
                Manage Your Jobs
              </h1>
              <p style={{ color: "rgba(255,255,255,0.75)", fontSize: 15, maxWidth: 520, lineHeight: 1.7 }}>
                View, manage, and track all the job opportunities you've posted.
              </p>
            </div>

            <Link to="/company/post-job" className="btn btn-teal" style={{ gap: 8 }}>
              + Post New Job
            </Link>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="container" style={{ marginTop: 24 }}>
        {/* Stats Summary */}
        {!loading && jobs.length > 0 && (
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
            <div>
              <span style={{ fontWeight: 700, fontSize: 18 }}>{jobs.length}</span>
              <span style={{ color: "var(--muted)", marginLeft: 8 }}>
                {jobs.length === 1 ? "Job Posted" : "Jobs Posted"}
              </span>
            </div>
            <div style={{ display: "flex", gap: 16 }}>
              <div>
                <span className="badge badge-teal" style={{ marginRight: 8 }}>
                  Active
                </span>
                <span>{jobs.filter(j => new Date(j.deadline) >= new Date()).length}</span>
              </div>
              <div>
                <span className="badge badge-coral" style={{ marginRight: 8 }}>
                  Expired
                </span>
                <span>{jobs.filter(j => new Date(j.deadline) < new Date()).length}</span>
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="alert error" style={{ marginBottom: 20, borderRadius: 12 }}>
            ⚠️ {error}
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div style={{ display: "grid", gap: 14 }}>
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="card"
                style={{
                  padding: 26,
                  height: 140,
                  background: "var(--card)",
                  borderRadius: 18,
                  opacity: 0.6,
                  animation: "pulse 1.5s ease-in-out infinite",
                }}
              />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && jobs.length === 0 && (
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
            <div style={{ fontSize: 56, marginBottom: 16 }}>📭</div>
            <h3 style={{ marginBottom: 10, color: "var(--text)" }}>No jobs posted yet</h3>
            <p className="helper" style={{ maxWidth: 400, margin: "0 auto 24px" }}>
              You haven't posted any jobs. Click the button below to create your first job posting.
            </p>
            <Link to="/company/post-job" className="btn btn-teal" style={{ fontSize: 15, padding: "13px 32px" }}>
              + Post Your First Job
            </Link>
          </div>
        )}

        {/* Jobs List */}
        {!loading && !error && jobs.length > 0 && (
          <div style={{ display: "grid", gap: 14 }}>
            {jobs.map((job, idx) => (
              <div
                key={job.id}
                className="card"
                style={{
                  padding: "22px 26px",
                  borderRadius: 18,
                  transition: "box-shadow 0.25s ease, transform 0.25s ease",
                  animation: `fadeUp .35s ease ${idx * 0.05}s both`,
                  borderLeft: `4px solid ${new Date(job.deadline) >= new Date() ? "var(--teal)" : "var(--coral)"}`,
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
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8, flexWrap: "wrap" }}>
                      <h3 style={{ fontSize: 18, fontWeight: 700, color: "var(--primary)" }}>
                        {job.title}
                      </h3>
                      {getStatusBadge(job.deadline)}
                    </div>
                    
                    <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 12 }}>
                      <span className="helper" style={{ display: "flex", alignItems: "center", gap: 4 }}>
                        📍 {job.location || "Not specified"}
                      </span>
                      <span className="helper" style={{ display: "flex", alignItems: "center", gap: 4 }}>
                        🗂️ {job.category || "General"}
                      </span>
                      <span className="helper" style={{ display: "flex", alignItems: "center", gap: 4 }}>
                        💼 {job.type || "Not specified"}
                      </span>
                    </div>
                    
                    <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                      {job.salary && (
                        <span className="helper" style={{ display: "flex", alignItems: "center", gap: 4 }}>
                          💰 {job.salary}
                        </span>
                      )}
                      <span className="helper" style={{ display: "flex", alignItems: "center", gap: 4 }}>
                        📅 Deadline: {formatDate(job.deadline)}
                      </span>
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                    <button
                      onClick={() => handleViewJob(job.id)}
                      className="btn btn-outline"
                      style={{ fontSize: 13, padding: "8px 16px" }}
                    >
                      View Details →
                    </button>
                    <button
                      onClick={() => handleDeleteJob(job.id, job.title)}
                      disabled={deletingId === job.id}
                      className="btn btn-ghost"
                      style={{
                        fontSize: 13,
                        padding: "8px 16px",
                        color: "var(--coral)",
                        opacity: deletingId === job.id ? 0.5 : 1,
                      }}
                    >
                      {deletingId === job.id ? "Deleting..." : "Delete"}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 0.3; }
        }
      `}</style>
    </div>
  );
}