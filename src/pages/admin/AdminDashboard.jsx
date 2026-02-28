/**
 * File: src/pages/admin/AdminDashboard.jsx
 * Purpose: Admin page for management workflows.
 */
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import AdminLayout from "../../components/admin/AdminLayout";
import AdminStatusBadge from "../../components/admin/AdminStatusBadge";
import { api } from "../../services/api";

// Fetches or derives data needed for this section.
function listFromResponse(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.data)) return data.data;
  return [];
}

// Renders the AdminDashboard component.
export default function AdminDashboard() {
  const [students, setStudents] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    // Fetches or derives data needed for this section.
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const [studentsRes, companiesRes] = await Promise.all([
          api.get("/api/admin/students"),
          api.get("/api/admin/companies"),
        ]);

        setStudents(listFromResponse(studentsRes.data));
        setCompanies(listFromResponse(companiesRes.data));
      } catch (err) {
        setError(err?.response?.data?.message || "Failed to load dashboard data.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const companyCounts = useMemo(() => {
    const counts = { PENDING_APPROVAL: 0, APPROVED: 0, REJECTED: 0 };
    companies.forEach((c) => {
      const status = c.status || c.companyStatus;
      if (counts[status] !== undefined) counts[status] += 1;
    });
    return counts;
  }, [companies]);

  return (
    <AdminLayout title="Admin Dashboard" subtitle="Overview of students and companies">
      {error ? <div className="alert error" style={{ marginBottom: 14 }}>{error}</div> : null}

      <div className="admin-kpi-grid">
        <div className="card admin-kpi-card">
          <div className="badge badge-primary" style={{ marginBottom: 10 }}>ST</div>
          <div className="helper">Total Students</div>
          <div className="admin-kpi-value">{loading ? "..." : students.length}</div>
          <Link to="/admin/students" className="admin-link">View students</Link>
        </div>

        <div className="card admin-kpi-card">
          <div className="badge badge-teal" style={{ marginBottom: 10 }}>CO</div>
          <div className="helper">Total Companies</div>
          <div className="admin-kpi-value">{loading ? "..." : companies.length}</div>
          <Link to="/admin/companies" className="admin-link">View companies</Link>
        </div>
      </div>

      <div className="card" style={{ padding: 20, borderColor: "rgba(10, 36, 114, 0.14)" }}>
        <div style={{ fontWeight: 800, marginBottom: 12 }}>Company Approval Summary</div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <div className="admin-chip"><AdminStatusBadge status="PENDING_APPROVAL" /> <b>{companyCounts.PENDING_APPROVAL}</b></div>
          <div className="admin-chip"><AdminStatusBadge status="APPROVED" /> <b>{companyCounts.APPROVED}</b></div>
          <div className="admin-chip"><AdminStatusBadge status="REJECTED" /> <b>{companyCounts.REJECTED}</b></div>
        </div>
      </div>
    </AdminLayout>
  );
}

