/**
 * File: src/hooks/useApplicationsPerJobReport.js
 * Purpose: Custom hook for applications per job report data fetching
 */
import { useState, useEffect, useCallback, useRef } from "react";
import reportsService from "../services/reportsService";

const initialState = {
  data: null,
  loading: true,
  error: null,
  isEmpty: false,
  filters: {
    jobId: "",
    startDate: "",
    endDate: "",
  },
};

export function useApplicationsPerJobReport(role = "company") {
  const [state, setState] = useState(initialState);
  const [refreshing, setRefreshing] = useState(false);
  const isInitialMount = useRef(true);
  const isLoadingRef = useRef(false);

  const loadReport = useCallback(async (filters) => {
    if (isLoadingRef.current) return;
    isLoadingRef.current = true;
    setState((prev) => ({ ...prev, loading: true, error: null }));

    const params = {};
    if (filters.jobId && filters.jobId !== "") params.jobId = filters.jobId;
    if (filters.startDate) params.startDate = filters.startDate;
    if (filters.endDate) params.endDate = filters.endDate;

    try {
      const { data } = await reportsService.getApplicationsPerJobReport(params, role);
      setState({
        data: data.report,
        loading: false,
        error: null,
        isEmpty: data.isEmpty || false,
        filters,
      });
    } catch (err) {
      console.error("Applications per job report error:", err);
      setState((prev) => ({
        ...prev,
        loading: false,
        error: err?.response?.data?.message || "Failed to load report.",
        isEmpty: true,
      }));
    } finally {
      isLoadingRef.current = false;
    }
  }, [role]);

  const updateFilters = useCallback(
    (newFilters) => {
      const mergedFilters = { ...state.filters, ...newFilters };
      setState((prev) => ({ ...prev, filters: mergedFilters }));
      loadReport(mergedFilters);
    },
    [state.filters, loadReport]
  );

  const refresh = useCallback(() => {
    setRefreshing(true);
    loadReport(state.filters).finally(() => setRefreshing(false));
  }, [loadReport, state.filters]);

  // Initial load
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      loadReport(state.filters);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    data: state.data,
    loading: state.loading,
    error: state.error,
    isEmpty: state.isEmpty,
    filters: state.filters,
    refreshing,
    updateFilters,
    refresh,
  };
}