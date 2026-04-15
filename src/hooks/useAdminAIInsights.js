/**
 * File: src/hooks/useAdminAIInsights.js
 * Purpose: Custom hook for fetching admin AI insights
 */
import { useState, useEffect, useCallback } from "react";
import aiService from "../services/aiService";

export function useAdminAIInsights() {
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadInsights = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await aiService.getAdminInsights();
      setInsights(res.data);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load AI insights");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadInsights();
  }, [loadInsights]);

  const refresh = useCallback(() => {
    loadInsights();
  }, [loadInsights]);

  return { insights, loading, error, refresh };
}