/**
 * File: src/components/student/ai/AtsScoreCard.jsx
 * Purpose: Display ATS score with strengths and suggestions
 */
import { useState } from "react";
import { getScoreColor, getScoreBgColor, formatAIDate } from "../../../utils/aiHelpers";
import MatchScoreGauge from "./MatchScoreGauge";

export default function AtsScoreCard({ analysis, loading, onRefresh, jobTitle }) {
  const [showDetails, setShowDetails] = useState(false);

  if (loading) {
    return (
      <div className="card" style={{ padding: 24, textAlign: "center" }}>
        <div className="skeleton" style={{ width: "100%", height: 200, margin: "0 auto" }} />
        <p className="helper" style={{ marginTop: 16 }}>Analyzing your CV...</p>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="card" style={{ padding: 24, textAlign: "center" }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>📄</div>
        <h3 style={{ marginBottom: 8 }}>No CV Analysis Yet</h3>
        <p className="helper" style={{ marginBottom: 16 }}>
          Upload your CV in your profile to get an ATS score and improvement suggestions.
        </p>
        <button className="btn btn-primary" onClick={onRefresh}>
          Analyze Now
        </button>
      </div>
    );
  }

  const scoreColor = getScoreColor(analysis.score);
  const scoreBg = getScoreBgColor(analysis.score);

  return (
    <div className="card" style={{ padding: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20, flexWrap: "wrap", gap: 16 }}>
        <div>
          <div className="badge badge-primary" style={{ marginBottom: 8 }}>
            🤖 AI-Powered Analysis
          </div>
          <h3 style={{ fontSize: 20, fontWeight: 700 }}>
            {jobTitle ? `ATS Score for "${jobTitle}"` : "CV ATS Score"}
          </h3>
          {analysis.analyzedAt && (
            <p className="helper" style={{ fontSize: 12, marginTop: 4 }}>
              Analyzed: {formatAIDate(analysis.analyzedAt)}
            </p>
          )}
        </div>
        <button
          onClick={onRefresh}
          className="btn btn-outline btn-sm"
          disabled={loading}
        >
          🔄 Refresh
        </button>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 32, alignItems: "center", marginBottom: 24 }}>
        <MatchScoreGauge score={analysis.score} size={140} title="ATS Score" />
        
        <div style={{ flex: 1 }}>
          <div
            style={{
              background: scoreBg,
              padding: "12px 16px",
              borderRadius: 12,
              borderLeft: `4px solid ${scoreColor}`,
            }}
          >
            <div style={{ fontWeight: 600, marginBottom: 4 }}>Summary</div>
            <p className="helper" style={{ margin: 0 }}>
              {analysis.score >= 80
                ? "Excellent! Your CV is well-optimized for ATS systems."
                : analysis.score >= 60
                ? "Good! Your CV has solid potential but could use some improvements."
                : analysis.score >= 40
                ? "Your CV needs significant improvements to pass ATS screening."
                : "Your CV may struggle with ATS systems. Review suggestions below."}
            </p>
          </div>
        </div>
      </div>

      <button
        onClick={() => setShowDetails(!showDetails)}
        className="btn btn-ghost btn-sm"
        style={{ marginBottom: showDetails ? 16 : 0 }}
      >
        {showDetails ? "▼ Hide Details" : "▶ Show Detailed Analysis"}
      </button>

      {showDetails && (
        <>
          {/* Strengths */}
          {analysis.strengths && analysis.strengths.length > 0 && (
            <div style={{ marginBottom: 20 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                <span style={{ fontSize: 20 }}>✅</span>
                <h4 style={{ fontWeight: 600 }}>Strengths</h4>
              </div>
              <ul style={{ paddingLeft: 20, color: "var(--text)" }}>
                {analysis.strengths.map((s, i) => (
                  <li key={i} style={{ marginBottom: 6 }}>{s}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Suggestions */}
          {analysis.suggestions && analysis.suggestions.length > 0 && (
            <div style={{ marginBottom: 20 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                <span style={{ fontSize: 20 }}>💡</span>
                <h4 style={{ fontWeight: 600 }}>Improvement Suggestions</h4>
              </div>
              <ul style={{ paddingLeft: 20, color: "var(--text)" }}>
                {analysis.suggestions.map((s, i) => (
                  <li key={i} style={{ marginBottom: 6, color: "#F59E0B" }}>📌 {s}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Missing Keywords */}
          {analysis.missingKeywords && analysis.missingKeywords.length > 0 && (
            <div style={{ marginBottom: 20 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                <span style={{ fontSize: 20 }}>⚠️</span>
                <h4 style={{ fontWeight: 600 }}>Missing Keywords</h4>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {analysis.missingKeywords.map((kw, i) => (
                  <span
                    key={i}
                    style={{
                      background: "#FEF3C7",
                      color: "#92400E",
                      padding: "4px 12px",
                      borderRadius: 20,
                      fontSize: 13,
                    }}
                  >
                    {kw}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Present Keywords */}
          {analysis.presentKeywords && analysis.presentKeywords.length > 0 && (
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                <span style={{ fontSize: 20 }}>🎯</span>
                <h4 style={{ fontWeight: 600 }}>Matched Keywords</h4>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {analysis.presentKeywords.map((kw, i) => (
                  <span
                    key={i}
                    style={{
                      background: "#D1FAE5",
                      color: "#065F46",
                      padding: "4px 12px",
                      borderRadius: 20,
                      fontSize: 13,
                    }}
                  >
                    ✓ {kw}
                  </span>
                ))}
              </div>
            </div>
          )}

          {analysis.formattingFeedback && (
            <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid var(--border)" }}>
              <div className="helper" style={{ fontSize: 13 }}>
                <strong>Formatting Feedback:</strong> {analysis.formattingFeedback}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}