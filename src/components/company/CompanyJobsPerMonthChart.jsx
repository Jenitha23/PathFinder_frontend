/**
 * File: src/components/company/CompanyJobsPerMonthChart.jsx
 * Purpose: Line chart for jobs posted per month (reusable for company)
 */
import { useEffect, useRef } from "react";

export default function CompanyJobsPerMonthChart({ data, loading }) {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    if (loading || !data?.labels?.length) return;

    import("chart.js/auto").then(({ default: Chart }) => {
      if (chartRef.current) {
        chartRef.current.destroy();
      }

      const ctx = canvasRef.current?.getContext("2d");
      if (!ctx) return;

      const datasets = data.datasets?.map((dataset) => ({
        label: dataset.label,
        data: dataset.data,
        borderColor: dataset.borderColor,
        backgroundColor: dataset.backgroundColor,
        borderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
        tension: 0.3,
        fill: true,
      })) || [];

      chartRef.current = new Chart(ctx, {
        type: "line",
        data: {
          labels: data.labels,
          datasets: datasets,
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: "top",
            },
            tooltip: {
              mode: "index",
              intersect: false,
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
                text: "Number of Jobs Posted",
              },
            },
            x: {
              title: {
                display: true,
                text: "Month",
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
      <div style={{ height: 320, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div className="skeleton" style={{ width: "100%", height: 280 }} />
      </div>
    );
  }

  if (!data?.labels?.length) {
    return (
      <div
        style={{
          height: 320,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
        }}
      >
        <div style={{ fontSize: 48, marginBottom: 12 }}>📊</div>
        <div className="helper">No jobs posted in the selected period.</div>
      </div>
    );
  }

  return (
    <div style={{ height: 340 }}>
      <canvas ref={canvasRef} />
    </div>
  );
}