/**
 * File: src/services/jobs.js
 * Purpose: API methods for student job browsing and job details.
 */
import { api } from "./api";

export const jobsApi = {
  getJobs: (params = {}) => api.get("/api/jobs", { params }),
  getJobById: (id) => api.get(`/api/jobs/${id}`),
};