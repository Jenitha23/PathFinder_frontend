import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import companyJobService from "../../services/companyjobService";
import { formatDate, formatSalary } from "../../utils/jobFormatters";
import { AlertTriangle, FileText, CheckCircle, Clock, MapPin, Briefcase, Folder, Coins, Calendar, CalendarDays, Edit2 } from "lucide-react";

export default function CompanyJobDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteType, setDeleteType] = useState("soft");

  useEffect(() => {
    loadJob();
  }, [id]);

  const loadJob = async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await companyJobService.getJobById(id);
      console.log("Job data received:", data); // Debug log
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

  const openDeleteModal = () => {
    setDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setDeleteModalOpen(false);
    setDeleteType("soft");
  };

  const confirmDelete = async () => {
    if (!job) return;

    setDeleting(true);
    const hardDelete = deleteType === "hard";
    
    try {
      await companyJobService.deleteJob(id, hardDelete);
      navigate("/company/jobs", { replace: true });
    } catch (err) {
      const message = err?.response?.data?.message || "Failed to delete job.";
      setError(message);
      setDeleting(false);
      closeDeleteModal();
      
      if (err.response?.status === 400 && message.includes("applications")) {
        alert("This job has applications and cannot be permanently deleted. Use Archive instead.");
      }
    }
  };

  const isActive = job && new Date(job.deadline) >= new Date();
  
  // Helper function to get requirements from various possible field names
  const getRequirements = () => {
    if (!job) return "No requirements specified.";
    return job.requirements || job.requirement || job.jobRequirements || job.requiredSkills || "No requirements specified.";
  };

  // Helper function to get responsibilities from various possible field names
  const getResponsibilities = () => {
    if (!job) return "No responsibilities specified.";
    return job.responsibilities || job.responsibility || job.jobResponsibilities || "No responsibilities specified.";
  };

  // Delete Confirmation Modal Component
  const DeleteModal = () => {
    if (!deleteModalOpen) return null;

    return (
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(0, 0, 0, 0.5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000,
          backdropFilter: "blur(4px)",
        }}
        onClick={closeDeleteModal}
      >
        <div
          className="card"
          style={{
            maxWidth: 480,
            width: "90%",
            padding: "28px 24px",
            animation: "fadeUp 0.2s ease",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <h3 style={{ marginBottom: 12, fontSize: 20, fontWeight: 700 }}>
            Delete "{job?.title}"?
          </h3>
          
          <p style={{ color: "var(--muted)", marginBottom: 20, lineHeight: 1.6 }}>
            Choose how you want to remove this job posting:
          </p>

          <div style={{ marginBottom: 24 }}>
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "12px 16px",
                background: deleteType === "soft" ? "var(--teal-dim)" : "var(--bg)",
                border: `1.5px solid ${deleteType === "soft" ? "var(--teal)" : "var(--border)"}`,
                borderRadius: 12,
                marginBottom: 12,
                cursor: "pointer",
                transition: "all 0.2s",
              }}
              onClick={() => setDeleteType("soft")}
            >
              <input
                type="radio"
                name="deleteType"
                checked={deleteType === "soft"}
                onChange={() => setDeleteType("soft")}
                style={{ width: 18, height: 18, cursor: "pointer" }}
              />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, marginBottom: 4 }}>
                  Archive (Soft Delete)
                </div>
                <div style={{ fontSize: 13, color: "var(--muted)" }}>
                  Job will be archived and no longer visible to students. Can be restored later if needed.
                </div>
              </div>
            </label>

            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "12px 16px",
                background: deleteType === "hard" ? "var(--coral-dim)" : "var(--bg)",
                border: `1.5px solid ${deleteType === "hard" ? "var(--coral)" : "var(--border)"}`,
                borderRadius: 12,
                cursor: "pointer",
                transition: "all 0.2s",
              }}
              onClick={() => setDeleteType("hard")}
            >
              <input
                type="radio"
                name="deleteType"
                checked={deleteType === "hard"}
                onChange={() => setDeleteType("hard")}
                style={{ width: 18, height: 18, cursor: "pointer" }}
              />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, marginBottom: 4 }}>
                  Permanent Delete (Hard Delete)
                </div>
                <div style={{ fontSize: 13, color: "var(--muted)", display: 'flex', gap: 6 }}>
                  <AlertTriangle size={14} style={{ flexShrink: 0, marginTop: 2 }} /> Permanently remove from database. Only works if no students have applied to this job.
                </div>
              </div>
            </label>
          </div>

          {deleteType === "hard" && (
            <div
              style={{
                background: "var(--coral-dim)",
                padding: "12px",
                borderRadius: 10,
                marginBottom: 20,
                fontSize: 13,
                color: "var(--coral)",
              }}
            >
              <div style={{ display: 'flex', gap: 6 }}>
                <AlertTriangle size={14} style={{ flexShrink: 0, marginTop: 2 }} /> Warning: This action cannot be undone. If students have already applied to this job, permanent deletion will be blocked.
              </div>
            </div>
          )}

          <div style={{ display: "flex", gap: 12 }}>
            <button
              onClick={confirmDelete}
              className="btn"
              style={{
                flex: 1,
                background: deleteType === "hard" ? "var(--coral)" : "var(--teal)",
                color: "white",
                justifyContent: "center",
              }}
              disabled={deleting}
            >
              {deleting ? "Deleting..." : (deleteType === "hard" ? "Permanently Delete" : "Archive Job")}
            </button>
            <button
              onClick={closeDeleteModal}
              className="btn btn-outline"
              style={{ flex: 1, justifyContent: "center" }}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div style={{ background: "var(--bg)", paddingBottom: 60 }}>
      {/* Delete Modal */}
      <DeleteModal />

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
                textDecoration: "none",
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
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6
              }}
            >
              <FileText size={14} /> Job Details
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
          <div className="alert error" style={{ borderRadius: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><AlertTriangle size={18} /> {error}</div>
            <div style={{ marginTop: 4 }}>
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
                {isActive ? <CheckCircle size={20} /> : <Clock size={20} />}
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
                  <div className="helper" style={{ marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}><MapPin size={14} /> Location</div>
                  <div style={{ fontWeight: 600 }}>{job.location || "Not specified"}</div>
                </div>
                <div>
                  <div className="helper" style={{ marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}><Briefcase size={14} /> Job Type</div>
                  <div style={{ fontWeight: 600 }}>{job.type || job.jobType || "Not specified"}</div>
                </div>
                <div>
                  <div className="helper" style={{ marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}><Folder size={14} /> Category</div>
                  <div style={{ fontWeight: 600 }}>{job.category || "General"}</div>
                </div>
                <div>
                  <div className="helper" style={{ marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}><Coins size={14} /> Salary</div>
                  <div style={{ fontWeight: 600 }}>{formatSalary(job.salary)}</div>
                </div>
                <div>
                  <div className="helper" style={{ marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}><Calendar size={14} /> Deadline</div>
                  <div style={{ fontWeight: 600, color: isActive ? "var(--teal)" : "var(--coral)" }}>
                    {formatDate(job.deadline)}
                  </div>
                </div>
                <div>
                  <div className="helper" style={{ marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}><CalendarDays size={14} /> Posted On</div>
                  <div style={{ fontWeight: 600 }}>{formatDate(job.createdAt)}</div>
                </div>
              </div>

              <hr className="divider" style={{ margin: "16px 0" }} />

              <h3 style={{ marginBottom: 12, fontSize: 18 }}>Job Description</h3>
              <div style={{ color: "var(--text)", lineHeight: 1.8, whiteSpace: "pre-wrap", marginBottom: 24 }}>
                {job.description || "No description provided."}
              </div>

              <h3 style={{ marginBottom: 12, fontSize: 18 }}>Requirements</h3>
              <div style={{ color: "var(--text)", lineHeight: 1.8, whiteSpace: "pre-wrap", marginBottom: 24 }}>
                {getRequirements()}
              </div>

              <h3 style={{ marginBottom: 12, fontSize: 18 }}>Responsibilities</h3>
              <div style={{ color: "var(--text)", lineHeight: 1.8, whiteSpace: "pre-wrap" }}>
                {getResponsibilities()}
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: "flex", gap: 12, justifyContent: "flex-end", flexWrap: "wrap" }}>
              <Link to="/company/jobs" className="btn btn-outline" style={{ textDecoration: "none" }}>
                Back to Jobs
              </Link>
              <Link 
                to={`/company/jobs/${id}/edit`}
                className="btn btn-outline"
                style={{
                  borderColor: "var(--teal)",
                  color: "var(--teal)",
                  textDecoration: "none",
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6
                }}
              >
                Edit Job <Edit2 size={16} />
              </Link>
              <button
                onClick={openDeleteModal}
                disabled={deleting}
                className="btn btn-ghost"
                style={{
                  color: "var(--coral)",
                  border: "1.5px solid var(--coral-dim)",
                  opacity: deleting ? 0.6 : 1,
                }}
              >
                Delete Job
              </button>
            </div>
          </>
        ) : null}
      </div>

      <style>{`
        @keyframes fadeUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}