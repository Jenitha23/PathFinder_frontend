/**
 * File: src/components/student/ai/SkillGapAnalysis.jsx
 * Purpose: Display skill gap analysis between student and job requirements
 */
export default function SkillGapAnalysis({ matchedSkills, missingSkills, partialMatches }) {
  if ((!matchedSkills || matchedSkills.length === 0) && (!missingSkills || missingSkills.length === 0)) {
    return (
      <div className="card" style={{ padding: 20, textAlign: "center" }}>
        <p className="helper">No skill analysis available.</p>
      </div>
    );
  }

  return (
    <div style={{ display: "grid", gap: 20 }}>
      {/* Matched Skills */}
      {matchedSkills && matchedSkills.length > 0 && (
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
            <span style={{ fontSize: 20 }}>✅</span>
            <h4 style={{ fontWeight: 600, color: "#10B981" }}>Your Matched Skills</h4>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
            {matchedSkills.map((skill, i) => (
              <span
                key={i}
                style={{
                  background: "#D1FAE5",
                  color: "#065F46",
                  padding: "6px 14px",
                  borderRadius: 20,
                  fontSize: 13,
                  fontWeight: 500,
                }}
              >
                ✓ {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Partial Matches */}
      {partialMatches && partialMatches.length > 0 && (
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
            <span style={{ fontSize: 20 }}>🔄</span>
            <h4 style={{ fontWeight: 600, color: "#F59E0B" }}>Partial Matches</h4>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
            {partialMatches.map((skill, i) => (
              <span
                key={i}
                style={{
                  background: "#FEF3C7",
                  color: "#92400E",
                  padding: "6px 14px",
                  borderRadius: 20,
                  fontSize: 13,
                  fontWeight: 500,
                }}
              >
                ~ {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Missing Skills */}
      {missingSkills && missingSkills.length > 0 && (
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
            <span style={{ fontSize: 20 }}>⚠️</span>
            <h4 style={{ fontWeight: 600, color: "#EF4444" }}>Skills to Develop</h4>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
            {missingSkills.map((skill, i) => (
              <span
                key={i}
                style={{
                  background: "#FEE2E2",
                  color: "#991B1B",
                  padding: "6px 14px",
                  borderRadius: 20,
                  fontSize: 13,
                  fontWeight: 500,
                }}
              >
                + {skill}
              </span>
            ))}
          </div>
          <p className="helper" style={{ marginTop: 12, fontSize: 12 }}>
            Tip: Consider taking courses or gaining experience in these areas to improve your match score.
          </p>
        </div>
      )}
    </div>
  );
}