/**
 * File: src/components/admin/ai/TalentDemandCard.jsx
 * Purpose: Display talent demand insights
 */
import { Users, Briefcase, TrendingUp, Target } from "lucide-react";

export default function TalentDemandCard({ data }) {
  if (!data) {
    return (
      <div className="card" style={{ padding: 20, textAlign: "center" }}>
        <p className="helper">No talent demand data available</p>
      </div>
    );
  }

  const items = [
    { label: "Most Sought-After Role", value: data.mostSoughtAfterRole || "N/A", icon: <Target size={18} />, color: "#F59E0B" },
    { label: "Fastest Growing Category", value: data.fastestGrowingCategory || "N/A", icon: <TrendingUp size={18} />, color: "#10B981" },
    { label: "Total Active Students", value: data.totalActiveStudents || 0, icon: <Users size={18} />, color: "#3B82F6" },
    { label: "Total Active Jobs", value: data.totalActiveJobs || 0, icon: <Briefcase size={18} />, color: "#8B5CF6" },
    { label: "Avg Applicants per Job", value: data.averageApplicantsPerJob?.toFixed(1) || 0, icon: <TrendingUp size={18} />, color: "#EC4899" },
    { label: "Student-to-Job Ratio", value: data.studentToJobRatio?.toFixed(1) || 0, icon: <Users size={18} />, color: "#14B8A6" },
  ];

  return (
    <div className="card" style={{ padding: 20 }}>
      <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>📊 Talent Demand Insights</h3>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16 }}>
        {items.map((item) => (
          <div key={item.label} style={{ padding: 12, background: "var(--bg)", borderRadius: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <span style={{ color: item.color }}>{item.icon}</span>
              <span className="helper" style={{ fontSize: 11 }}>{item.label}</span>
            </div>
            <div style={{ fontSize: 20, fontWeight: 700, color: item.color }}>
              {item.value}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}