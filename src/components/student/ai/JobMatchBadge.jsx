/**
 * File: src/components/student/ai/JobMatchBadge.jsx
 * Purpose: Display match percentage badge on job cards
 */
import { getScoreColor, getScoreBgColor, getRecommendationText } from "../../../utils/aiHelpers";

export default function JobMatchBadge({ matchPercentage, size = "medium" }) {
  const scoreColor = getScoreColor(matchPercentage);
  const scoreBg = getScoreBgColor(matchPercentage);
  const recommendation = getRecommendationText(matchPercentage);

  const sizeStyles = {
    small: { padding: "2px 8px", fontSize: 11, width: 45 },
    medium: { padding: "4px 12px", fontSize: 13, width: 55 },
    large: { padding: "6px 16px", fontSize: 15, width: 65 },
  };

  const style = sizeStyles[size] || sizeStyles.medium;

  return (
    <div
      title={recommendation}
      style={{
        background: scoreBg,
        border: `1.5px solid ${scoreColor}`,
        borderRadius: 20,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 4,
        ...style,
      }}
    >
      <span style={{ fontWeight: 700, color: scoreColor }}>{matchPercentage}%</span>
      <span style={{ fontSize: size === "small" ? 9 : 11, color: scoreColor }}>match</span>
    </div>
  );
}