/**
 * File: src/components/admin/dashboard/DashboardLoadingState.jsx
 * Purpose: Loading skeleton for dashboard
 */
export default function DashboardLoadingState() {
  return (
    <>
      <div className="admin-kpi-grid">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="card" style={{ padding: 20 }}>
            <div className="skeleton" style={{ width: "60%", height: 20, marginBottom: 12 }} />
            <div className="skeleton" style={{ width: "40%", height: 32 }} />
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginTop: 20 }}>
        <div className="card" style={{ padding: 20 }}>
          <div className="skeleton" style={{ width: "40%", height: 24, marginBottom: 16 }} />
          <div className="skeleton" style={{ width: "100%", height: 250 }} />
        </div>
        <div className="card" style={{ padding: 20 }}>
          <div className="skeleton" style={{ width: "40%", height: 24, marginBottom: 16 }} />
          <div className="skeleton" style={{ width: "100%", height: 250 }} />
        </div>
      </div>

      <div className="card" style={{ padding: 20, marginTop: 20 }}>
        <div className="skeleton" style={{ width: "30%", height: 24, marginBottom: 16 }} />
        <div className="skeleton" style={{ width: "100%", height: 280 }} />
      </div>
    </>
  );
}