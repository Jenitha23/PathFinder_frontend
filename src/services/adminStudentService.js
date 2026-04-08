/**
 * File: src/services/adminStudentService.js
 * Purpose: API methods for admin student management
 */
import { api } from "./api";

export const adminStudentService = {
  /**
   * Get all students with filters and pagination
   * GET /api/admin/users/students
   */
  getStudents: (filters = {}) => {
    const params = new URLSearchParams();
    
    if (filters.searchTerm) 
      params.append("search", filters.searchTerm);
    if (filters.status && filters.status !== "ALL") 
      params.append("status", filters.status);
    if (filters.page) 
      params.append("page", filters.page);
    if (filters.pageSize) 
      params.append("pageSize", filters.pageSize);
    
    const qs = params.toString();
    return api.get(`/api/admin/users/students${qs ? `?${qs}` : ""}`);
  },

  /**
   * Get student by ID
   * GET /api/admin/users/students/{id}
   */
  getStudentById: (studentId) => 
    api.get(`/api/admin/users/students/${studentId}`),

  /**
   * Update student account
   * PUT /api/admin/users/students/{id}
   */
  updateStudent: (studentId, data) => 
    api.put(`/api/admin/users/students/${studentId}`, data),

  /**
   * Delete student account
   * DELETE /api/admin/users/students/{id}
   */
  deleteStudent: (studentId) => 
    api.delete(`/api/admin/users/students/${studentId}`),

  /**
   * Get user statistics for dashboard
   * GET /api/admin/users/stats
   */
  getUserStats: () => 
    api.get("/api/admin/users/stats"),
};

export default adminStudentService;