/**
 * File: src/pages/company/CompanyApplicants.jsx
 * Purpose: Main page for company to view and manage all job applicants
 * Shows all applications first, then filters by job and status client-side
 */
import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import companyJobService from "../../services/companyjobService";
import companyApplicationsService from "../../services/companyApplicationsService";
import ApplicantDetailsModal from "../../components/company/ApplicantDetailsModal";

export default function CompanyApplicants() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [allApplications, setAllApplications] = useState([]);
  const [filteredApplications, setFilteredApplications] = useState([]);
  const [selectedJobId, setSelectedJobId] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sortBy, setSortBy] = useState("date_desc");
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedApplicant, setSelectedApplicant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loadingJobs, setLoadingJobs] = useState(true);

  // Load company jobs on mount
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/company/login");
      return;
    }
    loadCompanyJobs();
  }, [isAuthenticated, navigate]);

  const loadCompanyJobs = async () => {
    setLoadingJobs(true);
    try {
      const { data } = await companyJobService.getCompanyJobs();
      const jobsList = data?.jobs || data?.data || (Array.isArray(data) ? data : []);
      setJobs(jobsList);
      
      // After loading jobs, load all applications
      if (jobsList.length > 0) {
        await loadAllApplications(jobsList);
      } else {
        setLoading(false);
      }
    } catch (err) {
      console.error("Failed to load jobs:", err);
      setError("Failed to load jobs. Please refresh the page.");
      setLoading(false);
    } finally {
      setLoadingJobs(false);
    }
  };

  // Load applications for all jobs
  const loadAllApplications = async (jobsList) => {
    setLoading(true);
    setError("");
    
    try {
      const allApps = [];
      
      // Fetch applications for each job in parallel
      const promises = jobsList.map(async (job) => {
        try {
          const { data } = await companyApplicationsService.getJobApplicants(job.id);
          const applicants = data.applicants || [];
          
          // Add job information to each applicant
          return applicants.map(applicant => ({
            ...applicant,
            jobId: job.id,
            jobTitle: job.title,
            jobLocation: job.location,
            jobType: job.type,
          }));
        } catch (err) {
          console.error(`Failed to load applicants for job ${job.id}:`, err);
          return [];
        }
      });
      
      const results = await Promise.all(promises);
      results.forEach(applicants => {
        allApps.push(...applicants);
      });
      
      // Sort by applied date (latest first)
      allApps.sort((a, b) => new Date(b.appliedDate) - new Date(a.appliedDate));
      
      setAllApplications(allApps);
      setFilteredApplications(allApps);
    } catch (err) {
      console.error("Failed to load applications:", err);
      setError("Failed to load applications. Please refresh the page.");
    } finally {
      setLoading(false);
    }
  };

  // Apply filters and sorting whenever they change
  useEffect(() => {
    let filtered = [...allApplications];
    
    // Filter by job
    if (selectedJobId && selectedJobId !== "all") {
      filtered = filtered.filter(app => app.jobId === parseInt(selectedJobId));
    }
    
    // Filter by status
    if (statusFilter) {
      filtered = filtered.filter(app => app.status === statusFilter);
    }
    
    // Apply sorting
    if (sortBy === "date_desc") {
      filtered.sort((a, b) => new Date(b.appliedDate) - new Date(a.appliedDate));
    } else if (sortBy === "date_asc") {
      filtered.sort((a, b) => new Date(a.appliedDate) - new Date(b.appliedDate));
    }
    
    setFilteredApplications(filtered);
  }, [allApplications, selectedJobId, statusFilter, sortBy]);

  const handleViewApplicant = async (applicant) => {
    try {
      // Fetch detailed applicant info
      const { data } = await companyApplicationsService.getApplicantDetails(
        applicant.jobId, 
        applicant.applicationId
      );
      
      // IMPORTANT: Preserve the jobId in the selected applicant
      setSelectedApplicant({
        ...data.applicant,
        jobId: applicant.jobId,  // Ensure jobId is preserved
      });
      
      setShowDetailsModal(true);
    } catch (err) {
      console.error("Failed to load applicant details:", err);
      setError("Failed to load applicant details.");
    }
  };

  const handleStatusUpdate = async (applicationId, jobId, newStatus) => {
    // Validate required parameters
    if (!applicationId) {
      setError("Application ID is missing.");
      return;
    }
    
    if (!jobId) {
      setError("Job ID is missing. Cannot update status.");
      return;
    }
    
    setUpdating(true);
    setError("");
    setSuccess("");
    
    try {
      await companyApplicationsService.updateApplicationStatus(jobId, applicationId, newStatus);
      
      // Update local state for allApplications
      const updatedApplications = allApplications.map(app => 
        app.applicationId === applicationId ? { ...app, status: newStatus } : app
      );
      setAllApplications(updatedApplications);
      
      // Update selected applicant if the modal is open
      if (selectedApplicant && selectedApplicant.applicationId === applicationId) {
        setSelectedApplicant(prev => ({ ...prev, status: newStatus }));
      }
      
      setSuccess(`Application status updated to "${newStatus}" successfully.`);
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      const message = err.response?.data?.message || "Failed to update status.";
      setError(message);
      setTimeout(() => setError(""), 3000);
    } finally {
      setUpdating(false);
    }
  };

  const handleRefresh = async () => {
    if (jobs.length > 0) {
      await loadAllApplications(jobs);
    }
  };

  const clearAllFilters = () => {
    setSelectedJobId("");
    setStatusFilter("");
    setSortBy("date_desc");
  };

  const getStatusCounts = () => {
    const counts = {
      all: filteredApplications.length,
      total: allApplications.length,
      pending: allApplications.filter(a => a.status === "Pending").length,
      shortlisted: allApplications.filter(a => a.status === "Shortlisted").length,
      rejected: allApplications.filter(a => a.status === "Rejected").length,
      accepted: allApplications.filter(a => a.status === "Accepted").length,
    };
    return counts;
  };

  const statusCounts = getStatusCounts();

  const getStatusColor = (status) => {
    switch(status) {
      case "Pending": return "#FF9F1C";
      case "Shortlisted": return "#2EC4B6";
      case "Rejected": return "#FF6B6B";
      case "Accepted": return "#0A5F75";
      default: return "var(--muted)";
    }
  };

  const getStatusBgColor = (status) => {
    switch(status) {
      case "Pending": return "rgba(255,159,28,0.15)";
      case "Shortlisted": return "rgba(46,196,182,0.15)";
      case "Rejected": return "rgba(255,107,107,0.15)";
      case "Accepted": return "rgba(10,95,117,0.15)";
      default: return "var(--bg)";
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { 
      year: "numeric", 
      month: "short", 
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
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
                background: "rgba(255,255,255,0.12)",
                color: "white",
                marginBottom: 14,
                border: "1px solid rgba(255,255,255,0.18)",
              }}
            >
              👥 All Applications ({statusCounts.total})
            </div>
            <h1 style={{ color: "white", fontSize: "clamp(1.8rem, 3.5vw, 2.6rem)", marginBottom: 10 }}>
              Manage Applications
            </h1>
            <p style={{ color: "rgba(255,255,255,0.75)", fontSize: 15, maxWidth: 520, lineHeight: 1.7 }}>
              View and manage all applications across your job postings in one place.
            </p>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="container" style={{ marginTop: 24 }}>
        {/* Success/Error Messages */}
        {success && (
          <div className="alert success animate-fade-in" style={{ marginBottom: 20 }}>
            ✅ {success}
          </div>
        )}
        
        {error && (
          <div className="alert error animate-fade-in" style={{ marginBottom: 20 }}>
            ⚠️ {error}
          </div>
        )}

        {/* Statistics Cards */}
        {!loading && allApplications.length > 0 && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 14, marginBottom: 20 }}>
            <div className="card" style={{ padding: "16px", textAlign: "center" }}>
              <div style={{ fontSize: 24, fontWeight: 800, color: "var(--teal)" }}>{allApplications.length}</div>
              <div className="helper" style={{ fontSize: 12 }}>Total Applications</div>
            </div>
            <div className="card" style={{ padding: "16px", textAlign: "center" }}>
              <div style={{ fontSize: 24, fontWeight: 800, color: "#FF9F1C" }}>{statusCounts.pending}</div>
              <div className="helper" style={{ fontSize: 12 }}>Pending</div>
            </div>
            <div className="card" style={{ padding: "16px", textAlign: "center" }}>
              <div style={{ fontSize: 24, fontWeight: 800, color: "#2EC4B6" }}>{statusCounts.shortlisted}</div>
              <div className="helper" style={{ fontSize: 12 }}>Shortlisted</div>
            </div>
            <div className="card" style={{ padding: "16px", textAlign: "center" }}>
              <div style={{ fontSize: 24, fontWeight: 800, color: "#FF6B6B" }}>{statusCounts.rejected}</div>
              <div className="helper" style={{ fontSize: 12 }}>Rejected</div>
            </div>
            <div className="card" style={{ padding: "16px", textAlign: "center" }}>
              <div style={{ fontSize: 24, fontWeight: 800, color: "#0A5F75" }}>{statusCounts.accepted}</div>
              <div className="helper" style={{ fontSize: 12 }}>Accepted</div>
            </div>
          </div>
        )}

        {/* Filters Section */}
        <div className="card" style={{ padding: "22px 26px", marginBottom: 20 }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16 }}>
            {/* Job Filter */}
            <div>
              <label className="label" style={{ fontSize: 13, marginBottom: 6 }}>Filter by Job</label>
              <select
                value={selectedJobId}
                onChange={(e) => setSelectedJobId(e.target.value)}
                className="input"
                style={{ padding: "10px 12px", fontSize: 14 }}
                disabled={loadingJobs}
              >
                <option value="">All Jobs ({jobs.length})</option>
                {jobs.map(job => {
                  const appCount = allApplications.filter(a => a.jobId === job.id).length;
                  return (
                    <option key={job.id} value={job.id}>
                      {job.title} ({appCount})
                    </option>
                  );
                })}
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <label className="label" style={{ fontSize: 13, marginBottom: 6 }}>Filter by Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="input"
                style={{ padding: "10px 12px", fontSize: 14 }}
              >
                <option value="">All Statuses</option>
                <option value="Pending">Pending ({statusCounts.pending})</option>
                <option value="Shortlisted">Shortlisted ({statusCounts.shortlisted})</option>
                <option value="Rejected">Rejected ({statusCounts.rejected})</option>
                <option value="Accepted">Accepted ({statusCounts.accepted})</option>
              </select>
            </div>

            {/* Sort Options */}
            <div>
              <label className="label" style={{ fontSize: 13, marginBottom: 6 }}>Sort By</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="input"
                style={{ padding: "10px 12px", fontSize: 14 }}
              >
                <option value="date_desc">Latest Applied First</option>
                <option value="date_asc">Oldest Applied First</option>
              </select>
            </div>

            {/* Action Buttons */}
            <div style={{ display: "flex", gap: 10, alignItems: "flex-end" }}>
              <button
                onClick={clearAllFilters}
                className="btn btn-outline"
                style={{ flex: 1, padding: "10px 12px" }}
              >
                Clear Filters
              </button>
              <button
                onClick={handleRefresh}
                className="btn btn-outline"
                style={{ padding: "10px 12px" }}
                title="Refresh applications"
              >
                🔄
              </button>
            </div>
          </div>

          {/* Active Filters Display */}
          {(selectedJobId || statusFilter) && (
            <div style={{ marginTop: 16, paddingTop: 12, borderTop: "1px solid var(--border)", display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
              <span className="helper" style={{ fontSize: 12 }}>Active filters:</span>
              {selectedJobId && (
                <span className="badge" style={{ background: "var(--teal-dim)", fontSize: 11 }}>
                  Job: {jobs.find(j => j.id == selectedJobId)?.title}
                  <button onClick={() => setSelectedJobId("")} style={{ marginLeft: 6, background: "none", border: "none", cursor: "pointer" }}>×</button>
                </span>
              )}
              {statusFilter && (
                <span className="badge" style={{ background: "var(--teal-dim)", fontSize: 11 }}>
                  Status: {statusFilter}
                  <button onClick={() => setStatusFilter("")} style={{ marginLeft: 6, background: "none", border: "none", cursor: "pointer" }}>×</button>
                </span>
              )}
              <button onClick={clearAllFilters} style={{ fontSize: 11, color: "var(--coral)", background: "none", border: "none", cursor: "pointer" }}>
                Clear all
              </button>
            </div>
          )}
        </div>

        {/* Results Summary */}
        {!loading && !loadingJobs && (
          <div style={{ marginBottom: 16, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap" }}>
            <div>
              <span style={{ fontWeight: 600 }}>{filteredApplications.length}</span>
              <span className="helper"> application{filteredApplications.length !== 1 ? 's' : ''} found</span>
              {(selectedJobId || statusFilter) && filteredApplications.length !== allApplications.length && (
                <span className="helper" style={{ marginLeft: 8 }}>
                  (filtered from {allApplications.length} total)
                </span>
              )}
            </div>
            <button
              onClick={handleRefresh}
              className="btn btn-ghost btn-sm"
              style={{ fontSize: 12 }}
              disabled={loading}
            >
              Refresh
            </button>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div style={{ display: "grid", gap: 14 }}>
            {[1, 2, 3].map((i) => (
              <div key={i} className="card" style={{ padding: 26, height: 120, opacity: 0.6, animation: "pulse 1.5s ease-in-out infinite" }} />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && !loadingJobs && filteredApplications.length === 0 && (
          <div className="card" style={{ padding: "60px 32px", textAlign: "center", borderRadius: 22 }}>
            <div style={{ fontSize: 56, marginBottom: 16 }}>📭</div>
            <h3 style={{ marginBottom: 8 }}>No applications found</h3>
            <p className="helper">
              {allApplications.length === 0 ? (
                "You haven't received any applications yet. Share your job postings to attract candidates."
              ) : (
                "Try changing your filter criteria to see more results."
              )}
            </p>
            {(selectedJobId || statusFilter) && allApplications.length > 0 && (
              <button onClick={clearAllFilters} className="btn btn-outline" style={{ marginTop: 16 }}>
                Clear all filters
              </button>
            )}
          </div>
        )}

        {/* Applications List */}
        {!loading && !loadingJobs && filteredApplications.length > 0 && (
          <div style={{ display: "grid", gap: 14 }}>
            {filteredApplications.map((applicant, idx) => (
              <div
                key={applicant.applicationId}
                className="card"
                style={{
                  padding: "20px 24px",
                  borderRadius: 18,
                  transition: "box-shadow 0.25s ease, transform 0.25s ease",
                  animation: `fadeUp 0.35s ease ${idx * 0.03}s both`,
                  borderLeft: `4px solid ${getStatusColor(applicant.status)}`,
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16 }}>
                  {/* Left side - Student Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", marginBottom: 12 }}>
                      <h3 style={{ fontSize: 18, fontWeight: 700, color: "var(--primary)" }}>
                        {applicant.studentName}
                      </h3>
                      <span className="badge" style={{ background: "var(--bg)", fontSize: 11 }}>
                        {applicant.jobTitle}
                      </span>
                      <span
                        style={{
                          padding: "4px 12px",
                          borderRadius: 20,
                          fontSize: 12,
                          fontWeight: 600,
                          background: getStatusBgColor(applicant.status),
                          color: getStatusColor(applicant.status),
                        }}
                      >
                        {applicant.status}
                      </span>
                    </div>
                    
                    <div style={{ marginBottom: 8 }}>
                      <span className="helper" style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 4 }}>
                        📧 {applicant.studentEmail}
                      </span>
                      {applicant.headline && (
                        <span className="helper" style={{ display: "flex", alignItems: "center", gap: 4 }}>
                          🎯 {applicant.headline}
                        </span>
                      )}
                    </div>
                    
                    <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 8 }}>
                      {applicant.skills && (
                        <span className="helper" style={{ display: "flex", alignItems: "center", gap: 4 }}>
                          💻 Skills: {applicant.skills.length > 100 ? applicant.skills.substring(0, 100) + "..." : applicant.skills}
                        </span>
                      )}
                    </div>
                    
                    <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                      {applicant.university && (
                        <span className="helper" style={{ display: "flex", alignItems: "center", gap: 4 }}>
                          🎓 {applicant.university}
                        </span>
                      )}
                      {applicant.degree && (
                        <span className="helper" style={{ display: "flex", alignItems: "center", gap: 4 }}>
                          📖 {applicant.degree}
                        </span>
                      )}
                      <span className="helper" style={{ display: "flex", alignItems: "center", gap: 4 }}>
                        📅 Applied: {formatDate(applicant.appliedDate)}
                      </span>
                    </div>
                  </div>

                  {/* Right side - Actions */}
                  <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                    <select
                      value={applicant.status}
                      onChange={(e) => handleStatusUpdate(applicant.applicationId, applicant.jobId, e.target.value)}
                      disabled={updating}
                      style={{
                        padding: "8px 12px",
                        borderRadius: 8,
                        border: "1px solid var(--border)",
                        background: "var(--card)",
                        fontSize: 13,
                        fontWeight: 500,
                        cursor: "pointer",
                      }}
                    >
                      <option value="Pending">Pending</option>
                      <option value="Shortlisted">Shortlisted</option>
                      <option value="Rejected">Rejected</option>
                      <option value="Accepted">Accepted</option>
                    </select>
                    
                    <button
                      onClick={() => handleViewApplicant(applicant)}
                      className="btn btn-outline"
                      style={{ fontSize: 13, padding: "8px 16px" }}
                    >
                      View Details →
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Applicant Details Modal */}
        {selectedApplicant && (
          <ApplicantDetailsModal
            isOpen={showDetailsModal}
            applicant={selectedApplicant}
            onClose={() => setShowDetailsModal(false)}
            onUpdateStatus={(applicationId, newStatus) => 
              handleStatusUpdate(applicationId, selectedApplicant.jobId, newStatus)
            }
            updating={updating}
          />
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
        @keyframes pulse {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 0.3; }
        }
        .animate-fade-in {
          animation: fadeIn 0.3s ease;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}