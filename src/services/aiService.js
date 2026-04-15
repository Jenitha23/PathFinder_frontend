/**
 * File: src/services/aiService.js
 * Purpose: API methods for AI analytics features
 */
import { api } from "./api";

export const aiService = {
  // ========== STUDENT ENDPOINTS ==========
  
  /**
   * Analyze student's CV and get ATS score
   * POST /api/ai/student/ats/analyze
   * @param {Object} params - { jobId, forceRefresh }
   */
  analyzeCV: (params = {}) => {
    const payload = {
      jobId: params.jobId || 0,
      forceRefresh: params.forceRefresh || false
    };
    return api.post("/api/ai/student/ats/analyze", payload);
  },

  /**
   * Get match percentages for all active jobs
   * GET /api/ai/student/match/jobs
   * @param {number} limit - Optional limit for number of jobs
   */
  getJobMatches: (limit = null) => {
    const url = limit ? `/api/ai/student/match/jobs?limit=${limit}` : "/api/ai/student/match/jobs";
    return api.get(url);
  },

  /**
   * Get match percentage for a specific job
   * GET /api/ai/student/match/job/{jobId}
   * @param {number} jobId - The job ID
   */
  getJobMatch: (jobId) => api.get(`/api/ai/student/match/job/${jobId}`),

  // ========== COMPANY ENDPOINTS ==========
  
  /**
   * Get AI-ranked applicants for a job
   * GET /api/ai/company/ranked-applicants/{jobId}
   * @param {number} jobId - The job ID
   */
  getRankedApplicants: (jobId) => api.get(`/api/ai/company/ranked-applicants/${jobId}`),

  // ========== ADMIN ENDPOINTS ==========
  
  /**
   * Get AI-powered platform insights
   * GET /api/ai/admin/insights
   */
  getAdminInsights: () => api.get("/api/ai/admin/insights"),
};

export default aiService;