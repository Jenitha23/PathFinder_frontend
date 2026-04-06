/**
 * File: src/components/admin/AdminRejectionModal.jsx
 * Purpose: Modal for entering rejection reason
 */
import { useState } from "react";

export default function AdminRejectionModal({ isOpen, onClose, onConfirm, companyName, loading }) {
  const [rejectionReason, setRejectionReason] = useState("");
  const [adminNotes, setAdminNotes] = useState("");
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (!rejectionReason.trim()) {
      setError("Rejection reason is required.");
      return;
    }
    setError("");
    onConfirm(rejectionReason, adminNotes);
  };

  return (
    <div className="modal-overlay" style={{
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: "rgba(0,0,0,0.5)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 1000,
    }}>
      <div className="card" style={{ maxWidth: 500, width: "90%", padding: 24 }}>
        <h3 style={{ marginBottom: 8 }}>Reject Company</h3>
        <p className="helper" style={{ marginBottom: 16 }}>
          You are about to reject <strong>{companyName}</strong>. Please provide a reason.
        </p>

        {error && <div className="alert error" style={{ marginBottom: 12 }}>{error}</div>}

        <div style={{ marginBottom: 16 }}>
          <label className="label" htmlFor="rejectionReason">Rejection Reason *</label>
          <textarea
            id="rejectionReason"
            className="input"
            rows={3}
            placeholder="Explain why this company is being rejected..."
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            style={{ resize: "vertical" }}
          />
          <div className="helper" style={{ fontSize: 11, marginTop: 4 }}>
            Max 500 characters. This will be visible to the company.
          </div>
        </div>

        <div style={{ marginBottom: 20 }}>
          <label className="label" htmlFor="adminNotes">Internal Notes (Optional)</label>
          <textarea
            id="adminNotes"
            className="input"
            rows={2}
            placeholder="Add private notes for other admins..."
            value={adminNotes}
            onChange={(e) => setAdminNotes(e.target.value)}
            style={{ resize: "vertical" }}
          />
        </div>

        <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
          <button className="btn btn-outline" onClick={onClose} disabled={loading}>
            Cancel
          </button>
          <button className="btn btn-coral" onClick={handleConfirm} disabled={loading}>
            {loading ? "Rejecting..." : "Confirm Rejection"}
          </button>
        </div>
      </div>
    </div>
  );
}