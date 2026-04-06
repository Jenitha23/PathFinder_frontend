/**
 * File: src/components/admin/AdminBulkActionBar.jsx
 * Purpose: Bulk action bar for selecting multiple companies
 */
import { useState } from "react";
import AdminRejectionModal from "./AdminRejectionModal";

export default function AdminBulkActionBar({ 
  selectedIds, 
  onClearSelection, 
  onBulkApprove, 
  onBulkReject,
  bulkLoading 
}) {
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejecting, setRejecting] = useState(false);

  const handleBulkReject = async (rejectionReason, adminNotes) => {
    setRejecting(true);
    await onBulkReject(rejectionReason, adminNotes);
    setRejecting(false);
    setShowRejectModal(false);
    onClearSelection();
  };

  if (selectedIds.length === 0) return null;

  return (
    <>
      <div className="card" style={{
        padding: "12px 16px",
        marginBottom: 20,
        background: "#f0f4ff",
        border: "1px solid #0a2472",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: 12,
      }}>
        <div>
          <strong>{selectedIds.length}</strong> company(ies) selected
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button
            className="btn btn-outline btn-sm"
            onClick={onClearSelection}
            disabled={bulkLoading}
          >
            Clear
          </button>
          <button
            className="btn btn-teal btn-sm"
            onClick={() => onBulkApprove()}
            disabled={bulkLoading}
          >
            {bulkLoading ? "Processing..." : "Approve Selected"}
          </button>
          <button
            className="btn btn-coral btn-sm"
            onClick={() => setShowRejectModal(true)}
            disabled={bulkLoading}
          >
            Reject Selected
          </button>
        </div>
      </div>

      <AdminRejectionModal
        isOpen={showRejectModal}
        onClose={() => setShowRejectModal(false)}
        onConfirm={handleBulkReject}
        companyName={`${selectedIds.length} companies`}
        loading={rejecting}
      />
    </>
  );
}