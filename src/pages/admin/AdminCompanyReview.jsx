/**
 * File: src/pages/admin/AdminCompanyReview.jsx
 * Purpose: Detailed company review page for admin with logo display
 */
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AdminLayout from "../../components/admin/AdminLayout";
import AdminStatusBadge from "../../components/admin/AdminStatusBadge";
import AdminRejectionModal from "../../components/admin/AdminRejectionModal";
import adminCompanyService from "../../services/adminCompanyService";

export default function AdminCompanyReview() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [company, setCompany] = useState(null);
  const [stats, setStats] = useState(null);
  const [auditLogs, setAuditLogs] = useState([]);
  const [actions, setActions] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [logoError, setLogoError] = useState(false);

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await adminCompanyService.getCompanyForReview(id);
      setCompany(data.company);
      setStats(data.stats);
      setAuditLogs(data.auditLogs || []);
      setActions(data.actions);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load company details.");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    setUpdating(true);
    try {
      await adminCompanyService.updateCompanyStatus(id, { status: "APPROVED" });
      setMessage("Company approved successfully!");
      await loadData();
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to approve company.");
      setTimeout(() => setError(""), 3000);
    } finally {
      setUpdating(false);
    }
  };

  const handleReject = async (rejectionReason, adminNotes) => {
    setUpdating(true);
    try {
      await adminCompanyService.updateCompanyStatus(id, {
        status: "REJECTED",
        rejectionReason,
        adminNotes,
      });
      setMessage("Company rejected successfully!");
      setShowRejectModal(false);
      await loadData();
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to reject company.");
      setTimeout(() => setError(""), 3000);
    } finally {
      setUpdating(false);
    }
  };

  const getCompletenessColor = (score) => {
    if (score >= 80) return "#10b981";
    if (score >= 50) return "#f59e0b";
    return "#ef4444";
  };

  if (loading) {
    return (
      <AdminLayout title="Company Review" subtitle="Loading company details...">
        <div className="alert info">Loading...</div>
      </AdminLayout>
    );
  }

  if (error || !company) {
    return (
      <AdminLayout title="Company Review" subtitle="Error loading company">
        <div className="alert error">{error || "Company not found."}</div>
        <button className="btn btn-outline" onClick={() => navigate("/admin/companies")}>
          ← Back to Companies
        </button>
      </AdminLayout>
    );
  }

  const canApprove = actions?.canApprove || company.status === "PENDING_APPROVAL";
  const completeness = stats?.profileCompleteness || 0;

  return (
    <AdminLayout title="Company Review" subtitle={`Reviewing: ${company.companyName}`}>
      {message && <div className="alert success" style={{ marginBottom: 14 }}>{message}</div>}
      {error && <div className="alert error" style={{ marginBottom: 14 }}>{error}</div>}

      {/* Action Buttons */}
      {canApprove && (
        <div className="card" style={{ padding: 16, marginBottom: 20, display: "flex", gap: 12, flexWrap: "wrap" }}>
          <button
            className="btn btn-teal"
            onClick={handleApprove}
            disabled={updating}
          >
            {updating ? "Processing..." : "✓ Approve Company"}
          </button>
          <button
            className="btn btn-coral"
            onClick={() => setShowRejectModal(true)}
            disabled={updating}
          >
            ✗ Reject Company
          </button>
          <button
            className="btn btn-outline"
            onClick={() => navigate("/admin/companies")}
          >
            ← Back to List
          </button>
        </div>
      )}

      {!canApprove && (
        <div className="card" style={{ padding: 16, marginBottom: 20 }}>
          <button
            className="btn btn-outline"
            onClick={() => navigate("/admin/companies")}
          >
            ← Back to Companies
          </button>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        {/* Company Information with Logo */}
        <div className="card" style={{ padding: 20 }}>
          <h3 style={{ marginBottom: 16 }}>Company Information</h3>
          
          {/* Logo Display */}
          {company.logoUrl && !logoError ? (
            <div style={{ textAlign: "center", marginBottom: 20, paddingBottom: 16, borderBottom: "1px solid #e2e8f0" }}>
              <div className="helper" style={{ fontSize: 11, marginBottom: 8 }}>Company Logo</div>
              <img 
                src={company.logoUrl} 
                alt={`${company.companyName} logo`}
                style={{ 
                  maxWidth: 120, 
                  maxHeight: 120, 
                  objectFit: "contain",
                  border: "1px solid #e2e8f0",
                  borderRadius: 8,
                  padding: 8,
                  background: "white"
                }}
                onError={() => setLogoError(true)}
              />
            </div>
          ) : (
            <div style={{ textAlign: "center", marginBottom: 20, paddingBottom: 16, borderBottom: "1px solid #e2e8f0" }}>
              <div className="helper" style={{ fontSize: 11, marginBottom: 8 }}>Company Logo</div>
              <div style={{ 
                width: 120, 
                height: 120, 
                margin: "0 auto",
                background: "#f1f5f9", 
                border: "1px solid #e2e8f0",
                borderRadius: 8,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#64748b",
                fontSize: 12
              }}>
                No Logo
              </div>
            </div>
          )}
          
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div>
              <div className="helper" style={{ fontSize: 11 }}>Company Name</div>
              <div style={{ fontWeight: 600 }}>{company.companyName}</div>
            </div>

            <div>
              <div className="helper" style={{ fontSize: 11 }}>Email</div>
              <div>{company.email}</div>
            </div>

            <div>
              <div className="helper" style={{ fontSize: 11 }}>Status</div>
              <AdminStatusBadge status={company.status} />
            </div>

            <div>
              <div className="helper" style={{ fontSize: 11 }}>Registered On</div>
              <div>{new Date(company.createdAt).toLocaleString()}</div>
            </div>

            {company.industry && (
              <div>
                <div className="helper" style={{ fontSize: 11 }}>Industry</div>
                <div>{company.industry}</div>
              </div>
            )}

            {company.location && (
              <div>
                <div className="helper" style={{ fontSize: 11 }}>Location</div>
                <div>{company.location}</div>
              </div>
            )}

            {company.website && (
              <div style={{ gridColumn: "span 2" }}>
                <div className="helper" style={{ fontSize: 11 }}>Website</div>
                <a href={company.website} target="_blank" rel="noopener noreferrer" style={{ wordBreak: "break-all" }}>
                  {company.website}
                </a>
              </div>
            )}

            {company.phone && (
              <div>
                <div className="helper" style={{ fontSize: 11 }}>Phone</div>
                <div>{company.phone}</div>
              </div>
            )}

            {company.description && (
              <div style={{ gridColumn: "span 2" }}>
                <div className="helper" style={{ fontSize: 11 }}>Description</div>
                <div style={{ whiteSpace: "pre-wrap" }}>{company.description}</div>
              </div>
            )}
          </div>

          {company.approvedAt && (
            <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid #e2e8f0" }}>
              <div className="helper" style={{ fontSize: 11 }}>
                {company.status === "APPROVED" ? "Approved On" : "Rejected On"}
              </div>
              <div>{new Date(company.approvedAt).toLocaleString()}</div>
            </div>
          )}

          {company.rejectionReason && (
            <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid #e2e8f0" }}>
              <div className="helper" style={{ fontSize: 11, color: "#c0392b" }}>Rejection Reason</div>
              <div style={{ color: "#c0392b" }}>{company.rejectionReason}</div>
            </div>
          )}

          {company.adminNotes && (
            <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid #e2e8f0" }}>
              <div className="helper" style={{ fontSize: 11 }}>Admin Notes</div>
              <div style={{ fontStyle: "italic" }}>{company.adminNotes}</div>
            </div>
          )}
        </div>

        {/* Profile Completeness & Stats */}
        <div className="card" style={{ padding: 20 }}>
          <h3 style={{ marginBottom: 16 }}>Profile Overview</h3>
          
          <div style={{ marginBottom: 16 }}>
            <div style={{ 
              height: 8, 
              background: "#e2e8f0", 
              borderRadius: 4, 
              overflow: "hidden",
              marginBottom: 8,
            }}>
              <div style={{
                width: `${completeness}%`,
                height: "100%",
                background: getCompletenessColor(completeness),
                transition: "width 0.3s",
              }} />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span className="helper">Profile Completeness</span>
              <span style={{ fontWeight: 600 }}>{completeness}%</span>
            </div>
          </div>

          {stats && (
            <div style={{ marginBottom: 16, padding: 12, background: "#f8fafc", borderRadius: 8 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <span className="helper">Total Jobs Posted</span>
                <span style={{ fontWeight: 600 }}>{stats.totalJobsPosted || 0}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span className="helper">Has Complete Profile</span>
                <span style={{ fontWeight: 600, color: stats.hasCompleteProfile ? "#10b981" : "#ef4444" }}>
                  {stats.hasCompleteProfile ? "Yes" : "No"}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Audit Logs */}
      {auditLogs.length > 0 && (
        <div className="card" style={{ padding: 20, marginTop: 20 }}>
          <h3 style={{ marginBottom: 12 }}>Audit History</h3>
          <div style={{ overflowX: "auto" }}>
            <table className="admin-table" style={{ width: "100%" }}>
              <thead>
                <tr>
                  <th>Action</th>
                  <th>From</th>
                  <th>To</th>
                  <th>Details</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {auditLogs.map(log => (
                  <tr key={log.id}>
                    <td>{log.action}</td>
                    <td>{log.oldValue || "-"}</td>
                    <td>{log.newValue || "-"}</td>
                    <td>{log.details || "-"}</td>
                    <td>{new Date(log.createdAt).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Rejection Modal */}
      <AdminRejectionModal
        isOpen={showRejectModal}
        onClose={() => setShowRejectModal(false)}
        onConfirm={handleReject}
        companyName={company.companyName}
        loading={updating}
      />
    </AdminLayout>
  );
}