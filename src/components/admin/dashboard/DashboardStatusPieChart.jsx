/**
 * File: src/components/admin/dashboard/DashboardStatusPieChart.jsx
 * Purpose: Pie chart for application status distribution
 */
import { useEffect, useRef } from "react";

const STATUS_LABELS = {
  Pending: "Pending",
  Shortlisted: "Shortlisted",
  Rejected: "Rejected",
  Accepted: "Accepted",
};

const STATUS_COLORS = {
  Pending: "#F59E0B",
  Shortlisted: "#3B82F6",
  Rejected: "#EF4444",
  Accepted: "#10B981",
};

export default function DashboardStatusPieChart({ data, loading }) {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    if (loading || !data?.items?.length) return;

    import("chart.js/auto").then(({ default: Chart }) => {
      if (chartRef.current) {
        chartRef.current.destroy();
      }

      const ctx = canvasRef.current?.getContext("2d");
      if (!ctx) return;

      const labels = data.items.map(item => STATUS_LABELS[item.status] || item.status);
      const counts = data.items.map(item => item.count);
      const colors = data.items.map(item => STATUS_COLORS[item.status] || item.color);

      chartRef.current = new Chart(ctx, {
        type: "doughnut",
        data: {
          labels: labels,
          datasets: [
            {
              data: counts,
              backgroundColor: colors,
              borderWidth: 0,
              hoverOffset: 10,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: "right",
              labels: {
                usePointStyle: true,
                boxWidth: 10,
              },
            },
            tooltip: {
              callbacks: {
                label: (context) => {
                  const label = context.label || "";
                  const value = context.raw || 0;
                  const percentage = data.items[context.dataIndex]?.percentage || 0;
                  return `${label}: ${value} (${percentage}%)`;
                },
              },
            },
          },
        },
      });
    });

    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
      }
    };
  }, [data, loading]);

  if (loading) {
    return (
      <div style={{ height: 250, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div className="skeleton" style={{ width: 200, height: 200, borderRadius: "50%" }} />
      </div>
    );
  }

  if (!data?.items?.length || data.total === 0) {
    return (
      <div style={{ height: 250, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column" }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>🍩</div>
        <div className="helper">No application data available</div>
      </div>
    );
  }

  return (
    <div style={{ height: 280 }}>
      <canvas ref={canvasRef} />
    </div>
  );
}