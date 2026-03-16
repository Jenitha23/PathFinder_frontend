/**
 * File: src/services/applications.js
 * Purpose: API methods for student job applications.
 */
import { api } from "./api";

export const applicationsApi = {
  applyForJob: ({ jobId, coverLetter }) =>
    api.post("/api/applications", { jobId, coverLetter }),
};
