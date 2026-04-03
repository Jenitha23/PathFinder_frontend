/**
 * File: src/components/company/ApplicationStats.jsx
 * Purpose: Display application statistics for a job
 */
export default function ApplicationStats({ stats }) {
  if (!stats) return null;

  const statCards = [
    { label: "Total Applications", value: stats.total, icon: "📊", color: "#0A5F75" },
    { label: "Pending Review", value: stats.pending, icon: "⏳", color: "#FF9F1C" },
    { label: "Shortlisted", value: stats.shortlisted, icon: "⭐", color: "#2EC4B6" },
    { label: "Rejected", value: stats.rejected, icon: "❌", color: "#FF6B6B" },
    { label: "Accepted", value: stats.accepted, icon: "✅", color: "#0A5F75" },
  ];

  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 16, fontFamily: "'Sora', sans-serif" }}>
        Application Statistics
      </div>
      <div style={{ 
        display: "grid", 
        gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", 
        gap: 14 
      }}>
        {statCards.map((stat, idx) => (
          <div
            key={stat.label}
            className="card"
            style={{
              padding: "18px 16px",
              borderRadius: 16,
              animation: `fadeUp 0.3s ease ${idx * 0.05}s both`,
              borderTop: `3px solid ${stat.color}`,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
              <span style={{ fontSize: 24 }}>{stat.icon}</span>
              <div>
                <div style={{ fontSize: 13, color: "var(--muted)" }}>{stat.label}</div>
                <div style={{ fontSize: 28, fontWeight: 800, fontFamily: "'Sora', sans-serif", color: stat.color }}>
                  {stat.value}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Recent Activity Timeline */}
      {stats.byDate && stats.byDate.length > 0 && (
        <div className="card" style={{ padding: "20px 24px", marginTop: 16 }}>
          <div style={{ fontWeight: 600, marginBottom: 16, fontSize: 14 }}>📈 Recent Application Activity</div>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            {stats.byDate.map((item) => (
              <div key={item.date} style={{ textAlign: "center", minWidth: 80 }}>
                <div style={{ fontSize: 11, color: "var(--muted)" }}>
                  {new Date(item.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                </div>
                <div style={{ fontSize: 20, fontWeight: 700, color: "var(--teal)" }}>{item.count}</div>
                <div style={{ fontSize: 10, color: "var(--muted)" }}>applications</div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      <style>{`
        @keyframes fadeUp {
          from {
            opacity: 0;
            transform: translateY(15px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}