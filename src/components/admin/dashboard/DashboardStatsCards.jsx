/**
 * File: src/components/admin/dashboard/DashboardStatsCards.jsx
 * Purpose: Display main statistics cards on dashboard
 */
import { Link } from "react-router-dom";

const StatCard = ({ title, value, icon, color, linkTo, linkText }) => (
  <div className="card" style={{ padding: 20 }}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
      <div>
        <div className="helper" style={{ fontSize: 12, marginBottom: 4 }}>{title}</div>
        <div style={{ fontSize: 32, fontWeight: 700 }}>{value ?? 0}</div>
      </div>
      <div style={{ fontSize: 28, color: color }}>{icon}</div>
    </div>
    {linkTo && (
      <Link to={linkTo} style={{ fontSize: 13, marginTop: 12, display: "inline-block" }}>
        {linkText} →
      </Link>
    )}
  </div>
);

export default function DashboardStatsCards({ stats, loading }) {
  if (loading) {
    return (
      <div className="admin-kpi-grid">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="card" style={{ padding: 20, height: 120 }}>
            <div className="skeleton" style={{ width: "60%", height: 20, marginBottom: 12 }} />
            <div className="skeleton" style={{ width: "40%", height: 32 }} />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="admin-kpi-grid">
      <StatCard
        title="Total Students"
        value={stats?.totalStudents}
        color="#3B82F6"
        linkTo="/admin/students"
        linkText="View students"
      />
      <StatCard
        title="Total Companies"
        value={stats?.totalCompanies}
        color="#10B981"
        linkTo="/admin/companies"
        linkText="View companies"
      />
      <StatCard
        title="Total Jobs"
        value={stats?.totalJobs}
        color="#F59E0B"
        linkTo="/admin/companies"
        linkText="View jobs"
      />
      <StatCard
        title="Total Applications"
        value={stats?.totalApplications}
        color="#8B5CF6"
        linkTo="/admin/companies"
        linkText="View applications"
      />
    </div>
  );
}