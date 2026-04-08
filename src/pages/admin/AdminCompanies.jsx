/**
 * File: src/pages/admin/AdminCompanies.jsx
 * Purpose: Admin page for company management with edit/delete functionality
 */
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../../components/admin/AdminLayout";
import AdminStatusBadge from "../../components/admin/AdminStatusBadge";
import AdminTable from "../../components/admin/AdminTable";
import AdminFilterBar from "../../components/admin/AdminFilterBar";
import AdminPagination from "../../components/admin/AdminPagination";
import AdminBulkActionBar from "../../components/admin/AdminBulkActionBar";
import AdminRejectionModal from "../../components/admin/AdminRejectionModal";
import AdminUserEditModal from "../../components/admin/AdminUserEditModal";
import AdminDeleteConfirmModal from "../../components/admin/AdminDeleteConfirmModal";
import { useAdminCompanies } from "../../hooks/useAdminCompanies";
import adminCompanyService from "../../services/adminCompanyService";

export default function AdminCompanies() {
  const navigate = useNavigate();
  const {
    companies,
    total,
    page,
    pageSize,
    totalPages,
    loading,
    error,
    filters,
    savingId,
    bulkLoading,
    updateStatus,
    bulkUpdate,
    setPage,
    setPageSize,
    setFilters,
    resetFilters,
    loadCompanies,
  } = useAdminCompanies();

  const [selectedIds, setSelectedIds] = useState([]);
  const [showRejectModal, setShowRejectModal] = useState(null);
  const [rejectingId, setRejectingId] = useState(null);
  const [editingCompany, setEditingCompany] = useState(null);
  const [deletingCompany, setDeletingCompany] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [logoErrors, setLogoErrors] = useState({});

  const showMessage = (msg, type = "success") => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => {
      setMessage("");
      setMessageType("");
    }, 3000);
  };

  const handleApprove = async (companyId) => {
    const result = await updateStatus(companyId, "APPROVED");
    if (result.success) {
      showMessage(result.message);
    } else {
      showMessage(result.message, "error");
    }
  };

  const handleReject = async (companyId, rejectionReason, adminNotes) => {
    setRejectingId(companyId);
    const result = await updateStatus(companyId, "REJECTED", rejectionReason, adminNotes);
    setRejectingId(null);
    setShowRejectModal(null);
    if (result.success) {
      showMessage(result.message);
    } else {
      showMessage(result.message, "error");
    }
  };

  const handleEdit = (company) => {
    setEditingCompany(company);
  };

  const handleSaveEdit = async (data) => {
    try {
      await adminCompanyService.updateCompany(editingCompany.id, data);
      showMessage("Company updated successfully.");
      setEditingCompany(null);
      await loadCompanies();
    } catch (err) {
      const message = err?.response?.data?.message || "Failed to update company.";
      showMessage(message, "error");
    }
  };

  const handleDelete = (company) => {
    setDeletingCompany(company);
  };

  const handleConfirmDelete = async () => {
    setDeletingId(deletingCompany.id);
    try {
      await adminCompanyService.deleteCompany(deletingCompany.id);
      showMessage(`Company "${deletingCompany.companyName}" has been deleted.`);
      setDeletingCompany(null);
      await loadCompanies();
    } catch (err) {
      const message = err?.response?.data?.message || "Failed to delete company.";
      showMessage(message, "error");
    } finally {
      setDeletingId(null);
    }
  };

  const handleBulkApprove = async () => {
    const result = await bulkUpdate(selectedIds, "APPROVED");
    if (result.success) {
      showMessage(`Approved ${result.successCount} company(ies). Failed: ${result.failCount}`);
      setSelectedIds([]);
    } else {
      showMessage(result.message, "error");
    }
  };

  const handleBulkReject = async (rejectionReason, adminNotes) => {
    const result = await bulkUpdate(selectedIds, "REJECTED", rejectionReason, adminNotes);
    if (result.success) {
      showMessage(`Rejected ${result.successCount} company(ies). Failed: ${result.failCount}`);
      setSelectedIds([]);
    } else {
      showMessage(result.message, "error");
    }
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === companies.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(companies.map(c => c.id));
    }
  };

  const toggleSelect = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(i => i !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleLogoError = (companyId) => {
    setLogoErrors(prev => ({ ...prev, [companyId]: true }));
  };

  const columns = [
    {
      key: "select",
      label: (
        <input
          type="checkbox"
          checked={selectedIds.length === companies.length && companies.length > 0}
          onChange={toggleSelectAll}
          disabled={loading || companies.length === 0}
        />
      ),
      render: (row) => (
        <input
          type="checkbox"
          checked={selectedIds.includes(row.id)}
          onChange={() => toggleSelect(row.id)}
          disabled={loading}
        />
      ),
    },
    {
      key: "logo",
      label: "Logo",
      render: (row) => (
        row.logoUrl && !logoErrors[row.id] ? (
          <img 
            src={row.logoUrl} 
            alt={row.companyName}
            style={{ width: 40, height: 40, objectFit: "contain", borderRadius: 4 }}
            onError={() => handleLogoError(row.id)}
          />
        ) : (
          <div style={{ 
            width: 40, 
            height: 40, 
            background: "#f1f5f9", 
            borderRadius: 4, 
            display: "flex", 
            alignItems: "center", 
            justifyContent: "center", 
            fontSize: 10,
            color: "#64748b"
          }}>
            No Logo
          </div>
        )
      ),
    },
    { key: "id", label: "ID", render: (row) => row.id || "-" },
    { key: "companyName", label: "Company Name", render: (row) => row.companyName || row.name || "-" },
    { key: "email", label: "Email", render: (row) => row.email || "-" },
    {
      key: "status",
      label: "Status",
      render: (row) => <AdminStatusBadge status={row.status || "UNKNOWN"} />,
    },
    {
      key: "totalJobsPosted",
      label: "Jobs",
      render: (row) => row.totalJobsPosted || 0,
    },
    {
      key: "createdAt",
      label: "Registered",
      render: (row) => row.createdAt ? new Date(row.createdAt).toLocaleDateString() : "-",
    },
    {
      key: "action",
      label: "Actions",
      render: (row) => {
        const isPending = row.status === "PENDING_APPROVAL";
        const isSaving = savingId === row.id || rejectingId === row.id;
        const isDeleting = deletingId === row.id;
        
        return (
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button
              className="btn btn-outline btn-sm"
              onClick={() => navigate(`/admin/companies/${row.id}/review`)}
              disabled={isSaving || isDeleting}
            >
              Review
            </button>
            <button
              className="btn btn-outline btn-sm"
              onClick={() => handleEdit(row)}
              disabled={isSaving || isDeleting}
            >
              Edit
            </button>
            <button
              className="btn btn-coral btn-sm"
              onClick={() => handleDelete(row)}
              disabled={isSaving || isDeleting}
            >
              Delete
            </button>
            {isPending && (
              <>
                <button
                  className="btn btn-teal btn-sm"
                  onClick={() => handleApprove(row.id)}
                  disabled={isSaving || isDeleting}
                >
                  {savingId === row.id ? "..." : "Approve"}
                </button>
                <button
                  className="btn btn-coral btn-sm"
                  onClick={() => setShowRejectModal(row)}
                  disabled={isSaving || isDeleting}
                >
                  Reject
                </button>
              </>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <AdminLayout 
      title="Companies" 
      subtitle="Review, approve, edit, or delete company registrations"
    >
      {/* Messages */}
      {message && (
        <div className={`alert ${messageType === "error" ? "error" : "success"}`} style={{ marginBottom: 14 }}>
          {message}
        </div>
      )}
      
      {error && <div className="alert error" style={{ marginBottom: 14 }}>{error}</div>}

      {/* Filters */}
      <AdminFilterBar
        filters={filters}
        onFilterChange={setFilters}
        onReset={resetFilters}
        loading={loading}
      />

      {/* Bulk Actions */}
      <AdminBulkActionBar
        selectedIds={selectedIds}
        onClearSelection={() => setSelectedIds([])}
        onBulkApprove={handleBulkApprove}
        onBulkReject={handleBulkReject}
        bulkLoading={bulkLoading}
      />

      {/* Table */}
      <AdminTable
        columns={columns}
        rows={companies}
        emptyText={loading ? "Loading companies..." : "No companies found."}
      />

      {/* Pagination */}
      {total > 0 && (
        <AdminPagination
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
          loading={loading}
        />
      )}

      {/* Rejection Modal */}
      {showRejectModal && (
        <AdminRejectionModal
          isOpen={true}
          onClose={() => setShowRejectModal(null)}
          onConfirm={(reason, notes) => handleReject(showRejectModal.id, reason, notes)}
          companyName={showRejectModal.companyName}
          loading={rejectingId === showRejectModal.id}
        />
      )}

      {/* Edit Modal */}
      <AdminUserEditModal
        isOpen={!!editingCompany}
        onClose={() => setEditingCompany(null)}
        onSave={handleSaveEdit}
        user={editingCompany}
        userType="COMPANY"
        loading={savingId === editingCompany?.id}
      />

      {/* Delete Confirmation Modal */}
      <AdminDeleteConfirmModal
        isOpen={!!deletingCompany}
        onClose={() => setDeletingCompany(null)}
        onConfirm={handleConfirmDelete}
        user={deletingCompany}
        userType="COMPANY"
        loading={deletingId === deletingCompany?.id}
      />
    </AdminLayout>
  );
}