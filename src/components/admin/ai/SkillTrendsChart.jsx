/**
 * File: src/components/admin/ai/SkillTrendsChart.jsx
 * Purpose: Display top in-demand skills from backend data
 */
import { useEffect, useRef } from "react";

export default function SkillTrendsChart({ skills }) {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    if (!skills || skills.length === 0) return;

    import("chart.js/auto").then(({ default: Chart }) => {
      if (chartRef.current) {
        chartRef.current.destroy();
      }

      const ctx = canvasRef.current?.getContext("2d");
      if (!ctx) return;

      const labels = skills.map(s => s.skillName);
      const data = skills.map(s => s.jobPostingsCount);

      chartRef.current = new Chart(ctx, {
        type: "bar",
        data: {
          labels: labels,
          datasets: [{
            label: "Job Postings Requiring Skill",
            data: data,
            backgroundColor: "rgba(59, 130, 246, 0.7)",
            borderColor: "#3B82F6",
            borderWidth: 1,
            borderRadius: 4,
          }],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { position: "top" },
            tooltip: {
              callbacks: {
                afterBody: (tooltipItems) => {
                  const skill = skills[tooltipItems[0].dataIndex];
                  if (skill && skill.gapCount !== undefined) {
                    return [
                      `Gap: ${skill.gapCount} positions`,
                      `Students with skill: ${skill.studentsWithSkill || 0}`,
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
              title: { display: true, text: "Number of Job Postings" },
            },
            x: {
              title: { display: true, text: "Skills" },
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
  }, [skills]);

  if (!skills || skills.length === 0) {
    return (
      <div style={{ height: 300, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p className="helper">No skill data available from backend</p>
      </div>
    );
  }

  return (
    <div style={{ height: 320 }}>
      <canvas ref={canvasRef} />
    </div>
  );
}