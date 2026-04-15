/**
 * File: src/components/company/ai/MatchReasoningTooltip.jsx
 * Purpose: Display tooltip with AI reasoning for match score
 */
import { useState, useRef, useEffect } from "react";
import { Brain, X, ChevronRight, CheckCircle, AlertCircle, TrendingUp } from "lucide-react";

export default function MatchReasoningTooltip({ 
  reasoning, 
  matchedSkills, 
  missingSkills,
  matchScore,
  studentName,
  position = "top",
  children 
}) {
  const [isVisible, setIsVisible] = useState(false);
  const [positionStyle, setPositionStyle] = useState({});
  const triggerRef = useRef(null);
  const tooltipRef = useRef(null);

  useEffect(() => {
    if (isVisible && triggerRef.current && tooltipRef.current) {
      const triggerRect = triggerRef.current.getBoundingClientRect();
      const tooltipRect = tooltipRef.current.getBoundingClientRect();
      
      let top = 0;
      let left = 0;
      
      switch (position) {
        case "top":
          top = triggerRect.top - tooltipRect.height - 10;
          left = triggerRect.left + (triggerRect.width / 2) - (tooltipRect.width / 2);
          break;
        case "bottom":
          top = triggerRect.bottom + 10;
          left = triggerRect.left + (triggerRect.width / 2) - (tooltipRect.width / 2);
          break;
        case "left":
          top = triggerRect.top + (triggerRect.height / 2) - (tooltipRect.height / 2);
          left = triggerRect.left - tooltipRect.width - 10;
          break;
        case "right":
          top = triggerRect.top + (triggerRect.height / 2) - (tooltipRect.height / 2);
          left = triggerRect.right + 10;
          break;
        default:
          top = triggerRect.top - tooltipRect.height - 10;
          left = triggerRect.left + (triggerRect.width / 2) - (tooltipRect.width / 2);
      }
      
      // Ensure tooltip stays in viewport
      left = Math.max(10, Math.min(left, window.innerWidth - tooltipRect.width - 10));
      top = Math.max(10, top);
      
      setPositionStyle({ top: top + window.scrollY, left });
    }
  }, [isVisible, position]);

  const getMatchCategory = (score) => {
    if (score >= 85) return { label: "Excellent", color: "#10B981", icon: <CheckCircle size={16} /> };
    if (score >= 70) return { label: "Good", color: "#3B82F6", icon: <TrendingUp size={16} /> };
    if (score >= 50) return { label: "Moderate", color: "#F59E0B", icon: <AlertCircle size={16} /> };
    return { label: "Low", color: "#EF4444", icon: <AlertCircle size={16} /> };
  };

  const matchCategory = getMatchCategory(matchScore);

  return (
    <>
      <div
        ref={triggerRef}
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        style={{ display: "inline-block", cursor: "help" }}
      >
        {children || (
          <div style={{ 
            display: "inline-flex", 
            alignItems: "center", 
            gap: 4,
            padding: "2px 8px",
            borderRadius: 12,
            background: "var(--primary-dim)",
            fontSize: 11,
            fontWeight: 500,
            color: "var(--primary)",
          }}>
            <Brain size={12} /> AI
          </div>
        )}
      </div>

      {isVisible && (
        <div
          ref={tooltipRef}
          style={{
            position: "absolute",
            zIndex: 1000,
            background: "white",
            borderRadius: 16,
            boxShadow: "0 20px 40px rgba(0,0,0,0.15)",
            maxWidth: 320,
            width: "100%",
            animation: "fadeUp 0.15s ease",
            ...positionStyle,
          }}
          onMouseEnter={() => setIsVisible(true)}
          onMouseLeave={() => setIsVisible(false)}
        >
          <div style={{ padding: 16 }}>
            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Brain size={18} color="#8B5CF6" />
                <span style={{ fontWeight: 700, fontSize: 14 }}>AI Match Analysis</span>
              </div>
              <button
                onClick={() => setIsVisible(false)}
                style={{ background: "none", border: "none", cursor: "pointer", color: "var(--muted)" }}
              >
                <X size={14} />
              </button>
            </div>

            {/* Match Category */}
            <div style={{ 
              background: `${matchCategory.color}10`, 
              padding: "8px 12px", 
              borderRadius: 10,
              marginBottom: 12,
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}>
              {matchCategory.icon}
              <div>
                <div style={{ fontSize: 12, color: "var(--muted)" }}>Match Quality</div>
                <div style={{ fontWeight: 700, color: matchCategory.color }}>
                  {matchCategory.label} Match ({matchScore}%)
                </div>
              </div>
            </div>

            {/* Reasoning */}
            {reasoning && (
              <div style={{ marginBottom: 12 }}>
                <div className="helper" style={{ fontSize: 11, marginBottom: 4 }}>AI Reasoning</div>
                <p style={{ fontSize: 13, color: "var(--text)", lineHeight: 1.5 }}>{reasoning}</p>
              </div>
            )}

            {/* Skills Breakdown */}
            {(matchedSkills?.length > 0 || missingSkills?.length > 0) && (
              <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid var(--border)" }}>
                {matchedSkills && matchedSkills.length > 0 && (
                  <div style={{ marginBottom: 10 }}>
                    <div className="helper" style={{ fontSize: 11, marginBottom: 6, color: "#10B981" }}>
                      ✓ Matched Skills ({matchedSkills.length})
                    </div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                      {matchedSkills.slice(0, 5).map((skill, i) => (
                        <span key={i} style={{ fontSize: 11, background: "#D1FAE5", color: "#065F46", padding: "2px 8px", borderRadius: 12 }}>
                          {skill}
                        </span>
                      ))}
                      {matchedSkills.length > 5 && (
                        <span className="helper" style={{ fontSize: 11 }}>+{matchedSkills.length - 5} more</span>
                      )}
                    </div>
                  </div>
                )}

                {missingSkills && missingSkills.length > 0 && (
                  <div>
                    <div className="helper" style={{ fontSize: 11, marginBottom: 6, color: "#EF4444" }}>
                      ⚠️ Missing Skills ({missingSkills.length})
                    </div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                      {missingSkills.slice(0, 5).map((skill, i) => (
                        <span key={i} style={{ fontSize: 11, background: "#FEE2E2", color: "#991B1B", padding: "2px 8px", borderRadius: 12 }}>
                          {skill}
                        </span>
                      ))}
                      {missingSkills.length > 5 && (
                        <span className="helper" style={{ fontSize: 11 }}>+{missingSkills.length - 5} more</span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Recommendation Badge */}
            {matchScore >= 70 && (
              <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid var(--border)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <ChevronRight size={14} color="#10B981" />
                  <span className="helper" style={{ fontSize: 11, color: "#10B981" }}>
                    Recommended for {matchScore >= 85 ? "immediate" : "further"} review
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Arrow */}
          <div
            style={{
              position: "absolute",
              width: 12,
              height: 12,
              background: "white",
              transform: "rotate(45deg)",
              bottom: -6,
              left: "50%",
              marginLeft: -6,
              boxShadow: "2px 2px 4px rgba(0,0,0,0.05)",
            }}
          />
        </div>
      )}

      <style>{`
        @keyframes fadeUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </>
  );
}