/**
 * File: src/pages/admin/AdminAIInsights.jsx
 * Purpose: Admin page for AI-powered platform analytics
 */
import { useState } from "react";
import AdminLayout from "../../components/admin/AdminLayout";
import TalentDemandCard from "../../components/admin/ai/TalentDemandCard";
import PlatformHealthCard from "../../components/admin/ai/PlatformHealthCard";
import SkillTrendsChart from "../../components/admin/ai/SkillTrendsChart";
import AIPredictionsCard from "../../components/admin/ai/AIPredictionsCard";
import { useAdminAIInsights } from "../../hooks/useAdminAIInsights";
import { Brain, RefreshCw, AlertCircle } from "lucide-react";

export default function AdminAIInsights() {
  const { insights, loading, error, refresh, aiAvailable, aiMessage } = useAdminAIInsights();
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  };

  return (
    <AdminLayout title="AI Analytics" subtitle="AI-powered platform insights and predictions">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Brain size={24} color="#8B5CF6" />
          <span style={{ fontWeight: 600 }}>Intelligent insights powered by Gemini AI</span>
          {!aiAvailable && !loading && (
            <span className="badge badge-warning" style={{ fontSize: 11, marginLeft: 8 }}>
              Limited Mode
            </span>
          )}
        </div>
        <button onClick={handleRefresh} className="btn btn-outline btn-sm" disabled={refreshing}>
          <RefreshCw size={14} style={{ marginRight: 6 }} />
          {refreshing ? "Refreshing..." : "Refresh Insights"}
        </button>
      </div>

      {/* AI Service Warning */}
      {aiMessage && !loading && (
        <div className="alert warning" style={{ 
          marginBottom: 20, 
          background: "#FEF3C7", 
          borderColor: "#F59E0B",
          display: "flex",
          alignItems: "center",
          gap: 10
        }}>
          <AlertCircle size={18} color="#D97706" />
          <span>{aiMessage}</span>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="alert error" style={{ marginBottom: 20 }}>
          {error}
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <>
          <div className="skeleton" style={{ height: 200, marginBottom: 20 }} />
          <div className="skeleton" style={{ height: 300, marginBottom: 20 }} />
          <div className="skeleton" style={{ height: 200 }} />
        </>
      ) : insights ? (
        <>
          {/* Two Column Layout for Top Cards */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
            <TalentDemandCard data={insights.talentDemand} />
            <PlatformHealthCard data={insights.platformHealth} />
          </div>

          {/* Skills Chart */}
          <div className="card" style={{ padding: 20, marginBottom: 20 }}>
            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>📈 Top In-Demand Skills</h3>
            <SkillTrendsChart skills={insights.topInDemandSkills} />
          </div>

          {/* AI Predictions */}
          <AIPredictionsCard predictions={insights.predictions} />

          {/* AI Generated Summary Footer */}
          {insights.aiGeneratedSummary && (
            <div className="card" style={{ padding: 16, marginTop: 20, background: "#F3E8FF", borderColor: "#E9D5FF" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <Brain size={16} color="#7C3AED" />
                <span style={{ fontWeight: 600, fontSize: 13, color: "#6D28D9" }}>AI Executive Summary</span>
              </div>
              <p style={{ fontSize: 14, color: "#4C1D95", margin: 0, lineHeight: 1.6 }}>
                {insights.aiGeneratedSummary}
              </p>
              <div className="helper" style={{ fontSize: 10, marginTop: 8, color: "#8B5CF6" }}>
                Generated at {new Date(insights.generatedAt).toLocaleString()}
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="card" style={{ padding: 40, textAlign: "center" }}>
          <Brain size={48} color="var(--muted)" style={{ marginBottom: 16 }} />
          <h3 style={{ marginBottom: 8 }}>No AI Insights Available</h3>
          <p className="helper">Unable to load AI analytics data. Please try again later.</p>
          <button className="btn btn-primary btn-sm" onClick={handleRefresh} style={{ marginTop: 16 }}>
            Try Again
          </button>
        </div>
      )}
    </AdminLayout>
  );
}