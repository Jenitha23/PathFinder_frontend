/**
 * File: src/components/company/ApplicantList.jsx
 * Purpose: Display list of applicants for a job
 */
import { useState } from "react";

const STATUS_OPTIONS = ["Pending", "Shortlisted", "Rejected", "Accepted"];
const STATUS_COLORS = {
  Pending: "#FF9F1C",
  Shortlisted: "#2EC4B6",
  Rejected: "#FF6B6B",
  Accepted: "#0A5F75",
};

const STATUS_BADGE_STYLES = {
  Pending: { background: "rgba(255,159,28,0.15)", color: "#FF9F1C" },
  Shortlisted: { background: "rgba(46,196,182,0.15)", color: "#2EC4B6" },
  Rejected: { background: "rgba(255,107,107,0.15)", color: "#FF6B6B" },
  Accepted: { background: "rgba(10,95,117,0.15)", color: "#0A5F75" },
};

export default function ApplicantList({ 
  applicants, 
  loading, 
  jobTitle, 
  onViewApplicant, 
  onUpdateStatus,
  updating,
  statusFilter 
}) {
  const [updatingId, setUpdatingId] = useState(null);

  const handleStatusChange = async (applicationId, newStatus) => {
    setUpdatingId(applicationId);
    try {
      await onUpdateStatus(applicationId, newStatus);
    } finally {
      setUpdatingId(null);
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

  if (loading) {
    return (
      <div style={{ display: "grid", gap: 14 }}>
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="card"
            style={{
              padding: 26,
              height: 120,
              background: "var(--card)",
              borderRadius: 18,
              opacity: 0.6,
              animation: "pulse 1.5s ease-in-out infinite",
            }}
          />
        ))}
        <style>{`
          @keyframes pulse {
            0%, 100% { opacity: 0.6; }
            50% { opacity: 0.3; }
          }
        `}</style>
      </div>
    );
  }

  if (applicants.length === 0) {
    return null; // Empty state is handled by parent
  }

  return (
    <div style={{ display: "grid", gap: 14 }}>
      {/* Show filter info if filtering */}
      {statusFilter && (
        <div style={{ 
          fontSize: 13, 
          color: "var(--muted)", 
          marginBottom: 8,
          paddingLeft: 8,
          borderLeft: `3px solid ${STATUS_COLORS[statusFilter] || "var(--teal)"}`
        }}>
          Showing {applicants.length} applicant(s) with status "{statusFilter}"
        </div>
      )}
      
      {applicants.map((applicant, idx) => (
        <div
          key={applicant.applicationId}
          className="card"
          style={{
            padding: "20px 24px",
            borderRadius: 18,
            transition: "box-shadow 0.25s ease, transform 0.25s ease",
            animation: `fadeUp 0.35s ease ${idx * 0.05}s both`,
            borderLeft: `4px solid ${STATUS_COLORS[applicant.status] || "var(--border)"}`,
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
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16 }}>
            {/* Left side - Student Info */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", marginBottom: 12 }}>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: "var(--primary)" }}>
                  {applicant.studentName}
                </h3>
                <span
                  style={{
                    padding: "4px 12px",
                    borderRadius: 20,
                    fontSize: 12,
                    fontWeight: 600,
                    ...STATUS_BADGE_STYLES[applicant.status],
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
                onChange={(e) => handleStatusChange(applicant.applicationId, e.target.value)}
                disabled={updating && updatingId === applicant.applicationId}
                style={{
                  padding: "8px 12px",
                  borderRadius: 8,
                  border: "1px solid var(--border)",
                  background: "var(--card)",
                  fontSize: 13,
                  fontWeight: 500,
                  cursor: "pointer",
                  opacity: updating && updatingId === applicant.applicationId ? 0.6 : 1,
                }}
              >
                {STATUS_OPTIONS.map(status => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
              
              <button
                onClick={() => onViewApplicant(applicant.applicationId)}
                className="btn btn-outline"
                style={{ fontSize: 13, padding: "8px 16px" }}
              >
                View Details →
              </button>
            </div>
          </div>
        </div>
      ))}
      
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