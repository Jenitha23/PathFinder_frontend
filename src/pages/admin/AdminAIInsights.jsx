/**
 * File: src/pages/admin/AdminAIInsights.jsx
 * Purpose: Admin page for AI-powered platform analytics
 */
import { useState, useEffect } from "react";
import AdminLayout from "../../components/admin/AdminLayout";
import TalentDemandCard from "../../components/admin/ai/TalentDemandCard";
import PlatformHealthCard from "../../components/admin/ai/PlatformHealthCard";
import SkillTrendsChart from "../../components/admin/ai/SkillTrendsChart";
import AIPredictionsCard from "../../components/admin/ai/AIPredictionsCard";
import aiService from "../../services/aiService";
import { Brain, RefreshCw } from "lucide-react";

export default function AdminAIInsights() {
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadInsights();
  }, []);

  const loadInsights = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await aiService.getAdminInsights();
      setInsights(res.data);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load AI insights");
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadInsights();
    setRefreshing(false);
  };

  return (
    <AdminLayout title="AI Analytics" subtitle="AI-powered platform insights and predictions">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Brain size={24} color="#8B5CF6" />
          <span style={{ fontWeight: 600 }}>Intelligent insights powered by Gemini AI</span>
        </div>
        <button onClick={handleRefresh} className="btn btn-outline btn-sm" disabled={refreshing}>
          <RefreshCw size={14} style={{ marginRight: 6 }} />
          {refreshing ? "Refreshing..." : "Refresh Insights"}
        </button>
      </div>

      {error && (
        <div className="alert error" style={{ marginBottom: 20 }}>
          {error}
        </div>
      )}

      {loading ? (
        <>
          <div className="skeleton" style={{ height: 200, marginBottom: 20 }} />
          <div className="skeleton" style={{ height: 300, marginBottom: 20 }} />
          <div className="skeleton" style={{ height: 200 }} />
        </>
      ) : (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
            <TalentDemandCard data={insights?.talentDemand} />
            <PlatformHealthCard data={insights?.platformHealth} />
          </div>

          <div className="card" style={{ padding: 20, marginBottom: 20 }}>
            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>📈 Top In-Demand Skills</h3>
            <SkillTrendsChart skills={insights?.topInDemandSkills} />
          </div>

          <AIPredictionsCard predictions={insights?.predictions} />
        </>
      )}
    </AdminLayout>
  );
}