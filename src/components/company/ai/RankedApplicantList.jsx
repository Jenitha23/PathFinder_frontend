/**
 * File: src/components/company/ai/RankedApplicantList.jsx
 * Purpose: Display AI-ranked applicants with scores and reasoning
 */
import { useState } from "react";
import AIScoreBadge from "./AIScoreBadge";
import { ChevronDown, ChevronUp, TrendingUp, Award } from "lucide-react";

export default function RankedApplicantList({ applicants, loading, onViewApplicant }) {
  const [expandedId, setExpandedId] = useState(null);

  if (loading) {
    return (
      <div style={{ display: "grid", gap: 12 }}>
        {[1, 2, 3].map(i => (
          <div key={i} className="card" style={{ padding: 20, height: 100 }}>
            <div className="skeleton" style={{ width: "100%", height: "100%" }} />
          </div>
        ))}
      </div>
    );
  }

  if (!applicants || applicants.length === 0) {
    return (
      <div className="card" style={{ padding: 40, textAlign: "center" }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🤖</div>
        <h3>No Applicants Yet</h3>
        <p className="helper">When students apply, they will appear here with AI rankings.</p>
      </div>
    );
  }

  const getRankIcon = (rank) => {
    if (rank === 1) return "🥇";
    if (rank === 2) return "🥈";
    if (rank === 3) return "🥉";
    return `#${rank}`;
  };

  return (
    <div style={{ display: "grid", gap: 14 }}>
      {/* Header Stats */}
      <div style={{ display: "flex", gap: 16, marginBottom: 8, flexWrap: "wrap" }}>
        <div className="card" style={{ padding: "12px 20px", background: "var(--teal-dim)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <TrendingUp size={18} color="var(--teal)" />
            <span>Average AI Score: </span>
            <strong style={{ color: "var(--teal)" }}>
              {Math.round(applicants.reduce((a, b) => a + (b.matchScore || 0), 0) / applicants.length)}%
            </strong>
          </div>
        </div>
        <div className="card" style={{ padding: "12px 20px", background: "var(--primary-dim)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Award size={18} color="var(--primary)" />
            <span>Top Candidate: </span>
            <strong>{applicants[0]?.studentName} ({applicants[0]?.matchScore}%)</strong>
          </div>
        </div>
      </div>

      {/* Ranked List */}
      {applicants.map((applicant) => (
        <div
          key={applicant.applicationId}
          className="card"
          style={{
            padding: "20px 24px",
            borderRadius: 16,
            borderLeft: `4px solid ${applicant.rank === 1 ? "#F59E0B" : applicant.rank === 2 ? "#9CA3AF" : applicant.rank === 3 ? "#CD7F32" : "var(--border)"}`,
            transition: "all 0.2s",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: "50%",
                  background: applicant.rank === 1 ? "#FEF3C7" : "var(--bg)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 20,
                  fontWeight: 700,
                  color: applicant.rank === 1 ? "#D97706" : "var(--muted)",
                }}
              >
                {getRankIcon(applicant.rank)}
              </div>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", marginBottom: 4 }}>
                  <h3 style={{ fontSize: 18, fontWeight: 700 }}>{applicant.studentName}</h3>
                  <AIScoreBadge score={applicant.matchScore} size="medium" />
                </div>
                <div className="helper" style={{ fontSize: 13 }}>{applicant.studentEmail}</div>
                {applicant.topSkills && applicant.topSkills.length > 0 && (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 8 }}>
                    {applicant.topSkills.slice(0, 3).map((skill, i) => (
                      <span
                        key={i}
                        style={{
                          background: "var(--teal-dim)",
                          padding: "2px 8px",
                          borderRadius: 12,
                          fontSize: 11,
                          color: "var(--teal)",
                        }}
                      >
                        {skill}
                      </span>
                    ))}
                    {applicant.topSkills.length > 3 && (
                      <span className="helper" style={{ fontSize: 11 }}>+{applicant.topSkills.length - 3} more</span>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={() => setExpandedId(expandedId === applicant.applicationId ? null : applicant.applicationId)}
                className="btn btn-outline btn-sm"
              >
                {expandedId === applicant.applicationId ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                Details
              </button>
              <button
                onClick={() => onViewApplicant(applicant)}
                className="btn btn-primary btn-sm"
              >
                View Full Profile →
              </button>
            </div>
          </div>

          {/* Expanded Reasoning */}
          {expandedId === applicant.applicationId && (
            <div style={{ marginTop: 20, paddingTop: 16, borderTop: "1px solid var(--border)" }}>
              <div style={{ background: "var(--bg)", padding: 16, borderRadius: 12 }}>
                <div style={{ fontWeight: 600, marginBottom: 8 }}>🤖 AI Match Reasoning</div>
                <p className="helper">{applicant.reasoning || "No detailed reasoning available."}</p>
                
                {applicant.missingRequirements && applicant.missingRequirements.length > 0 && (
                  <div style={{ marginTop: 12 }}>
                    <div className="helper" style={{ fontSize: 12, marginBottom: 6 }}>Missing Requirements:</div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                      {applicant.missingRequirements.map((req, i) => (
                        <span key={i} style={{ background: "#FEE2E2", color: "#991B1B", padding: "2px 8px", borderRadius: 12, fontSize: 11 }}>
                          {req}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}