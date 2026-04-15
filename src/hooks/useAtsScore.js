/**
 * File: src/hooks/useAtsScore.js
 * Purpose: Custom hook for managing ATS score state
 */
import { useState, useCallback } from "react";
import aiService from "../services/aiService";

export function useAtsScore() {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const analyzeCV = useCallback(async (jobId = null, forceRefresh = false) => {
    setLoading(true);
    setError(null);
    try {
      const res = await aiService.analyzeCV({ jobId, forceRefresh });
      setAnalysis(res.data.result);
      return res.data.result;
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to analyze CV");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const clearAnalysis = useCallback(() => {
    setAnalysis(null);
    setError(null);
  }, []);

  return { analysis, loading, error, analyzeCV, clearAnalysis };
}