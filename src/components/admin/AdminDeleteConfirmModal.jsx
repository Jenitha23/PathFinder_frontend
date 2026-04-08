/**
 * File: src/components/admin/AdminDeleteConfirmModal.jsx
 * Purpose: Confirmation modal for deleting user accounts
 */
export default function AdminDeleteConfirmModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  user, 
  userType, 
  loading 
}) {
  if (!isOpen) return null;

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
      <div className="card" style={{ maxWidth: 450, width: "90%", padding: 24 }}>
        <h3 style={{ marginBottom: 8, color: "#c0392b" }}>Confirm Delete</h3>
        <p style={{ marginBottom: 16 }}>
          Are you sure you want to delete the {userType === "STUDENT" ? "student" : "company"} account?
        </p>
        
        <div style={{ 
          background: "#f8fafc", 
          padding: 12, 
          borderRadius: 8, 
          marginBottom: 20 
        }}>
          <div style={{ fontWeight: 600 }}>
            {userType === "STUDENT" 
              ? user?.fullName || user?.FullName 
              : user?.companyName || user?.CompanyName}
          </div>
          <div className="helper" style={{ fontSize: 12 }}>
            {user?.email || user?.Email}
          </div>
        </div>

        <p className="helper" style={{ marginBottom: 20, color: "#c0392b" }}>
          This action cannot be undone. All associated data will be permanently removed.
        </p>

        <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
          <button 
            className="btn btn-outline" 
            onClick={onClose} 
            disabled={loading}
          >
            Cancel
          </button>
          <button 
            className="btn btn-coral" 
            onClick={onConfirm} 
            disabled={loading}
          >
            {loading ? "Deleting..." : "Delete Account"}
          </button>
        </div>
      </div>
    </div>
  );
}