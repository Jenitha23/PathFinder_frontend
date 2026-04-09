/**
 * File: src/hooks/useCompanyJobsPerMonthReport.js
 * Purpose: Custom hook for company jobs per month report data fetching
 */
import { useState, useEffect, useCallback, useRef } from "react";
import companyReportsService from "../services/companyReportsService";

const initialState = {
  data: null,
  loading: true,
  error: null,
  isEmpty: false,
  filters: {
    year: "",
    startDate: "",
    endDate: "",
  },
};

export function useCompanyJobsPerMonthReport() {
  const [state, setState] = useState(initialState);
  const [refreshing, setRefreshing] = useState(false);
  const isInitialMount = useRef(true);
  const isLoadingRef = useRef(false);

  const loadReport = useCallback(async (filters) => {
    if (isLoadingRef.current) return;
    isLoadingRef.current = true;
    setState((prev) => ({ ...prev, loading: true, error: null }));

    const params = {};
    if (filters.year && filters.year !== "") params.year = filters.year;
    if (filters.startDate) params.startDate = filters.startDate;
    if (filters.endDate) params.endDate = filters.endDate;

    try {
      const { data } = await companyReportsService.getJobsPerMonthReport(params);
      setState({
        data: data.data,
        loading: false,
        error: null,
        isEmpty: data.isEmpty || false,
        filters,
      });
    } catch (err) {
      console.error("Jobs per month report error:", err);
      setState((prev) => ({
        ...prev,
        loading: false,
        error: err?.response?.data?.message || "Failed to load report.",
        isEmpty: true,
      }));
    } finally {
      isLoadingRef.current = false;
    }
  }, []);

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