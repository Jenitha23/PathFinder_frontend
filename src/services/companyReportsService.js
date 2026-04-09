/**
 * File: src/services/companyReportsService.js
 * Purpose: API methods for company reports (jobs per month)
 */
import { api } from "./api";

export const companyReportsService = {
  /**
   * Get jobs per month report for the authenticated company
   * GET /api/company/reports/jobs-per-month
   * @param {Object} params - { year, startDate, endDate }
   */
  getJobsPerMonthReport: (params = {}) => {
    const queryParams = new URLSearchParams();
    if (params.year) queryParams.append("year", params.year);
    if (params.startDate) queryParams.append("startDate", params.startDate);
    if (params.endDate) queryParams.append("endDate", params.endDate);
    const qs = queryParams.toString();
    return api.get(`/api/company/reports/jobs-per-month${qs ? `?${qs}` : ""}`);
  },
};

export default companyReportsService;