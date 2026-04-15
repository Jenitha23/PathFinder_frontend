/**
 * File: src/pages/student/StudentAIDashboard.jsx
 * Purpose: Student AI Dashboard for CV analysis and job matching
 */
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import aiService from "../../services/aiService";
import AtsScoreCard from "../../components/student/ai/AtsScoreCard";
import JobMatchBadge from "../../components/student/ai/JobMatchBadge";
import SkillGapAnalysis from "../../components/student/ai/SkillGapAnalysis";
import { Sparkles, TrendingUp, Target, Brain, ChevronRight, ArrowLeft } from "lucide-react";

export default function StudentAIDashboard() {
  const [atsAnalysis, setAtsAnalysis] = useState(null);
  const [jobMatches, setJobMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState("");
  const [selectedJob, setSelectedJob] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError("");
    try {
      // Load job matches first
      const matchesRes = await aiService.getJobMatches(10);
      setJobMatches(matchesRes.data.matches || []);

      // Try to load existing ATS analysis
      try {
        const atsRes = await aiService.analyzeCV({ forceRefresh: false });
        setAtsAnalysis(atsRes.data.result);
      } catch (err) {
        // No existing analysis - that's fine
        console.log("No existing ATS analysis");
      }
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load AI insights");
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyzeCV = async () => {
    setAnalyzing(true);
    setError("");
    try {
      const res = await aiService.analyzeCV({ forceRefresh: true });
      setAtsAnalysis(res.data.result);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to analyze CV");
    } finally {
      setAnalyzing(false);
    }
  };

  const handleAnalyzeAgainstJob = async (jobId) => {
    setAnalyzing(true);
    setError("");
    try {
      const res = await aiService.analyzeCV({ jobId, forceRefresh: true });
      setAtsAnalysis(res.data.result);
      setSelectedJob(jobMatches.find(j => j.jobId === jobId));
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to analyze against job");
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div style={{ padding: "32px 40px" }}>
      <div className="container" style={{ width: "100%", margin: "0 auto" }}>
        {/* Hero Section */}
        <div
          style={{
            background: "linear-gradient(135deg, #0A2472 0%, #1a3a8f 100%)",
            borderRadius: 20,
            padding: "32px 36px",
            marginBottom: 32,
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Back to Dashboard Button */}
          <div style={{ marginBottom: 20 }}>
            <Link
              to="/student/home"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                color: "rgba(255,255,255,0.7)",
                fontSize: 14,
                fontWeight: 500,
                textDecoration: "none",
                transition: "color 0.15s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "white")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.7)")}
            >
              <ArrowLeft size={16} /> Back to Dashboard
            </Link>
          </div>

          <div style={{ position: "relative", zIndex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
              <div
                style={{
                  background: "rgba(46,196,182,0.2)",
                  borderRadius: 12,
                  padding: "8px 14px",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <Brain size={20} color="#2EC4B6" />
                <span style={{ color: "#2EC4B6", fontWeight: 600, fontSize: 13 }}>
                  AI-Powered Career Assistant
                </span>
              </div>
            </div>
            <h1 style={{ color: "white", fontSize: 32, fontWeight: 800, marginBottom: 12 }}>
              Your AI Career Dashboard
            </h1>
            <p style={{ color: "rgba(255,255,255,0.75)", fontSize: 16, maxWidth: 500 }}>
              Get personalized insights, ATS scores, and job match recommendations powered by AI.
            </p>
          </div>
          <div
            style={{
              position: "absolute",
              right: -50,
              top: -50,
              width: 200,
              height: 200,
              borderRadius: "50%",
              background: "rgba(46,196,182,0.1)",
            }}
          />
        </div>

        {error && (
          <div className="alert error" style={{ marginBottom: 20 }}>
            {error}
          </div>
        )}

        {/* ATS Score Card */}
        <div style={{ marginBottom: 32 }}>
          <AtsScoreCard
            analysis={atsAnalysis}
            loading={analyzing}
            onRefresh={handleAnalyzeCV}
            jobTitle={selectedJob?.jobTitle}
          />
        </div>

        {/* Job Matches Section */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
            <div>
              <h2 style={{ fontSize: 24, fontWeight: 700, display: "flex", alignItems: "center", gap: 8 }}>
                <Target size={24} color="#F59E0B" /> AI Job Matches
              </h2>
              <p className="helper">Based on your CV and skills</p>
            </div>
            <Link to="/student/jobs" className="btn btn-outline">
              Browse All Jobs <ChevronRight size={16} />
            </Link>
          </div>

          {loading ? (
            <div className="card" style={{ padding: 40, textAlign: "center" }}>
              <div className="skeleton" style={{ width: "100%", height: 200 }} />
              <p className="helper" style={{ marginTop: 16 }}>Loading AI recommendations...</p>
            </div>
          ) : jobMatches.length === 0 ? (
            <div className="card" style={{ padding: 40, textAlign: "center" }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>🎯</div>
              <h3 style={{ marginBottom: 8 }}>No Job Matches Yet</h3>
              <p className="helper">
                Complete your profile and upload your CV to get AI-powered job recommendations.
              </p>
            </div>
          ) : (
            <div style={{ display: "grid", gap: 16 }}>
              {jobMatches.map((match, idx) => (
                <div
                  key={match.jobId}
                  className="card"
                  style={{
                    padding: "20px 24px",
                    borderRadius: 16,
                    transition: "all 0.2s",
                    animation: `fadeUp 0.3s ease ${idx * 0.05}s both`,
                    cursor: "pointer",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-2px)";
                    e.currentTarget.style.boxShadow = "var(--shadow-lg)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "";
                  }}
                  onClick={() => handleAnalyzeAgainstJob(match.jobId)}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", marginBottom: 8 }}>
                        <h3 style={{ fontSize: 18, fontWeight: 700, color: "var(--primary)" }}>
                          {match.jobTitle}
                        </h3>
                        <JobMatchBadge matchPercentage={match.matchPercentage} size="medium" />
                      </div>
                      <p style={{ color: "var(--text)", marginBottom: 8 }}>{match.companyName}</p>
                      <div className="helper" style={{ fontSize: 13 }}>
                        {match.recommendation}
                      </div>
                    </div>
                    <button className="btn btn-outline btn-sm" onClick={(e) => { e.stopPropagation(); handleAnalyzeAgainstJob(match.jobId); }}>
                      Analyze Match →
                    </button>
                  </div>

                  {/* Expanded details for selected job */}
                  {selectedJob?.jobId === match.jobId && atsAnalysis && atsAnalysis.jobId === match.jobId && (
                    <div style={{ marginTop: 20, paddingTop: 20, borderTop: "1px solid var(--border)" }}>
                      <SkillGapAnalysis
                        matchedSkills={match.matchedSkills}
                        missingSkills={match.missingSkills}
                        partialMatches={match.partialMatches}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Stats */}
        {!loading && jobMatches.length > 0 && (
          <div className="card" style={{ padding: 24, background: "linear-gradient(135deg, #F0FDF4 0%, #ECFEFF 100%)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
              <TrendingUp size={24} color="#10B981" />
              <h3 style={{ fontSize: 18, fontWeight: 700 }}>Your AI Insights Summary</h3>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 20 }}>
              <div>
                <div className="helper" style={{ fontSize: 12 }}>Top Match Score</div>
                <div style={{ fontSize: 28, fontWeight: 800, color: "#10B981" }}>
                  {Math.max(...jobMatches.map(m => m.matchPercentage))}%
                </div>
              </div>
              <div>
                <div className="helper" style={{ fontSize: 12 }}>Average Match Score</div>
                <div style={{ fontSize: 28, fontWeight: 800, color: "#3B82F6" }}>
                  {Math.round(jobMatches.reduce((a, b) => a + b.matchPercentage, 0) / jobMatches.length)}%
                </div>
              </div>
              <div>
                <div className="helper" style={{ fontSize: 12 }}>Jobs Analyzed</div>
                <div style={{ fontSize: 28, fontWeight: 800, color: "#F59E0B" }}>
                  {jobMatches.length}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}