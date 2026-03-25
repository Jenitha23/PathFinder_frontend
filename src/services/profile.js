/**
 * File: src/services/profile.js
 * Purpose: API methods for student/company profile management.
 */
import { api } from "./api";

export const studentProfileApi = {
  getMe: () => api.get("/api/student/me"),

  // Existing simple profile endpoint
  updateBasicProfile: (payload) => api.put("/api/student/profile", payload),

  // New detailed student profile endpoints
  getStudentProfile: () => api.get("/api/student/profile"),
  updateStudentProfile: (formData) =>
    api.put("/api/student/profile/update-v2", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }),

  deleteAccount: () => api.delete("/api/student/account"),
};

export const companyProfileApi = {
  // Basic methods
  getMe: () => api.get("/api/company/me"),
  deleteAccount: () => api.delete("/api/company/account"),
  
  // Full profile methods (for your feature)
  getProfile: () => api.get("/api/company/profile"),
  
  // Update profile with logo upload (form-data)
  updateProfileWithLogo: (formData) =>
    api.put("/api/company/profile/update-profile", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }),
  
  // Update profile without logo (JSON)
  updateProfileJson: (payload) =>
    api.put("/api/company/profile/update-profile", payload, {
      headers: {
        "Content-Type": "application/json",
      },
    }),
  
  // Remove company logo
  removeLogo: () => api.delete("/api/company/profile/logo"),
};