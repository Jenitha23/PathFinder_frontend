/**
 * File: src/services/applications.js
 * Purpose: API methods for student job applications + local tracker.
 */
import { api } from "./api";

/* ── Remote API ─────────────────────────────────────── */
export const applicationsApi = {
  applyForJob: ({ jobId, coverLetter }) =>
    api.post("/api/applications", { jobId, coverLetter }),
};

/* ── Local session tracker (localStorage) ───────────── */
const LS_KEY = "pf_applied_jobs";

function readStore() {
  try {
    return JSON.parse(localStorage.getItem(LS_KEY) || "[]");
  } catch {
    return [];
  }
}

function writeStore(items) {
  localStorage.setItem(LS_KEY, JSON.stringify(items));
}

export const localApplications = {
  /** Save an application after a successful POST */
  add(job, applicationId) {
    const existing = readStore();
    const alreadyExists = existing.some(a => a.jobId === job.id);
    if (!alreadyExists) {
      writeStore([
        {
          jobId: job.id,
          title: job.title,
          companyName: job.companyName,
          location: job.location || "",
          type: job.type || "",
          applicationId,
          appliedAt: new Date().toISOString(),
          status: "Pending",
        },
        ...existing,
      ]);
    }
  },

  /** Returns all locally stored applications */
  getAll() {
    return readStore();
  },

  /** Check if the student has already applied (locally) */
  hasApplied(jobId) {
    return readStore().some(a => a.jobId === jobId);
  },

  /** Clear all stored applications (e.g., on logout) */
  clear() {
    localStorage.removeItem(LS_KEY);
  },
};
