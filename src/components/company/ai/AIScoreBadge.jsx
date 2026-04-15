/**
 * File: src/components/company/ai/AIScoreBadge.jsx
 * Purpose: Display AI match score badge for applicants
 */
import { getScoreColor, getScoreBgColor, getRecommendationText } from "../../../utils/aiHelpers";

export default function AIScoreBadge({ score, size = "medium", showTooltip = true }) {
  const scoreColor = getScoreColor(score);
  const scoreBg = getScoreBgColor(score);
  const recommendation = getRecommendationText(score);

  const sizeStyles = {
    small: { padding: "2px 6px", fontSize: 10, width: 40 },
    medium: { padding: "3px 10px", fontSize: 12, width: 48 },
    large: { padding: "5px 14px", fontSize: 14, width: 56 },
  };

  const style = sizeStyles[size] || sizeStyles.medium;

  const badge = (
    <div
      style={{
        background: scoreBg,
        border: `1.5px solid ${scoreColor}`,
        borderRadius: 20,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 3,
        ...style,
      }}
    >
      <span style={{ fontWeight: 700, color: scoreColor }}>{score}%</span>
      <span style={{ fontSize: size === "small" ? 8 : 10, color: scoreColor }}>AI</span>
    </div>
  );

  if (showTooltip) {
    return (
      <div title={recommendation} style={{ cursor: "help" }}>
        {badge}
      </div>
    );
  }

  return badge;
}