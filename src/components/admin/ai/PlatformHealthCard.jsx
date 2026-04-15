/**
 * File: src/components/admin/ai/PlatformHealthCard.jsx
 * Purpose: Display platform health metrics with gauge and trends
 */
import { useState } from "react";
import { 
  Activity, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle, 
  Users, 
  Briefcase, 
  FileText,
  Calendar,
  ThumbsUp,
  ThumbsDown,
  Heart,
  Zap,
  ChevronDown,
  ChevronUp
} from "lucide-react";

export default function PlatformHealthCard({ data }) {
  const [expanded, setExpanded] = useState(false);

  if (!data) {
    return (
      <div className="card" style={{ padding: 20, textAlign: "center" }}>
        <Activity size={32} color="var(--muted)" style={{ marginBottom: 12 }} />
        <p className="helper">No platform health data available</p>
      </div>
    );
  }

  const getGrowthIcon = (growth) => {
    if (growth > 0) return <TrendingUp size={16} color="#10B981" />;
    if (growth < 0) return <TrendingDown size={16} color="#EF4444" />;
    return <Activity size={16} color="#6B7280" />;
  };

  const getGrowthColor = (growth) => {
    if (growth > 0) return "#10B981";
    if (growth < 0) return "#EF4444";
    return "#6B7280";
  };

  const getSuccessRateColor = (rate) => {
    if (rate >= 15) return "#10B981";
    if (rate >= 8) return "#F59E0B";
    return "#EF4444";
  };

  const getSuccessRateMessage = (rate) => {
    if (rate >= 15) return "Excellent hiring rate!";
    if (rate >= 8) return "Good conversion rate";
    if (rate >= 5) return "Average conversion rate";
    return "Low conversion rate - review hiring process";
  };

  const getHealthScore = () => {
    let score = 0;
    if (data.monthOverMonthGrowth > 0) score += 25;
    else if (data.monthOverMonthGrowth > -10) score += 10;
    
    if (data.applicationSuccessRate >= 15) score += 25;
    else if (data.applicationSuccessRate >= 8) score += 15;
    else if (data.applicationSuccessRate >= 5) score += 5;
    
    if (data.companiesNeedingAttention === 0) score += 25;
    else if (data.companiesNeedingAttention <= 3) score += 15;
    else score += 5;
    
    return Math.min(100, score + 25); // Base 25 points
  };

  const healthScore = getHealthScore();
  const scoreColor = healthScore >= 80 ? "#10B981" : healthScore >= 60 ? "#F59E0B" : "#EF4444";

  const healthMetrics = [
    { 
      label: "User Growth", 
      value: `${data.monthOverMonthGrowth?.toFixed(1) || 0}%`,
      icon: getGrowthIcon(data.monthOverMonthGrowth),
      color: getGrowthColor(data.monthOverMonthGrowth),
      trend: data.monthOverMonthGrowth > 0 ? "increasing" : "decreasing",
    },
    { 
      label: "Success Rate", 
      value: `${data.applicationSuccessRate?.toFixed(1) || 0}%`,
      icon: <CheckCircle size={16} color={getSuccessRateColor(data.applicationSuccessRate)} />,
      color: getSuccessRateColor(data.applicationSuccessRate),
      message: getSuccessRateMessage(data.applicationSuccessRate),
    },
    { 
      label: "Pending Reviews", 
      value: data.companiesNeedingAttention || 0,
      icon: data.companiesNeedingAttention === 0 ? <CheckCircle size={16} color="#10B981" /> : <AlertTriangle size={16} color="#F59E0B" />,
      color: data.companiesNeedingAttention === 0 ? "#10B981" : "#F59E0B",
      message: data.companiesNeedingAttention === 0 ? "All caught up" : `${data.companiesNeedingAttention} companies need attention`,
    },
  ];

  return (
    <div className="card" style={{ padding: 20 }}>
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
          <Heart size={24} color="#EC4899" />
          <h3 style={{ fontSize: 18, fontWeight: 700 }}>Platform Health</h3>
          <div
            style={{
              background: `${scoreColor}20`,
              padding: "2px 10px",
              borderRadius: 20,
              fontSize: 12,
              fontWeight: 600,
              color: scoreColor,
            }}
          >
            Health Score: {healthScore}
          </div>
        </div>
        {expanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
      </div>

      {/* Health Score Gauge */}
      <div style={{ marginBottom: 20, textAlign: "center" }}>
        <div style={{ position: "relative", width: 120, height: 120, margin: "0 auto" }}>
          <svg width={120} height={120}>
            <circle
              cx={60}
              cy={60}
              r={50}
              fill="none"
              stroke="#E5E7EB"
              strokeWidth="10"
            />
            <circle
              cx={60}
              cy={60}
              r={50}
              fill="none"
              stroke={scoreColor}
              strokeWidth="10"
              strokeDasharray={2 * Math.PI * 50}
              strokeDashoffset={2 * Math.PI * 50 * (1 - healthScore / 100)}
              strokeLinecap="round"
              transform="rotate(-90 60 60)"
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
            <Zap size={24} color={scoreColor} />
            <div style={{ fontSize: 20, fontWeight: 800, color: scoreColor }}>
              {healthScore}
            </div>
          </div>
        </div>
        <div className="helper" style={{ fontSize: 12, marginTop: 8 }}>
          Platform Health Index
        </div>
      </div>

      {/* Metrics Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 20 }}>
        {healthMetrics.map((metric) => (
          <div
            key={metric.label}
            style={{
              padding: 12,
              background: "var(--bg)",
              borderRadius: 12,
              textAlign: "center",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, marginBottom: 6 }}>
              {metric.icon}
              <span className="helper" style={{ fontSize: 11 }}>{metric.label}</span>
            </div>
            <div style={{ fontSize: 22, fontWeight: 700, color: metric.color }}>
              {metric.value}
            </div>
            {metric.message && (
              <div className="helper" style={{ fontSize: 10, marginTop: 4 }}>
                {metric.message}
              </div>
            )}
          </div>
        ))}
      </div>

      {expanded && (
        <>
          {/* Detailed Recommendations */}
          {data.recommendations && data.recommendations.length > 0 && (
            <div style={{ marginBottom: 16, padding: 12, background: "#EFF6FF", borderRadius: 12 }}>
              <div style={{ fontWeight: 600, marginBottom: 8, fontSize: 13 }}>📋 Action Items</div>
              <ul style={{ paddingLeft: 20, margin: 0 }}>
                {data.recommendations.map((rec, i) => (
                  <li key={i} className="helper" style={{ marginBottom: 6, fontSize: 12 }}>
                    {rec}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Additional Stats */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, padding: 10, background: "var(--bg)", borderRadius: 10 }}>
              <ThumbsUp size={18} color="#10B981" />
              <div>
                <div className="helper" style={{ fontSize: 10 }}>Positive Indicators</div>
                <div style={{ fontSize: 13, fontWeight: 600 }}>
                  {data.monthOverMonthGrowth > 0 ? "Growing user base" : "User acquisition stable"}
                </div>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, padding: 10, background: "var(--bg)", borderRadius: 10 }}>
              <ThumbsDown size={18} color="#EF4444" />
              <div>
                <div className="helper" style={{ fontSize: 10 }}>Needs Attention</div>
                <div style={{ fontSize: 13, fontWeight: 600 }}>
                  {data.applicationSuccessRate < 10 ? "Low application success rate" : "Hiring metrics good"}
                </div>
              </div>
            </div>
          </div>

          {/* Trend Analysis */}
          <div style={{ marginTop: 16, paddingTop: 12, borderTop: "1px solid var(--border)" }}>
            <div className="helper" style={{ fontSize: 11, marginBottom: 8 }}>📈 Trend Analysis</div>
            <p style={{ fontSize: 13, color: "var(--text)" }}>
              {data.monthOverMonthGrowth > 0 
                ? `Platform is growing at ${data.monthOverMonthGrowth.toFixed(1)}% month-over-month. `
                : `Platform growth is stable. `}
              {data.applicationSuccessRate < 10 
                ? "Consider reviewing the hiring process to improve acceptance rates."
                : "Hiring success rates are healthy."}
            </p>
          </div>
        </>
      )}
    </div>
  );
}