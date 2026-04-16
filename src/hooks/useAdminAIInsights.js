/**
 * File: src/hooks/useAdminAIInsights.js
 * Purpose: Custom hook for fetching admin AI insights from backend
 */
import { useState, useEffect, useCallback } from "react";
import aiService from "../services/aiService";

export function useAdminAIInsights() {
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [aiAvailable, setAiAvailable] = useState(true);
  const [aiMessage, setAiMessage] = useState("");

  const loadInsights = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await aiService.getAdminInsights();
      
      // Backend returns: { success, message, data, metadata }
      if (res.data && res.data.data) {
        setInsights(res.data.data);
        setAiAvailable(res.data.success !== false);
        setAiMessage(res.data.message || "");
      } else {
        // Fallback for unexpected response structure
        setInsights(res.data);
        setAiAvailable(true);
      }
    } catch (err) {
      console.error("Failed to load AI insights:", err);
      setError(err?.response?.data?.message || "Failed to load AI insights");
      setAiAvailable(false);
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

  return { 
    insights, 
    loading, 
    error, 
    refresh,
    aiAvailable,
    aiMessage
  };
}