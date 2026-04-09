/**
 * File: src/services/reportsService.js
 * Purpose: API methods for reports (jobs per month, applications per job)
 */
import { api } from "./api";

export const reportsService = {
  /**
   * Get jobs per month report
   * @param {Object} params - { year, startDate, endDate }
   * @param {string} role - "admin" or "company"
   */
  getJobsPerMonthReport: (params = {}, role = "company") => {
    const endpoint = role === "admin"
      ? "/api/admin/dashboard/jobs-per-month-report"
      : "/api/company/reports/jobs-per-month";

    const queryParams = new URLSearchParams();
    if (params.year) queryParams.append("year", params.year);
    if (params.startDate) queryParams.append("startDate", params.startDate);
    if (params.endDate) queryParams.append("endDate", params.endDate);
    const qs = queryParams.toString();
    return api.get(`${endpoint}${qs ? `?${qs}` : ""}`);
  },

  /**
   * Get applications per job report
   * @param {Object} params - { jobId, startDate, endDate }
   * @param {string} role - "admin" or "company"
   */
  getApplicationsPerJobReport: (params = {}, role = "company") => {
    const endpoint = role === "admin"
      ? "/api/admin/dashboard/applications-per-job"
      : "/api/company/reports/applications-per-job";

    const queryParams = new URLSearchParams();
    if (params.jobId) queryParams.append("jobId", params.jobId);
    if (params.startDate) queryParams.append("startDate", params.startDate);
    if (params.endDate) queryParams.append("endDate", params.endDate);
    const qs = queryParams.toString();
    return api.get(`${endpoint}${qs ? `?${qs}` : ""}`);
  },
};

export default reportsService;