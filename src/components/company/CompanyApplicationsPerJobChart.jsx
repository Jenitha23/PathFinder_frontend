/**
 * File: src/components/company/CompanyApplicationsPerJobChart.jsx
 * Purpose: Bar chart for applications per job (reusable for both roles)
 */
import { useEffect, useRef } from "react";

export default function CompanyApplicationsPerJobChart({ data, loading, onBarClick }) {
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

      const labels = data.items.map(item => 
        item.jobTitle.length > 25 ? item.jobTitle.substring(0, 22) + "..." : item.jobTitle
      );
      const counts = data.items.map(item => item.totalApplications);

      chartRef.current = new Chart(ctx, {
        type: "bar",
        data: {
          labels: labels,
          datasets: [
            {
              label: "Total Applications",
              data: counts,
              backgroundColor: "rgba(59, 130, 246, 0.7)",
              borderColor: "#3B82F6",
              borderWidth: 1,
              borderRadius: 4,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: "top",
            },
            tooltip: {
              callbacks: {
                afterBody: (tooltipItems) => {
                  const index = tooltipItems[0].dataIndex;
                  const job = data.items[index];
                  if (job) {
                    return [
                      `Company: ${job.companyName}`,
                      `Pending: ${job.pendingCount}`,
                      `Shortlisted: ${job.shortlistedCount}`,
                      `Rejected: ${job.rejectedCount}`,
                      `Accepted: ${job.acceptedCount}`,
                    ];
                  }
                  return [];
                },
              },
            },
          },
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                stepSize: 1,
              },
              title: {
                display: true,
                text: "Number of Applications",
              },
            },
            x: {
              title: {
                display: true,
                text: "Job Title",
              },
            },
          },
          onClick: (event, activeElements) => {
            if (activeElements.length > 0 && onBarClick) {
              const index = activeElements[0].datasetIndex;
              const job = data.items[index];
              if (job) onBarClick(job);
            }
          },
        },
      });
    });

    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
      }
    };
  }, [data, loading, onBarClick]);

  if (loading) {
    return (
      <div style={{ height: 360, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div className="skeleton" style={{ width: "100%", height: 300 }} />
      </div>
    );
  }

  if (!data?.items?.length) {
    return (
      <div
        style={{
          height: 360,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
        }}
      >
        <div style={{ fontSize: 48, marginBottom: 12 }}>📊</div>
        <div className="helper">No application data available for the selected period.</div>
      </div>
    );
  }

  return (
    <div style={{ height: 380 }}>
      <canvas ref={canvasRef} />
    </div>
  );
}