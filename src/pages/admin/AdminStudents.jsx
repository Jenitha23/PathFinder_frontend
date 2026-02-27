import { useEffect, useState } from "react";
import AdminLayout from "../../components/admin/AdminLayout";
import AdminTable from "../../components/admin/AdminTable";
import { api } from "../../services/api";

function listFromResponse(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.data)) return data.data;
  return [];
}

export default function AdminStudents() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const { data } = await api.get("/api/admin/students");
        setStudents(listFromResponse(data));
      } catch (err) {
        const message = err?.response?.data?.message || "Failed to load students.";
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const columns = [
    { key: "id", label: "ID", render: (row) => row.id || row.studentId || "-" },
    { key: "fullName", label: "Full Name", render: (row) => row.fullName || row.name || "-" },
    { key: "email", label: "Email", render: (row) => row.email || "-" },
  ];

  return (
    <AdminLayout title="Students" subtitle="All registered student users">
      {error ? <div className="alert error" style={{ marginBottom: 14 }}>{error}</div> : null}
      {loading ? <div className="alert info" style={{ marginBottom: 14 }}>Loading students...</div> : null}

      <AdminTable
        columns={columns}
        rows={students}
        emptyText={loading ? "Loading..." : "No students found."}
      />
    </AdminLayout>
  );
}
