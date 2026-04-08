/**
 * File: src/pages/admin/AdminStudents.jsx
 * Purpose: Admin page for student management with edit/delete functionality
 */
import { useState } from "react";
import AdminLayout from "../../components/admin/AdminLayout";
import AdminTable from "../../components/admin/AdminTable";
import AdminStatusBadge from "../../components/admin/AdminStatusBadge";
import AdminPagination from "../../components/admin/AdminPagination";
import AdminUserSearchBar from "../../components/admin/AdminUserSearchBar";
import AdminUserEditModal from "../../components/admin/AdminUserEditModal";
import AdminDeleteConfirmModal from "../../components/admin/AdminDeleteConfirmModal";
import { useAdminStudents } from "../../hooks/useAdminStudents";

export default function AdminStudents() {
  const {
    students,
    total,
    page,
    pageSize,
    totalPages,
    loading,
    error,
    filters,
    savingId,
    deletingId,
    updateStudent,
    deleteStudent,
    setPage,
    setPageSize,
    setFilters,
    resetFilters,
    loadStudents,
  } = useAdminStudents();

  const [editingStudent, setEditingStudent] = useState(null);
  const [deletingStudent, setDeletingStudent] = useState(null);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  const showMessage = (msg, type = "success") => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => {
      setMessage("");
      setMessageType("");
    }, 3000);
  };

  const handleEdit = (student) => {
    setEditingStudent(student);
  };

  const handleSaveEdit = async (data) => {
    const result = await updateStudent(editingStudent.id, data);
    if (result.success) {
      showMessage(result.message);
      setEditingStudent(null);
    } else {
      showMessage(result.message, "error");
    }
  };

  const handleDelete = (student) => {
    setDeletingStudent(student);
  };

  const handleConfirmDelete = async () => {
    const result = await deleteStudent(deletingStudent.id);
    if (result.success) {
      showMessage(result.message);
      setDeletingStudent(null);
    } else {
      showMessage(result.message, "error");
    }
  };

  const columns = [
    { key: "id", label: "ID", render: (row) => row.id || "-" },
    { 
      key: "fullName", 
      label: "Full Name", 
      render: (row) => row.fullName || row.FullName || "-" 
    },
    { 
      key: "email", 
      label: "Email", 
      render: (row) => row.email || "-" 
    },
    {
      key: "status",
      label: "Status",
      render: (row) => <AdminStatusBadge status={row.status || "ACTIVE"} />,
    },
    {
      key: "applicationsCount",
      label: "Applications",
      render: (row) => row.applicationsCount || 0,
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
        const isSaving = savingId === row.id;
        const isDeleting = deletingId === row.id;
        
        return (
          <div style={{ display: "flex", gap: 8 }}>
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
          </div>
        );
      },
    },
  ];

  return (
    <AdminLayout 
      title="Students" 
      subtitle="View, edit, and manage student accounts"
    >
      {/* Messages */}
      {message && (
        <div className={`alert ${messageType === "error" ? "error" : "success"}`} style={{ marginBottom: 14 }}>
          {message}
        </div>
      )}
      
      {error && <div className="alert error" style={{ marginBottom: 14 }}>{error}</div>}

      {/* Search and Filters */}
      <AdminUserSearchBar
        filters={filters}
        onFilterChange={setFilters}
        onReset={resetFilters}
        loading={loading}
        userType="STUDENT"
      />

      {/* Table */}
      <AdminTable
        columns={columns}
        rows={students}
        emptyText={loading ? "Loading students..." : "No students found."}
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

      {/* Edit Modal */}
      <AdminUserEditModal
        isOpen={!!editingStudent}
        onClose={() => setEditingStudent(null)}
        onSave={handleSaveEdit}
        user={editingStudent}
        userType="STUDENT"
        loading={savingId === editingStudent?.id}
      />

      {/* Delete Confirmation Modal */}
      <AdminDeleteConfirmModal
        isOpen={!!deletingStudent}
        onClose={() => setDeletingStudent(null)}
        onConfirm={handleConfirmDelete}
        user={deletingStudent}
        userType="STUDENT"
        loading={deletingId === deletingStudent?.id}
      />
    </AdminLayout>
  );
}