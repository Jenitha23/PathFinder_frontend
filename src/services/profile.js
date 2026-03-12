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
  getMe: () => api.get("/api/company/me"),
  updateProfile: (payload) => api.put("/api/company/profile", payload),
  deleteAccount: () => api.delete("/api/company/account"),
};