/**
 * File: src/hooks/useRankedApplicants.js
 * Purpose: Custom hook for managing ranked applicants state
 */
import { useState, useCallback } from "react";
import aiService from "../services/aiService";

export function useRankedApplicants(jobId) {
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadRankedApplicants = useCallback(async () => {
    if (!jobId) return;
    
    setLoading(true);
    setError(null);
    try {
      const res = await aiService.getRankedApplicants(jobId);
      setApplicants(res.data.applicants || []);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load ranked applicants");
    } finally {
      setLoading(false);
    }
  }, [jobId]);

  const refresh = useCallback(() => {
    loadRankedApplicants();
  }, [loadRankedApplicants]);

  return { applicants, loading, error, refresh, loadRankedApplicants };
}