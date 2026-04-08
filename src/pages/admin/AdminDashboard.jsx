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
  // Handle your actual API response structure
  if (data?.companies && Array.isArray(data.companies)) return data.companies;
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.data)) return data.data;
  return [];
}

// Renders the AdminDashboard component.
export default function AdminDashboard() {
  const [students, setStudents] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const [studentsRes, companiesRes, statsRes] = await Promise.all([
          api.get("/api/admin/students"),
          api.get("/api/admin/companies?pageSize=1000"),
          api.get("/api/admin/users/stats").catch(() => ({ data: null })),
        ]);

        console.log("Companies API response:", companiesRes.data);
        console.log("Stats API response:", statsRes?.data);

        setStudents(listFromResponse(studentsRes.data));
        setCompanies(listFromResponse(companiesRes.data));
        if (statsRes?.data) {
          setStats(statsRes.data);
        }
      } catch (err) {
        setError(err?.response?.data?.message || "Failed to load dashboard data.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  // Calculate company status counts directly from the companies array (accurate)
  const companyCounts = useMemo(() => {
    const counts = { 
      PENDING_APPROVAL: 0, 
      APPROVED: 0, 
      REJECTED: 0, 
      SUSPENDED: 0 
    };
    
    companies.forEach((c) => {
      const status = c.status;
      if (status === "PENDING_APPROVAL") {
        counts.PENDING_APPROVAL += 1;
      } else if (status === "APPROVED") {
        counts.APPROVED += 1;
      } else if (status === "REJECTED") {
        counts.REJECTED += 1;
      } else if (status === "SUSPENDED") {
        counts.SUSPENDED += 1;
      }
    });
    
    return counts;
  }, [companies]);

  // Use stats for total counts (more efficient), but fallback to array length
  const totalStudents = stats?.totalStudents ?? students.length;
  const totalCompanies = stats?.totalCompanies ?? companies.length;

  return (
    <AdminLayout title="Admin Dashboard" subtitle="Overview of students and companies">
      {error ? <div className="alert error" style={{ marginBottom: 14 }}>{error}</div> : null}

      <div className="admin-kpi-grid">
        <div className="card admin-kpi-card">
          <div className="badge badge-primary" style={{ marginBottom: 10 }}>ST</div>
          <div className="helper">Total Students</div>
          <div className="admin-kpi-value">{loading ? "..." : totalStudents}</div>
          <Link to="/admin/students" className="admin-link">View students</Link>
        </div>

        <div className="card admin-kpi-card">
          <div className="badge badge-teal" style={{ marginBottom: 10 }}>CO</div>
          <div className="helper">Total Companies</div>
          <div className="admin-kpi-value">{loading ? "..." : totalCompanies}</div>
          <Link to="/admin/companies" className="admin-link">View companies</Link>
        </div>
      </div>

      <div className="card" style={{ padding: 20, borderColor: "rgba(10, 36, 114, 0.14)" }}>
        <div style={{ fontWeight: 800, marginBottom: 12 }}>Company Approval Summary</div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <div className="admin-chip">
            <AdminStatusBadge status="PENDING_APPROVAL" /> 
            <b style={{ marginLeft: 8 }}>{companyCounts.PENDING_APPROVAL}</b>
          </div>
          <div className="admin-chip">
            <AdminStatusBadge status="APPROVED" /> 
            <b style={{ marginLeft: 8 }}>{companyCounts.APPROVED}</b>
          </div>
          <div className="admin-chip">
            <AdminStatusBadge status="REJECTED" /> 
            <b style={{ marginLeft: 8 }}>{companyCounts.REJECTED}</b>
          </div>
          <div className="admin-chip">
            <span className="badge" style={{ background: "#fee2e2", color: "#991b1b" }}>SUSPENDED</span>
            <b style={{ marginLeft: 8 }}>{companyCounts.SUSPENDED}</b>
          </div>
        </div>
        
        {stats?.generatedAt && (
          <div className="helper" style={{ fontSize: 11, marginTop: 12, textAlign: "right" }}>
            Stats updated: {new Date(stats.generatedAt).toLocaleString()}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}