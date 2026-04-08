/**
 * File: src/services/adminCompanyService.js
 * Purpose: API methods for admin company management
 */
import { api } from "./api";

export const adminCompanyService = {
  /**
   * Get all companies with filters and pagination
   * GET /api/admin/companies
   */
  getCompanies: (filters = {}) => {
    const params = new URLSearchParams();
    
    if (filters.status && filters.status !== "ALL") 
      params.append("status", filters.status);
    if (filters.searchTerm) 
      params.append("searchTerm", filters.searchTerm);
    if (filters.fromDate) 
      params.append("fromDate", filters.fromDate);
    if (filters.toDate) 
      params.append("toDate", filters.toDate);
    if (filters.sortBy) 
      params.append("sortBy", filters.sortBy);
    if (filters.page) 
      params.append("page", filters.page);
    if (filters.pageSize) 
      params.append("pageSize", filters.pageSize);
    
    const qs = params.toString();
    return api.get(`/api/admin/companies${qs ? `?${qs}` : ""}`);
  },

  /**
   * Get pending companies count for dashboard badge
   * GET /api/admin/companies/pending/count
   */
  getPendingCount: () => api.get("/api/admin/companies/pending/count"),

  /**
   * Get company details for review
   * GET /api/admin/companies/{id}/review
   */
  getCompanyForReview: (companyId) => 
    api.get(`/api/admin/companies/${companyId}/review`),

  /**
   * Update single company status
   * PATCH /api/admin/companies/{id}/status
   */
  updateCompanyStatus: (companyId, data) => 
    api.patch(`/api/admin/companies/${companyId}/status`, data),

  /**
   * Bulk update company statuses
   * PATCH /api/admin/companies/bulk-status
   */
  bulkUpdateStatus: (data) => 
    api.patch("/api/admin/companies/bulk-status", data),

  /**
 * Update company account (full update)
 * PUT /api/admin/users/companies/{id}
 */
  updateCompany: (companyId, data) => 
    api.put(`/api/admin/users/companies/${companyId}`, data),

/**
 * Delete company account
 * DELETE /api/admin/users/companies/{id}
 */
  deleteCompany: (companyId) => 
    api.delete(`/api/admin/users/companies/${companyId}`),
  /**
   * Get company audit logs
   * GET /api/admin/companies/{id}/audit-logs
   */
  getAuditLogs: (companyId, limit = 50) => 
    api.get(`/api/admin/companies/${companyId}/audit-logs?limit=${limit}`),
};

export default adminCompanyService;