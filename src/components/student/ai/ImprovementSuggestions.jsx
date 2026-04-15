/**
 * File: src/components/student/ai/ImprovementSuggestions.jsx
 * Purpose: Display AI-generated improvement suggestions for CV
 */
import { useState } from "react";
import { Lightbulb, CheckCircle, AlertCircle, TrendingUp, ChevronDown, ChevronUp } from "lucide-react";

export default function ImprovementSuggestions({ suggestions, strengths, loading, onApplySuggestion }) {
  const [expanded, setExpanded] = useState(true);
  const [appliedSuggestions, setAppliedSuggestions] = useState([]);

  if (loading) {
    return (
      <div className="card" style={{ padding: 20 }}>
        <div className="skeleton" style={{ height: 20, width: "60%", marginBottom: 16 }} />
        <div className="skeleton" style={{ height: 60, marginBottom: 12 }} />
        <div className="skeleton" style={{ height: 60, marginBottom: 12 }} />
        <div className="skeleton" style={{ height: 60 }} />
      </div>
    );
  }

  if ((!suggestions || suggestions.length === 0) && (!strengths || strengths.length === 0)) {
    return (
      <div className="card" style={{ padding: 24, textAlign: "center" }}>
        <Lightbulb size={48} color="#F59E0B" style={{ marginBottom: 16 }} />
        <h3 style={{ marginBottom: 8 }}>No Suggestions Available</h3>
        <p className="helper">
          Upload your CV and run an ATS analysis to get personalized improvement suggestions.
        </p>
      </div>
    );
  }

  const handleApplySuggestion = (suggestion) => {
    if (appliedSuggestions.includes(suggestion)) {
      setAppliedSuggestions(appliedSuggestions.filter(s => s !== suggestion));
    } else {
      setAppliedSuggestions([...appliedSuggestions, suggestion]);
    }
    if (onApplySuggestion) {
      onApplySuggestion(suggestion, !appliedSuggestions.includes(suggestion));
    }
  };

  const getPriorityColor = (index) => {
    if (index === 0) return "#EF4444"; // High priority
    if (index === 1) return "#F59E0B"; // Medium priority
    return "#10B981"; // Low priority
  };

  const getPriorityLabel = (index) => {
    if (index === 0) return "High Priority";
    if (index === 1) return "Medium Priority";
    return "Nice to Have";
  };

  return (
    <div className="card" style={{ padding: 24 }}>
      {/* Header */}
      <div 
        style={{ 
          display: "flex", 
          justifyContent: "space-between", 
          alignItems: "center", 
          marginBottom: 16,
          cursor: "pointer",
        }}
        onClick={() => setExpanded(!expanded)}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Lightbulb size={24} color="#F59E0B" />
          <h3 style={{ fontSize: 18, fontWeight: 700 }}>AI Improvement Suggestions</h3>
          <span className="badge badge-primary">
            {suggestions?.length || 0} suggestions
          </span>
        </div>
        {expanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
      </div>

      {!expanded && (
        <div className="helper" style={{ fontStyle: "italic" }}>
          Click to view {suggestions?.length || 0} improvement suggestions for your CV
        </div>
      )}

      {expanded && (
        <>
          {/* Impact Score */}
          <div style={{ 
            background: "linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)", 
            padding: "12px 16px", 
            borderRadius: 12, 
            marginBottom: 20 
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <TrendingUp size={18} color="#D97706" />
              <span style={{ fontWeight: 600, color: "#92400E" }}>Potential Score Improvement</span>
            </div>
            <div style={{ fontSize: 28, fontWeight: 800, color: "#B45309" }}>
              +{Math.min(30, suggestions?.length * 5 || 0)}%
            </div>
            <div className="helper" style={{ fontSize: 12, color: "#92400E", marginTop: 4 }}>
              Implementing these suggestions could increase your ATS score by up to 30%
            </div>
          </div>

          {/* Strengths Section */}
          {strengths && strengths.length > 0 && (
            <div style={{ marginBottom: 24 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                <CheckCircle size={18} color="#10B981" />
                <h4 style={{ fontWeight: 600, color: "#065F46" }}>Your CV Strengths</h4>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                {strengths.map((strength, i) => (
                  <div
                    key={i}
                    style={{
                      background: "#D1FAE5",
                      color: "#065F46",
                      padding: "8px 16px",
                      borderRadius: 10,
                      fontSize: 13,
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                    }}
                  >
                    <CheckCircle size={14} /> {strength}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Suggestions Section */}
          {suggestions && suggestions.length > 0 && (
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                <AlertCircle size={18} color="#F59E0B" />
                <h4 style={{ fontWeight: 600 }}>Actionable Improvements</h4>
              </div>
              <div style={{ display: "grid", gap: 12 }}>
                {suggestions.map((suggestion, i) => (
                  <div
                    key={i}
                    style={{
                      padding: "14px 16px",
                      background: appliedSuggestions.includes(suggestion) ? "#D1FAE5" : "var(--bg)",
                      borderRadius: 12,
                      border: `1px solid ${appliedSuggestions.includes(suggestion) ? "#10B981" : "var(--border)"}`,
                      transition: "all 0.2s",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                          <div
                            style={{
                              width: 8,
                              height: 8,
                              borderRadius: "50%",
                              background: getPriorityColor(i),
                            }}
                          />
                          <span className="badge" style={{ 
                            background: `${getPriorityColor(i)}20`, 
                            color: getPriorityColor(i),
                            fontSize: 10,
                          }}>
                            {getPriorityLabel(i)}
                          </span>
                        </div>
                        <p style={{ color: "var(--text)", lineHeight: 1.6 }}>{suggestion}</p>
                      </div>
                      <button
                        onClick={() => handleApplySuggestion(suggestion)}
                        className={`btn ${appliedSuggestions.includes(suggestion) ? "btn-outline" : "btn-teal"} btn-sm`}
                        style={{ whiteSpace: "nowrap" }}
                      >
                        {appliedSuggestions.includes(suggestion) ? "✓ Applied" : "Apply Suggestion"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Progress Tracker */}
          {appliedSuggestions.length > 0 && (
            <div style={{ marginTop: 20, paddingTop: 16, borderTop: "1px solid var(--border)" }}>
              <div className="helper" style={{ fontSize: 13, marginBottom: 8 }}>
                Progress: {appliedSuggestions.length}/{suggestions?.length || 0} suggestions applied
              </div>
              <div style={{ height: 6, background: "var(--border)", borderRadius: 3, overflow: "hidden" }}>
                <div
                  style={{
                    width: `${(appliedSuggestions.length / (suggestions?.length || 1)) * 100}%`,
                    height: "100%",
                    background: "linear-gradient(90deg, #10B981, #34D399)",
                    borderRadius: 3,
                    transition: "width 0.3s",
                  }}
                />
              </div>
            </div>
          )}

          {/* Pro Tip */}
          <div style={{ marginTop: 20, padding: 12, background: "#EFF6FF", borderRadius: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 20 }}>💡</span>
              <div>
                <div style={{ fontWeight: 600, fontSize: 13, color: "#1E40AF" }}>Pro Tip</div>
                <div className="helper" style={{ fontSize: 12, color: "#1E3A8A" }}>
                  Apply suggestions one by one and re-run analysis to see your score improve over time!
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}