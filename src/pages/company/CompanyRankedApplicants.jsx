/**
 * File: src/pages/company/CompanyRankedApplicants.jsx
 * Purpose: Company page to view AI-ranked applicants for a job
 */
import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import aiService from "../../services/aiService";
import companyJobService from "../../services/companyjobService";
import RankedApplicantList from "../../components/company/ai/RankedApplicantList";
import ApplicantDetailsModal from "../../components/company/ApplicantDetailsModal";
import companyApplicationsService from "../../services/companyApplicationsService";
import { Brain, ArrowLeft, RefreshCw } from "lucide-react";

export default function CompanyRankedApplicants() {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [selectedApplicant, setSelectedApplicant] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    loadJobAndApplicants();
  }, [jobId]);

  const loadJobAndApplicants = async () => {
    setLoading(true);
    setError("");
    try {
      // Load job details
      const jobRes = await companyJobService.getJobById(jobId);
      setJob(jobRes.data);

      // Load AI-ranked applicants
      const rankedRes = await aiService.getRankedApplicants(jobId);
      setApplicants(rankedRes.data.applicants || []);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load ranked applicants");
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadJobAndApplicants();
    setRefreshing(false);
  };

  const handleViewApplicant = async (applicant) => {
    try {
      const { data } = await companyApplicationsService.getApplicantDetails(jobId, applicant.applicationId);
      setSelectedApplicant({
        ...data.applicant,
        jobId: parseInt(jobId),
      });
      setShowModal(true);
    } catch (err) {
      setError("Failed to load applicant details");
    }
  };

  const handleStatusUpdate = async (applicationId, newStatus) => {
    setUpdating(true);
    try {
      await companyApplicationsService.updateApplicationStatus(jobId, applicationId, newStatus);
      
      // Update local state
      setApplicants(prev => prev.map(app => 
        app.applicationId === applicationId ? { ...app, applicationStatus: newStatus } : app
      ));
      
      if (selectedApplicant?.applicationId === applicationId) {
        setSelectedApplicant(prev => ({ ...prev, status: newStatus }));
      }
    } catch (err) {
      setError("Failed to update status");
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div style={{ background: "var(--bg)", paddingBottom: 60 }}>
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
              to="/company/ranked-applicants"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                color: "rgba(255,255,255,0.7)",
                fontSize: 14,
                textDecoration: "none",
              }}
            >
              <ArrowLeft size={16} /> Back to AI Ranked Applicants
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
              Ranked Applicants
            </h1>
            <p style={{ color: "rgba(255,255,255,0.75)", fontSize: 15, maxWidth: 520 }}>
              {job?.title} • {applicants.length} applicant{applicants.length !== 1 ? "s" : ""} ranked by AI match score
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container" style={{ marginTop: 24 }}>
        {error && (
          <div className="alert error" style={{ marginBottom: 20 }}>
            {error}
          </div>
        )}

        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 20 }}>
          <button onClick={handleRefresh} className="btn btn-outline btn-sm" disabled={refreshing}>
            <RefreshCw size={14} style={{ marginRight: 6 }} />
            {refreshing ? "Refreshing..." : "Refresh Rankings"}
          </button>
        </div>

        <RankedApplicantList
          applicants={applicants}
          loading={loading}
          onViewApplicant={handleViewApplicant}
        />
      </div>

      {/* Applicant Details Modal */}
      {selectedApplicant && (
        <ApplicantDetailsModal
          isOpen={showModal}
          applicant={selectedApplicant}
          onClose={() => setShowModal(false)}
          onUpdateStatus={(applicationId, newStatus) =>
            handleStatusUpdate(applicationId, newStatus)
          }
          updating={updating}
        />
      )}
    </div>
  );
}