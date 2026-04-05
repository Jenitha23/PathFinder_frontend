/**
 * File: src/components/company/ApplicantDetailsModal.jsx
 * Purpose: Modal dialog showing detailed applicant information
 */
import { useState } from "react";
import CvViewer from "./CvViewer";

const STATUS_OPTIONS = ["Pending", "Shortlisted", "Rejected", "Accepted"];
const STATUS_BADGE_STYLES = {
  Pending: { background: "rgba(255,159,28,0.15)", color: "#FF9F1C" },
  Shortlisted: { background: "rgba(46,196,182,0.15)", color: "#2EC4B6" },
  Rejected: { background: "rgba(255,107,107,0.15)", color: "#FF6B6B" },
  Accepted: { background: "rgba(10,95,117,0.15)", color: "#0A5F75" },
};

export default function ApplicantDetailsModal({ 
  isOpen, 
  applicant, 
  onClose, 
  onUpdateStatus,
  updating 
}) {
  const [selectedStatus, setSelectedStatus] = useState(applicant?.status || "Pending");
  const [updatingLocal, setUpdatingLocal] = useState(false);
  const [showCvViewer, setShowCvViewer] = useState(false);

  if (!isOpen || !applicant) return null;

  const formatDate = (dateString) => {
    if (!dateString) return "Not specified";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { 
      year: "numeric", 
      month: "long", 
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const handleStatusUpdate = async () => {
    if (selectedStatus === applicant.status) {
      return;
    }
    
    // Validate that we have the necessary IDs
    if (!applicant.applicationId) {
      console.error("Missing applicationId for status update");
      return;
    }
    
    if (!applicant.jobId) {
      console.error("Missing jobId for status update");
      return;
    }
    
    setUpdatingLocal(true);
    try {
      await onUpdateStatus(applicant.applicationId, selectedStatus);
    } catch (error) {
      console.error("Status update failed:", error);
    } finally {
      setUpdatingLocal(false);
    }
  };

  const Section = ({ title, children, icon }) => (
    <div style={{ marginBottom: 20 }}>
      <div style={{ 
        display: "flex", 
        alignItems: "center", 
        gap: 8, 
        marginBottom: 12,
        paddingBottom: 8,
        borderBottom: "1px solid var(--border)"
      }}>
        <span style={{ fontSize: 18 }}>{icon}</span>
        <h4 style={{ fontSize: 16, fontWeight: 700, color: "var(--primary)" }}>{title}</h4>
      </div>
      <div style={{ color: "var(--text)", lineHeight: 1.7 }}>
        {children || <span className="helper">Not provided</span>}
      </div>
    </div>
  );

  const InfoRow = ({ label, value, isLink = false }) => (
    <div style={{ display: "flex", marginBottom: 12, flexWrap: "wrap" }}>
      <div style={{ width: 140, fontSize: 13, color: "var(--muted)", fontWeight: 500 }}>
        {label}:
      </div>
      <div style={{ flex: 1, fontSize: 14, fontWeight: 500, color: "var(--text)" }}>
        {isLink && value ? (
          <a href={value} target="_blank" rel="noopener noreferrer" style={{ color: "var(--teal)" }}>
            {value}
          </a>
        ) : (
          value || <span className="helper">Not provided</span>
        )}
      </div>
    </div>
  );

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "rgba(0, 0, 0, 0.6)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        backdropFilter: "blur(4px)",
        overflowY: "auto",
        padding: "20px",
      }}
      onClick={onClose}
    >
      <div
        className="card"
        style={{
          maxWidth: 900,
          width: "100%",
          maxHeight: "90vh",
          overflowY: "auto",
          padding: "32px 28px",
          animation: "fadeUp 0.2s ease",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", marginBottom: 8 }}>
              <h2 style={{ fontSize: 24, fontWeight: 800, fontFamily: "'Sora', sans-serif" }}>
                {applicant.studentName}
              </h2>
              <span
                style={{
                  padding: "4px 12px",
                  borderRadius: 20,
                  fontSize: 13,
                  fontWeight: 600,
                  ...STATUS_BADGE_STYLES[applicant.status],
                }}
              >
                {applicant.status}
              </span>
            </div>
            <div style={{ color: "var(--muted)" }}>{applicant.studentEmail}</div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              fontSize: 28,
              cursor: "pointer",
              color: "var(--muted)",
              lineHeight: 1,
              padding: 4,
            }}
          >
            ×
          </button>
        </div>

        {/* Status Update Section */}
        <div style={{ 
          background: "var(--teal-dim)", 
          padding: "16px 20px", 
          borderRadius: 12, 
          marginBottom: 24,
          display: "flex",
          alignItems: "center",
          gap: 16,
          flexWrap: "wrap",
          justifyContent: "space-between"
        }}>
          <div>
            <div style={{ fontSize: 13, color: "var(--muted)", marginBottom: 4 }}>Update Application Status</div>
            <div style={{ fontSize: 14, fontWeight: 600 }}>Change candidate's status</div>
          </div>
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              disabled={updating || updatingLocal}
              style={{
                padding: "10px 14px",
                borderRadius: 8,
                border: "1px solid var(--border)",
                background: "white",
                fontSize: 14,
                fontWeight: 500,
                cursor: "pointer",
              }}
            >
              {STATUS_OPTIONS.map(status => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
            {selectedStatus !== applicant.status && (
              <button
                onClick={handleStatusUpdate}
                disabled={updating || updatingLocal}
                className="btn btn-teal"
                style={{ padding: "10px 20px" }}
              >
                {(updating || updatingLocal) ? "Updating..." : "Update Status"}
              </button>
            )}
          </div>
        </div>

        {/* CV Section - Enhanced with Preview Button */}
        {applicant.cvUrl && (
          <div style={{ 
            background: "var(--bg)", 
            padding: "16px 20px", 
            borderRadius: 12, 
            marginBottom: 24,
            border: "1px solid var(--border)"
          }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
              <div>
                <div style={{ fontSize: 13, color: "var(--muted)", marginBottom: 4 }}>Curriculum Vitae</div>
                <div style={{ fontSize: 14, fontWeight: 600 }}>View and download candidate's CV</div>
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <button
                  onClick={() => setShowCvViewer(true)}
                  className="btn btn-outline"
                  style={{ textDecoration: "none", cursor: "pointer" }}
                >
                  👁️ Preview CV
                </button>
                <a
                  href={applicant.cvUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-teal"
                  style={{ textDecoration: "none" }}
                >
                  📥 Download CV
                </a>
              </div>
            </div>
          </div>
        )}

        {/* CV Viewer Modal */}
        {showCvViewer && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: "rgba(0, 0, 0, 0.8)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 1100,
              padding: "20px",
            }}
            onClick={() => setShowCvViewer(false)}
          >
            <div
              style={{
                background: "white",
                borderRadius: 16,
                width: "90%",
                height: "90%",
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ 
                padding: "16px 20px", 
                borderBottom: "1px solid var(--border)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center"
              }}>
                <h3 style={{ fontSize: 18, fontWeight: 700 }}>CV Preview - {applicant.studentName}</h3>
                <button
                  onClick={() => setShowCvViewer(false)}
                  style={{
                    background: "none",
                    border: "none",
                    fontSize: 24,
                    cursor: "pointer",
                    color: "var(--muted)",
                  }}
                >
                  ×
                </button>
              </div>
              <div style={{ flex: 1, padding: "20px", overflow: "auto" }}>
                <CvViewer 
                  cvUrl={applicant.cvUrl} 
                  studentName={applicant.studentName}
                  onClose={() => setShowCvViewer(false)}
                />
              </div>
            </div>
          </div>
        )}

        {/* Profile Information */}
        {applicant.headline && (
          <Section title="Professional Headline" icon="🎯">
            {applicant.headline}
          </Section>
        )}

        {applicant.aboutMe && (
          <Section title="About Me" icon="📝">
            <div style={{ whiteSpace: "pre-wrap" }}>{applicant.aboutMe}</div>
          </Section>
        )}

        {/* Skills */}
        {(applicant.skills || applicant.technicalSkills || applicant.softSkills) && (
          <Section title="Skills & Expertise" icon="💻">
            <div style={{ display: "grid", gap: 12 }}>
              {applicant.skills && (
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "var(--primary)", marginBottom: 6 }}>Skills:</div>
                  <div>{applicant.skills}</div>
                </div>
              )}
              {applicant.technicalSkills && (
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "var(--primary)", marginBottom: 6 }}>Technical Skills:</div>
                  <div>{applicant.technicalSkills}</div>
                </div>
              )}
              {applicant.softSkills && (
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "var(--primary)", marginBottom: 6 }}>Soft Skills:</div>
                  <div>{applicant.softSkills}</div>
                </div>
              )}
              {applicant.languages && (
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "var(--primary)", marginBottom: 6 }}>Languages:</div>
                  <div>{applicant.languages}</div>
                </div>
              )}
            </div>
          </Section>
        )}

        {/* Education */}
        {(applicant.university || applicant.degree || applicant.education) && (
          <Section title="Education" icon="🎓">
            <div style={{ display: "grid", gap: 8 }}>
              {applicant.university && <div><strong>University:</strong> {applicant.university}</div>}
              {applicant.degree && <div><strong>Degree:</strong> {applicant.degree}</div>}
              {applicant.academicYear && <div><strong>Academic Year:</strong> {applicant.academicYear}</div>}
              {applicant.gpa && <div><strong>GPA:</strong> {applicant.gpa}</div>}
              {applicant.education && <div><strong>Education Details:</strong> {applicant.education}</div>}
            </div>
          </Section>
        )}

        {/* Experience */}
        {applicant.experience && (
          <Section title="Experience" icon="💼">
            <div style={{ whiteSpace: "pre-wrap" }}>{applicant.experience}</div>
          </Section>
        )}

        {/* Projects & Certifications */}
        {applicant.projectsSummary && (
          <Section title="Projects" icon="🚀">
            <div style={{ whiteSpace: "pre-wrap" }}>{applicant.projectsSummary}</div>
          </Section>
        )}

        {applicant.certifications && (
          <Section title="Certifications" icon="📜">
            <div style={{ whiteSpace: "pre-wrap" }}>{applicant.certifications}</div>
          </Section>
        )}

        {/* Career Preferences */}
        {(applicant.careerInterests || applicant.preferredJobType || applicant.workMode) && (
          <Section title="Career Preferences" icon="🎯">
            <div style={{ display: "grid", gap: 8 }}>
              {applicant.careerInterests && <div><strong>Interests:</strong> {applicant.careerInterests}</div>}
              {applicant.preferredJobType && <div><strong>Preferred Job Type:</strong> {applicant.preferredJobType}</div>}
              {applicant.workMode && <div><strong>Work Mode:</strong> {applicant.workMode}</div>}
              {applicant.availableFrom && <div><strong>Available From:</strong> {formatDate(applicant.availableFrom)}</div>}
            </div>
          </Section>
        )}

        {/* Contact Information */}
        {(applicant.phone || applicant.address || applicant.city || applicant.country) && (
          <Section title="Contact Information" icon="📞">
            <div style={{ display: "grid", gap: 8 }}>
              {applicant.phone && <div><strong>Phone:</strong> {applicant.phone}</div>}
              {applicant.address && <div><strong>Address:</strong> {applicant.address}</div>}
              {applicant.city && <div><strong>City:</strong> {applicant.city}</div>}
              {applicant.country && <div><strong>Country:</strong> {applicant.country}</div>}
            </div>
          </Section>
        )}

        {/* Links */}
        {(applicant.githubUrl || applicant.linkedinUrl || applicant.portfolioUrl) && (
          <Section title="Online Presence" icon="🔗">
            <div style={{ display: "grid", gap: 8 }}>
              {applicant.githubUrl && (
                <div>
                  <strong>GitHub:</strong>{" "}
                  <a href={applicant.githubUrl} target="_blank" rel="noopener noreferrer" style={{ color: "var(--teal)" }}>
                    {applicant.githubUrl}
                  </a>
                </div>
              )}
              {applicant.linkedinUrl && (
                <div>
                  <strong>LinkedIn:</strong>{" "}
                  <a href={applicant.linkedinUrl} target="_blank" rel="noopener noreferrer" style={{ color: "var(--teal)" }}>
                    {applicant.linkedinUrl}
                  </a>
                </div>
              )}
              {applicant.portfolioUrl && (
                <div>
                  <strong>Portfolio:</strong>{" "}
                  <a href={applicant.portfolioUrl} target="_blank" rel="noopener noreferrer" style={{ color: "var(--teal)" }}>
                    {applicant.portfolioUrl}
                  </a>
                </div>
              )}
            </div>
          </Section>
        )}

        {/* Cover Letter */}
        {applicant.coverLetter && (
          <Section title="Cover Letter" icon="✉️">
            <div style={{ whiteSpace: "pre-wrap", lineHeight: 1.8 }}>{applicant.coverLetter}</div>
          </Section>
        )}

        {/* Application Meta */}
        <Section title="Application Information" icon="📋">
          <InfoRow label="Applied On" value={formatDate(applicant.appliedDate)} />
          <InfoRow label="Application ID" value={`#${applicant.applicationId}`} />
          <InfoRow label="Current Status" value={applicant.status} />
        </Section>

        {/* Footer Actions */}
        <div style={{ 
          display: "flex", 
          gap: 12, 
          marginTop: 24,
          paddingTop: 20,
          borderTop: "1px solid var(--border)"
        }}>
          <button onClick={onClose} className="btn btn-outline" style={{ flex: 1, justifyContent: "center" }}>
            Close
          </button>
        </div>
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