/**
 * File: src/components/student/ai/MatchScoreGauge.jsx
 * Purpose: Circular gauge for displaying match score
 */
import { getScoreColor } from "../../../utils/aiHelpers";

export default function MatchScoreGauge({ score, size = 120, title = "Match Score" }) {
  const radius = (size - 20) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const scoreColor = getScoreColor(score);

  return (
    <div style={{ textAlign: "center", display: "inline-block" }}>
      <div style={{ position: "relative", width: size, height: size }}>
        <svg width={size} height={size}>
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#E5E7EB"
            strokeWidth="8"
          />
          {/* Score circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={scoreColor}
            strokeWidth="8"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
            style={{ transition: "stroke-dashoffset 0.5s ease" }}
          />
        </svg>
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: size * 0.25, fontWeight: 800, color: scoreColor }}>
            {score}%
          </div>
          <div style={{ fontSize: size * 0.08, color: "#6B7280" }}>{title}</div>
        </div>
      </div>
    </div>
  );
}