/**
 * File: src/components/admin/ai/AIPredictionsCard.jsx
 * Purpose: Display AI-generated predictions
 */
import { Sparkles, TrendingUp, Clock, Activity } from "lucide-react";

export default function AIPredictionsCard({ predictions }) {
  if (!predictions || predictions.length === 0) {
    return (
      <div className="card" style={{ padding: 20, textAlign: "center" }}>
        <p className="helper">No predictions available</p>
      </div>
    );
  }

  const getConfidenceColor = (score) => {
    if (score >= 80) return "#10B981";
    if (score >= 60) return "#F59E0B";
    return "#EF4444";
  };

  return (
    <div className="card" style={{ padding: 20 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
        <Sparkles size={20} color="#8B5CF6" />
        <h3 style={{ fontSize: 18, fontWeight: 700 }}>AI Predictions</h3>
      </div>
      
      <div style={{ display: "grid", gap: 16 }}>
        {predictions.map((pred, i) => (
          <div key={i} style={{ padding: 16, background: "linear-gradient(135deg, #F3E8FF 0%, #EDE9FE 100%)", borderRadius: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12, marginBottom: 12 }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                  <TrendingUp size={16} color="#7C3AED" />
                  <span style={{ fontWeight: 600, color: "#6D28D9" }}>{pred.metric}</span>
                </div>
                <p style={{ color: "#4C1D95", fontWeight: 500 }}>{pred.predictionText}</p>
              </div>
              <div style={{ textAlign: "right" }}>
                <div
                  style={{
                    background: getConfidenceColor(pred.confidenceScore),
                    color: "white",
                    padding: "4px 10px",
                    borderRadius: 20,
                    fontSize: 12,
                    fontWeight: 600,
                  }}
                >
                  {pred.confidenceScore}% confidence
                </div>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 8 }}>
              <Clock size={14} color="#6B7280" />
              <span className="helper" style={{ fontSize: 12 }}>Timeframe: {pred.timeframe || "30 days"}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}