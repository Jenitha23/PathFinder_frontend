/**
 * File: src/hooks/useJobMatches.js
 * Purpose: Custom hook for managing job matches state
 */
import { useState, useEffect, useCallback } from "react";
import aiService from "../services/aiService";

export function useJobMatches(limit = 10) {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadMatches = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await aiService.getJobMatches(limit);
      setMatches(res.data.matches || []);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load job matches");
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    loadMatches();
  }, [loadMatches]);

  const refresh = useCallback(() => {
    loadMatches();
  }, [loadMatches]);

  return { matches, loading, error, refresh };
}