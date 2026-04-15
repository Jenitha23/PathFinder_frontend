/**
 * File: src/pages/company/CompanyRankedApplicantsSelect.jsx
 * Purpose: Page to select a job for AI applicant ranking
 */
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import companyJobService from "../../services/companyjobservice";
import { Brain, Briefcase, Search, Inbox, ChevronRight, Users, Calendar, MapPin } from "lucide-react";

export default function CompanyRankedApplicantsSelect() {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    loadJobs();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = jobs.filter(job => 
        job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (job.category && job.category.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setFilteredJobs(filtered);
    } else {
      setFilteredJobs(jobs);
    }
  }, [searchTerm, jobs]);

  const loadJobs = async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await companyJobService.getCompanyJobs();
      const jobsList = data?.jobs || data?.data || (Array.isArray(data) ? data : []);
      setJobs(jobsList);
      setFilteredJobs(jobsList);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load jobs");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectJob = (jobId) => {
    navigate(`/company/jobs/${jobId}/ranked-applicants`);
  };

  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh", paddingBottom: 60 }}>
      {/* Hero Section */}
      <div
        style={{
          background: "linear-gradient(135deg, #0A5F75 0%, #0A2472 100%)",
          padding: "48px 0 60px",
          position: "relative",
          overflow: "hidden",
        }}
      >
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
                textDecoration: "none",
              }}
            >
              ← Back to Dashboard
            </Link>
          </div>

          <div>
            <div
              className="badge"
              style={{
                background: "rgba(46,196,182,0.2)",
                color: "#2EC4B6",
                marginBottom: 14,
                border: "1px solid rgba(46,196,182,0.3)",
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <Brain size={16} /> AI-Powered Ranking
            </div>
            <h1 style={{ color: "white", fontSize: "clamp(1.8rem, 3.5vw, 2.6rem)", marginBottom: 10 }}>
              Select a Job to Rank Applicants
            </h1>
            <p style={{ color: "rgba(255,255,255,0.75)", fontSize: 15, maxWidth: 520 }}>
              Choose a job posting to see AI-ranked applicants based on skill match and CV analysis.
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container" style={{ marginTop: 24 }}>
        {/* Search Bar */}
        <div className="card" style={{ padding: 16, marginBottom: 20 }}>
          <div style={{ position: "relative" }}>
            <Search size={18} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--muted)" }} />
            <input
              type="text"
              className="input"
              placeholder="Search by job title or category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ paddingLeft: 40 }}
            />
          </div>
        </div>

        {error && (
          <div className="alert error" style={{ marginBottom: 20 }}>
            {error}
          </div>
        )}

        {loading ? (
          <div style={{ display: "grid", gap: 14 }}>
            {[1, 2, 3].map(i => (
              <div key={i} className="card" style={{ padding: 24, height: 100 }}>
                <div className="skeleton" style={{ width: "100%", height: "100%" }} />
              </div>
            ))}
          </div>
        ) : filteredJobs.length === 0 ? (
          <div className="card" style={{ padding: 60, textAlign: "center" }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🤖</div>
            <h3 style={{ marginBottom: 8 }}>No Jobs Found</h3>
            <p className="helper">
              {jobs.length === 0 
                ? "You haven't posted any jobs yet. Create a job posting first."
                : "No jobs match your search criteria."}
            </p>
            {jobs.length === 0 && (
              <Link to="/company/post-job" className="btn btn-primary" style={{ marginTop: 16 }}>
                Create Job Posting →
              </Link>
            )}
          </div>
        ) : (
          <div style={{ display: "grid", gap: 12 }}>
            {filteredJobs.map((job, idx) => (
              <div
                key={job.id}
                className="card"
                style={{
                  padding: "20px 24px",
                  borderRadius: 16,
                  transition: "all 0.2s",
                  animation: `fadeUp 0.3s ease ${idx * 0.05}s both`,
                  cursor: "pointer",
                  borderLeft: "4px solid #2EC4B6",
                }}
                onClick={() => handleSelectJob(job.id)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow = "var(--shadow-lg)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "";
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 8 }}>
                      <h3 style={{ fontSize: 18, fontWeight: 700, color: "var(--primary)" }}>
                        {job.title}
                      </h3>
                      <span className="badge" style={{ background: "#EDE9FE", color: "#6D28D9" }}>
                        {job.type || "Full-time"}
                      </span>
                    </div>
                    <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 8 }}>
                      {job.location && (
                        <span className="helper" style={{ display: "flex", alignItems: "center", gap: 4 }}>
                          <MapPin size={14} /> {job.location}
                        </span>
                      )}
                      {job.category && (
                        <span className="helper" style={{ display: "flex", alignItems: "center", gap: 4 }}>
                          <Briefcase size={14} /> {job.category}
                        </span>
                      )}
                    </div>
                    <div className="helper" style={{ fontSize: 13, display: "flex", alignItems: "center", gap: 4 }}>
                      <Calendar size={14} /> Deadline: {new Date(job.deadline).toLocaleDateString()}
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ color: "#2EC4B6", fontWeight: 600 }}>
                      View AI Rankings
                    </span>
                    <ChevronRight size={18} color="#2EC4B6" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
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