/**
 * File: src/components/admin/dashboard/DashboardTopJobsChart.jsx
 * Purpose: Bar chart for top jobs by application count
 */
import { useEffect, useRef, useState } from "react";

export default function DashboardTopJobsChart({ data, loading, onViewDetails }) {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);
  const [selectedJob, setSelectedJob] = useState(null);

  useEffect(() => {
    if (loading || !data?.labels?.length) return;

    import("chart.js/auto").then(({ default: Chart }) => {
      if (chartRef.current) {
        chartRef.current.destroy();
      }

      const ctx = canvasRef.current?.getContext("2d");
      if (!ctx) return;

      chartRef.current = new Chart(ctx, {
        type: "bar",
        data: {
          labels: data.labels,
          datasets: [
            {
              label: "Applications",
              data: data.data,
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
                  const job = data.details?.[index];
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
            if (activeElements.length > 0) {
              const index = activeElements[0].datasetIndex;
              const job = data.details?.[index];
              if (job && onViewDetails) {
                onViewDetails(job);
              }
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
  }, [data, loading, onViewDetails]);

  if (loading) {
    return (
      <div style={{ height: 300, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div className="skeleton" style={{ width: "100%", height: 250 }} />
      </div>
    );
  }

  if (!data?.labels?.length) {
    return (
      <div style={{ height: 300, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column" }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>📭</div>
        <div className="helper">No job application data available</div>
      </div>
    );
  }

  return (
    <div style={{ height: 320 }}>
      <canvas ref={canvasRef} />
    </div>
  );
}