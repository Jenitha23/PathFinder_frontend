/**
 * File: src/services/companyApplicationsService.js
 * Purpose: API methods for company to manage job applicants
 */
import { api } from "./api";

export const companyApplicationsService = {
  /**
   * Get all applicants for a specific job
   * GET /api/company/jobs/{jobId}/applications
   * @param {number} jobId - The job ID
   * @param {string} status - Optional status filter (Pending, Shortlisted, Rejected, Accepted)
   */
  getJobApplicants: (jobId, status = null) => {
    const url = status 
      ? `/api/company/jobs/${jobId}/applications?status=${status}`
      : `/api/company/jobs/${jobId}/applications`;
    return api.get(url);
  },

  /**
   * Get detailed applicant information
   * GET /api/company/jobs/{jobId}/applications/{applicationId}
   * @param {number} jobId - The job ID
   * @param {number} applicationId - The application ID
   */
  getApplicantDetails: (jobId, applicationId) => 
    api.get(`/api/company/jobs/${jobId}/applications/${applicationId}`),

  /**
   * Update application status
   * PUT /api/company/jobs/{jobId}/applications/{applicationId}/status
   * @param {number} jobId - The job ID
   * @param {number} applicationId - The application ID
   * @param {string} status - New status (Pending, Shortlisted, Rejected, Accepted)
   */
  updateApplicationStatus: (jobId, applicationId, status) =>
    api.put(`/api/company/jobs/${jobId}/applications/${applicationId}/status`, { status }),

  /**
   * Get application statistics for a job
   * GET /api/company/jobs/{jobId}/applications/stats
   * @param {number} jobId - The job ID
   */
  getApplicationStats: (jobId) =>
    api.get(`/api/company/jobs/${jobId}/applications/stats`),
};

export default companyApplicationsService;