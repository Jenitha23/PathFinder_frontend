/**
 * File: src/services/passwordResetService.js
 * Purpose: API methods for password reset functionality
 * Follows same pattern as companyApplicationsService.js
 */
import { api } from "./api";

export const passwordResetService = {
  /**
   * Request password reset email
   * POST /api/passwordreset/forgot
   * @param {Object} data - { email, userType }
   */
  forgotPassword: (data) => api.post("/api/passwordreset/forgot", data),

  /**
   * Reset password using token
   * POST /api/passwordreset/reset
   * @param {Object} data - { token, newPassword, confirmPassword }
   */
  resetPassword: (data) => api.post("/api/passwordreset/reset", data),

  /**
   * Validate reset token
   * POST /api/passwordreset/validate-token
   * @param {Object} data - { token }
   */
  validateToken: (data) => api.post("/api/passwordreset/validate-token", data),
};

export default passwordResetService;