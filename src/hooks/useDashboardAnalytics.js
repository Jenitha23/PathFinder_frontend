/**
 * File: src/hooks/useDashboardAnalytics.js
 * Purpose: Custom hook for admin dashboard analytics data fetching
 */
import { useState, useEffect, useCallback, useReducer, useRef } from "react";
import adminDashboardService from "../services/adminDashboardService";

const initialState = {
  stats: null,
  jobsPerMonth: null,
  topJobs: null,
  statusDistribution: null,
  loading: true,
  error: null,
  isEmpty: false,
  dateRange: {
    startDate: null,
    endDate: null,
    preset: "last30days",
  },
};

function reducer(state, action) {
  switch (action.type) {
    case "SET_LOADING":
      return { ...state, loading: action.payload };
    case "SET_DATA":
      return {
        ...state,
        stats: action.payload.stats,
        jobsPerMonth: action.payload.jobsPerMonth,
        topJobs: action.payload.applicationsPerJob,
        statusDistribution: action.payload.statusDistribution,
        isEmpty: action.payload.isEmpty || false,
        loading: false,
        error: null,
      };
    case "SET_ERROR":
      return { ...state, error: action.payload, loading: false };
    case "SET_DATE_RANGE":
      return {
        ...state,
        dateRange: {
          ...state.dateRange,
          ...action.payload,
        },
      };
    case "RESET":
      return initialState;
    default:
      return state;
  }
}

export function useDashboardAnalytics() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [refreshing, setRefreshing] = useState(false);
  const isInitialMount = useRef(true);
  const isLoadingRef = useRef(false);

  // Create a stable version of loadAnalytics that doesn't depend on state.dateRange
  const loadAnalytics = useCallback(async (dateRangeParams) => {
    // Prevent multiple simultaneous requests
    if (isLoadingRef.current) return;
    isLoadingRef.current = true;
    
    dispatch({ type: "SET_LOADING", payload: true });

    const params = dateRangeParams || state.dateRange;
    const queryParams = {};

    if (params.startDate) queryParams.startDate = params.startDate;
    if (params.endDate) queryParams.endDate = params.endDate;

    try {
      const { data } = await adminDashboardService.getAnalytics(queryParams);

      dispatch({
        type: "SET_DATA",
        payload: {
          stats: data.stats,
          jobsPerMonth: data.jobsPerMonth,
          applicationsPerJob: data.applicationsPerJob,
          statusDistribution: data.statusDistribution,
          isEmpty: data.isEmpty,
        },
      });
    } catch (err) {
      console.error("Dashboard analytics error:", err);
      dispatch({
        type: "SET_ERROR",
        payload: err?.response?.data?.message || "Failed to load dashboard data.",
      });
    } finally {
      isLoadingRef.current = false;
    }
  }, [state.dateRange]); // Only depends on state.dateRange

  const refresh = useCallback(async () => {
    setRefreshing(true);
    await loadAnalytics();
    setRefreshing(false);
  }, [loadAnalytics]);

  const updateDateRange = useCallback((startDate, endDate, preset = null) => {
    const newRange = { startDate, endDate };
    if (preset) newRange.preset = preset;
    dispatch({ type: "SET_DATE_RANGE", payload: newRange });
    // Load with new date range
    loadAnalytics(newRange);
  }, [loadAnalytics]);

  // Initial load - runs only once on mount
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      loadAnalytics();
    }
  }, []); // Empty dependency array - runs only once

  return {
    stats: state.stats,
    jobsPerMonth: state.jobsPerMonth,
    topJobs: state.topJobs,
    statusDistribution: state.statusDistribution,
    loading: state.loading,
    error: state.error,
    isEmpty: state.isEmpty,
    dateRange: state.dateRange,
    refreshing,
    loadAnalytics,
    refresh,
    updateDateRange,
  };
}