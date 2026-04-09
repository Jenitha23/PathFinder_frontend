/**
 * File: src/services/adminDashboardService.js
 * Purpose: API methods for admin dashboard analytics
 */
import { api } from "./api";

export const adminDashboardService = {
  /**
   * Get main dashboard statistics
   * GET /api/admin/dashboard/stats
   * @param {Object} params - Query parameters (startDate, endDate)
   */
  getStats: (params = {}) => {
    const queryParams = new URLSearchParams();
    if (params.startDate) queryParams.append("startDate", params.startDate);
    if (params.endDate) queryParams.append("endDate", params.endDate);
    const qs = queryParams.toString();
    return api.get(`/api/admin/dashboard/stats${qs ? `?${qs}` : ""}`);
  },

  /**
   * Get complete dashboard analytics with all charts
   * GET /api/admin/dashboard/analytics
   * @param {Object} params - Query parameters (startDate, endDate)
   */
  getAnalytics: (params = {}) => {
    const queryParams = new URLSearchParams();
    if (params.startDate) queryParams.append("startDate", params.startDate);
    if (params.endDate) queryParams.append("endDate", params.endDate);
    const qs = queryParams.toString();
    return api.get(`/api/admin/dashboard/analytics${qs ? `?${qs}` : ""}`);
  },

  /**
   * Get jobs per month chart data
   * GET /api/admin/dashboard/jobs-per-month
   */
  getJobsPerMonth: (params = {}) => {
    const queryParams = new URLSearchParams();
    if (params.startDate) queryParams.append("startDate", params.startDate);
    if (params.endDate) queryParams.append("endDate", params.endDate);
    const qs = queryParams.toString();
    return api.get(`/api/admin/dashboard/jobs-per-month${qs ? `?${qs}` : ""}`);
  },

  /**
   * Get top jobs by applications
   * GET /api/admin/dashboard/top-jobs
   */
  getTopJobs: (params = {}) => {
    const queryParams = new URLSearchParams();
    if (params.startDate) queryParams.append("startDate", params.startDate);
    if (params.endDate) queryParams.append("endDate", params.endDate);
    if (params.limit) queryParams.append("limit", params.limit);
    const qs = queryParams.toString();
    return api.get(`/api/admin/dashboard/top-jobs${qs ? `?${qs}` : ""}`);
  },

  /**
   * Get application status distribution
   * GET /api/admin/dashboard/status-distribution
   */
  getStatusDistribution: (params = {}) => {
    const queryParams = new URLSearchParams();
    if (params.startDate) queryParams.append("startDate", params.startDate);
    if (params.endDate) queryParams.append("endDate", params.endDate);
    const qs = queryParams.toString();
    return api.get(`/api/admin/dashboard/status-distribution${qs ? `?${qs}` : ""}`);
  },

  /**
   * Get date range options for frontend
   * GET /api/admin/dashboard/date-range-options
   */
  getDateRangeOptions: () => api.get("/api/admin/dashboard/date-range-options"),
};

export default adminDashboardService;