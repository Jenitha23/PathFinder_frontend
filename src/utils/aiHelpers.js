/**
 * File: src/utils/aiHelpers.js
 * Purpose: Helper functions for AI analytics display
 */

/**
 * Get color based on score
 * @param {number} score - Score from 0-100
 * @returns {string} - Color code
 */
export const getScoreColor = (score) => {
  if (score >= 80) return "#10B981"; // Green
  if (score >= 60) return "#F59E0B"; // Yellow/Orange
  if (score >= 40) return "#F97316"; // Orange
  return "#EF4444"; // Red
};

/**
 * Get background color based on score (for badges)
 */
export const getScoreBgColor = (score) => {
  if (score >= 80) return "rgba(16, 185, 129, 0.15)";
  if (score >= 60) return "rgba(245, 158, 11, 0.15)";
  if (score >= 40) return "rgba(249, 115, 22, 0.15)";
  return "rgba(239, 68, 68, 0.15)";
};

/**
 * Get recommendation text based on match percentage
 */
export const getRecommendationText = (percentage) => {
  if (percentage >= 85) return "Excellent Match - Highly Recommended";
  if (percentage >= 70) return "Good Match - Interview Recommended";
  if (percentage >= 50) return "Partial Match - Consider";
  return "Low Match - Needs Improvement";
};

/**
 * Get recommendation color
 */
export const getRecommendationColor = (percentage) => {
  if (percentage >= 85) return "#10B981";
  if (percentage >= 70) return "#3B82F6";
  if (percentage >= 50) return "#F59E0B";
  return "#EF4444";
};

/**
 * Format date for display
 */
export const formatAIDate = (dateString) => {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
};

/**
 * Calculate average score from array of matches
 */
export const calculateAverageScore = (matches) => {
  if (!matches || matches.length === 0) return 0;
  const sum = matches.reduce((acc, m) => acc + (m.matchPercentage || 0), 0);
  return Math.round(sum / matches.length);
};