/**
 * File: src/services/companyProfileService.js
 * Purpose: API methods for company profile management
 */
import { api } from "./api";

export const companyProfileService = {
  /**
   * Get basic company info from /me endpoint
   */
  getMe: () => api.get("/api/company/me"),

  /**
   * Get full company profile
   * GET /api/company/profile
   */
  getProfile: () => api.get("/api/company/profile"),

  /**
   * Update company profile with logo upload (form-data)
   * PUT /api/company/update-profile
   * @param {FormData} formData - Contains text fields and optional LogoFile
   */
  updateProfileWithLogo: (formData) =>
    api.put("/api/company/update-profile", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }),

  /**
   * Update company profile without logo (JSON)
   * PUT /api/company/update-profile
   * @param {Object} data - Company profile data
   */
  updateProfileJson: (data) =>
    api.put("/api/company/update-profile", data, {
      headers: {
        "Content-Type": "application/json",
      },
    }),

  /**
   * Remove company logo
   * DELETE /api/company/profile/logo
   */
  removeLogo: () => api.delete("/api/company/profile/logo"),

  /**
   * Delete company account
   * DELETE /api/company/account
   */
  deleteAccount: () => api.delete("/api/company/account"),
};

export default companyProfileService;