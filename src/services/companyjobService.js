/**
 * File: src/services/companyJobService.js
 * Purpose: API methods for job management
 */
import { api } from "./api";

export const companyJobService = {
  /**
   * Create a new job posting
   * POST /api/company/jobs
   */
  createJob: (jobData) => api.post("/api/company/jobs", jobData),

  /**
   * Get all jobs for the current company
   * GET /api/company/jobs
   */
  getCompanyJobs: () => api.get("/api/company/jobs"),

  /**
   * Get a specific job by ID
   * GET /api/company/jobs/{id}
   */
  getJobById: (jobId) => api.get(`/api/company/jobs/${jobId}`),

  /**
   * Get job statistics for the company
   * GET /api/company/jobs/stats
   */
  getJobStats: () => api.get("/api/company/jobs/stats"),

  /**
   * Update a job posting
   * PUT /api/company/jobs/{id}
   */
  updateJob: (jobId, jobData) => api.put(`/api/company/jobs/${jobId}`, jobData),

  /**
   * Delete a job posting
   * DELETE /api/company/jobs/{id}
   */
  deleteJob: (jobId) => api.delete(`/api/company/jobs/${jobId}`),
};

export default companyJobService;