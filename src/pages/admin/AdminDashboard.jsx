/**
 * File: src/pages/admin/AdminDashboard.jsx
 * Purpose: Admin page for management workflows with analytics.
 */
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import AdminLayout from "../../components/admin/AdminLayout";
import AdminStatusBadge from "../../components/admin/AdminStatusBadge";
import DashboardStatsCards from "../../components/admin/dashboard/DashboardStatsCards";
import DashboardJobsPerMonthChart from "../../components/admin/dashboard/DashboardJobsPerMonthChart";
import DashboardTopJobsChart from "../../components/admin/dashboard/DashboardTopJobsChart";
import DashboardStatusPieChart from "../../components/admin/dashboard/DashboardStatusPieChart";
import DashboardDateRangePicker from "../../components/admin/dashboard/DashboardDateRangePicker";
import { useDashboardAnalytics } from "../../hooks/useDashboardAnalytics";
import { api } from "../../services/api";

function listFromResponse(data) {
  if (data?.companies && Array.isArray(data.companies)) return data.companies;
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.data)) return data.data;
  return [];
}

export default function AdminDashboard() {
  const [students, setStudents] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Analytics data from hook
  const {
    stats: analyticsStats,
    jobsPerMonth,
    topJobs,
    statusDistribution,
    loading: analyticsLoading,
    error: analyticsError,
    isEmpty: analyticsEmpty,
    dateRange,
    updateDateRange,
    refresh: refreshAnalytics,
  } = useDashboardAnalytics();

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

  const companyCounts = useMemo(() => {
    const counts = { 
      PENDING_APPROVAL: 0, 
      APPROVED: 0, 
      REJECTED: 0, 
      SUSPENDED: 0 
    };
    
    companies.forEach((c) => {
      const status = c.status;
      if (status === "PENDING_APPROVAL") counts.PENDING_APPROVAL += 1;
      else if (status === "APPROVED") counts.APPROVED += 1;
      else if (status === "REJECTED") counts.REJECTED += 1;
      else if (status === "SUSPENDED") counts.SUSPENDED += 1;
    });
    
    return counts;
  }, [companies]);

  const totalStudents = stats?.totalStudents ?? students.length;
  const totalCompanies = stats?.totalCompanies ?? companies.length;

  const handleDateRangeChange = (startDate, endDate, preset) => {
    updateDateRange(startDate, endDate, preset);
  };

  return (
    <AdminLayout title="Admin Dashboard" subtitle="Overview of platform activity and analytics">
      {error ? <div className="alert error" style={{ marginBottom: 14 }}>{error}</div> : null}

      {/* Date Range Picker for Analytics */}
      <div className="card" style={{ padding: 16, marginBottom: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
          <div>
            <span className="helper" style={{ fontSize: 12 }}>Analytics period:</span>
            <span style={{ fontWeight: 600, marginLeft: 8 }}>
              {analyticsStats?.dateRange?.displayText || "Last 30 days"}
            </span>
          </div>
          <DashboardDateRangePicker
            onRangeChange={handleDateRangeChange}
            loading={analyticsLoading}
            initialPreset="last30days"
          />
        </div>
      </div>

      {/* Analytics Stats Cards */}
      <DashboardStatsCards stats={analyticsStats} loading={analyticsLoading && !analyticsStats} />

      {/* Charts Row */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginTop: 20 }}>
        <div className="card" style={{ padding: 20 }}>
          <h3 style={{ marginBottom: 16, fontSize: 18 }}>Jobs Posted Per Month</h3>
          <DashboardJobsPerMonthChart data={jobsPerMonth} loading={analyticsLoading} />
        </div>
        <div className="card" style={{ padding: 20 }}>
          <h3 style={{ marginBottom: 16, fontSize: 18 }}>Top Jobs by Applications</h3>
          <DashboardTopJobsChart data={topJobs} loading={analyticsLoading} />
        </div>
      </div>

      {/* Status Distribution & Insights Row */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginTop: 20 }}>
        <div className="card" style={{ padding: 20 }}>
          <h3 style={{ marginBottom: 16, fontSize: 18 }}>Application Status Distribution</h3>
          <DashboardStatusPieChart data={statusDistribution} loading={analyticsLoading} />
        </div>

        <div className="card" style={{ padding: 20 }}>
          <h3 style={{ marginBottom: 16, fontSize: 18 }}>Quick Insights</h3>
          {analyticsStats?.insights ? (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div>
                <div className="helper" style={{ fontSize: 11 }}>Pending Approvals</div>
                <div style={{ fontSize: 24, fontWeight: 700, color: "#F59E0B" }}>
                  {analyticsStats.insights.pendingCompanies}
                </div>
                <div className="helper">companies waiting for review</div>
              </div>
              <div>
                <div className="helper" style={{ fontSize: 11 }}>New Students (30d)</div>
                <div style={{ fontSize: 24, fontWeight: 700, color: "#10B981" }}>
                  {analyticsStats.insights.newStudentsLast30Days}
                </div>
                <div className="helper">new registrations</div>
              </div>
              <div>
                <div className="helper" style={{ fontSize: 11 }}>New Jobs (30d)</div>
                <div style={{ fontSize: 24, fontWeight: 700, color: "#3B82F6" }}>
                  {analyticsStats.insights.newJobsLast30Days}
                </div>
                <div className="helper">jobs posted recently</div>
              </div>
              <div>
                <div className="helper" style={{ fontSize: 11 }}>New Applications (30d)</div>
                <div style={{ fontSize: 24, fontWeight: 700, color: "#8B5CF6" }}>
                  {analyticsStats.insights.newApplicationsLast30Days}
                </div>
                <div className="helper">submissions</div>
              </div>
              <div>
                <div className="helper" style={{ fontSize: 11 }}>Expiring Soon</div>
                <div style={{ fontSize: 24, fontWeight: 700, color: "#EF4444" }}>
                  {analyticsStats.insights.jobsExpiringSoon}
                </div>
                <div className="helper">deadline in 7 days</div>
              </div>
            </div>
          ) : (
            <div className="helper" style={{ textAlign: "center", padding: 40 }}>
              Loading insights...
            </div>
          )}
        </div>
      </div>

      {/* Existing KPIs and Company Summary (keeping original content) */}
      <div className="admin-kpi-grid" style={{ marginTop: 20 }}>
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

      {/* ADDED: Reports Quick Links Card */}
      <div className="card" style={{ padding: 20, marginTop: 20 }}>
        <h3 style={{ marginBottom: 16, fontSize: 18 }}>📊 Reports</h3>
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
          <Link 
            to="/admin/reports/jobs-per-month" 
            className="btn btn-outline"
            style={{ display: "inline-flex", alignItems: "center", gap: 8 }}
          >
            Jobs Per Month Report →
          </Link>
          <Link 
            to="/admin/reports/applications-per-job" 
            className="btn btn-outline"
            style={{ display: "inline-flex", alignItems: "center", gap: 8 }}
          >
            Applications Per Job Report →
          </Link>
        </div>
      </div>
    </AdminLayout>
  );
}