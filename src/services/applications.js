/**
 * File: src/services/applications.js
 * Purpose: API methods for student job applications + local tracker.
 */
import { api } from "./api";

/* ── Remote API ─────────────────────────────────────── */
export const applicationsApi = {
  applyForJob: ({ jobId, coverLetter }) =>
    api.post("/api/applications", { jobId, coverLetter }),

  getApplicationCount: () =>
    api.get("/api/applications/count"),

  /**
   * Fetch all applications with optional sorting and status filter.
   * @param {Object} params
   * @param {string} [params.sortBy] - "date_desc" (default) or "date_asc"
   * @param {string} [params.status] - "Pending" | "Shortlisted" | "Rejected" | "Accepted"
   */
  getApplications: (params = {}) => {
    const query = new URLSearchParams();
    if (params.sortBy) query.append("sortBy", params.sortBy);
    if (params.status) query.append("status", params.status);
    const qs = query.toString();
    return api.get(`/api/applications${qs ? `?${qs}` : ""}`);
  },
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

/* ── Saved jobs tracker (localStorage) ──────────────── */
const SAVED_JOBS_KEY = "pf_saved_jobs";

function readSavedStore() {
  try {
    return JSON.parse(localStorage.getItem(SAVED_JOBS_KEY) || "[]");
  } catch {
    return [];
  }
}

function writeSavedStore(items) {
  localStorage.setItem(SAVED_JOBS_KEY, JSON.stringify(items));
}

export const localSavedJobs = {
  /** Toggle saved state for a job */
  toggle(job) {
    const existing = readSavedStore();
    const index = existing.findIndex((j) => j.id === job.id);
    if (index === -1) {
      // Add
      writeSavedStore([
        {
          id: job.id,
          title: job.title,
          companyName: job.companyName,
          location: job.location || "",
          type: job.type || "",
          deadline: job.deadline,
          category: job.category || "",
          savedAt: new Date().toISOString(),
        },
        ...existing,
      ]);
      return true; // Added
    } else {
      // Remove
      existing.splice(index, 1);
      writeSavedStore(existing);
      return false; // Removed
    }
  },

  /** Returns all locally stored saved jobs */
  getAll() {
    return readSavedStore();
  },

  /** Check if the student has saved this job */
  isSaved(jobId) {
    return readSavedStore().some((j) => j.id === jobId);
  },

  /** Clear all saved jobs */
  clear() {
    localStorage.removeItem(SAVED_JOBS_KEY);
  },
};
