/**
 * File: src/hooks/useAdminCompanies.js
 * Purpose: Custom hook for admin company management
 */
import { useState, useEffect, useCallback, useReducer } from "react";
import adminCompanyService from "../services/adminCompanyService";

const initialState = {
  companies: [],
  total: 0,
  page: 1,
  pageSize: 20,
  totalPages: 0,
  loading: true,
  error: null,
  filters: {
    status: "ALL",
    searchTerm: "",
    fromDate: "",
    toDate: "",
    sortBy: "created_at_desc",
  },
};

function reducer(state, action) {
  switch (action.type) {
    case "SET_LOADING":
      return { ...state, loading: action.payload };
    case "SET_COMPANIES":
      return {
        ...state,
        companies: action.payload.companies,
        total: action.payload.total,
        totalPages: action.payload.totalPages,
        loading: false,
        error: null,
      };
    case "SET_ERROR":
      return { ...state, error: action.payload, loading: false };
    case "SET_PAGE":
      return { ...state, page: action.payload };
    case "SET_PAGE_SIZE":
      return { ...state, pageSize: action.payload, page: 1 };
    case "SET_FILTERS":
      return { ...state, filters: { ...state.filters, ...action.payload }, page: 1 };
    case "RESET_FILTERS":
      return { ...state, filters: initialState.filters, page: 1 };
    default:
      return state;
  }
}

export function useAdminCompanies() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [savingId, setSavingId] = useState(null);
  const [bulkLoading, setBulkLoading] = useState(false);

  const loadCompanies = useCallback(async () => {
    dispatch({ type: "SET_LOADING", payload: true });
    
    try {
      const { data } = await adminCompanyService.getCompanies({
        status: state.filters.status,
        searchTerm: state.filters.searchTerm,
        fromDate: state.filters.fromDate,
        toDate: state.filters.toDate,
        sortBy: state.filters.sortBy,
        page: state.page,
        pageSize: state.pageSize,
      });
      
      dispatch({
        type: "SET_COMPANIES",
        payload: {
          companies: data.companies || [],
          total: data.total || 0,
          totalPages: data.totalPages || 0,
        },
      });
    } catch (err) {
      dispatch({
        type: "SET_ERROR",
        payload: err?.response?.data?.message || "Failed to load companies.",
      });
    }
  }, [state.filters, state.page, state.pageSize]);

  useEffect(() => {
    loadCompanies();
  }, [loadCompanies]);

  const updateStatus = async (companyId, status, rejectionReason = null, adminNotes = null) => {
    setSavingId(companyId);
    
    try {
      const payload = { status };
      if (rejectionReason) payload.rejectionReason = rejectionReason;
      if (adminNotes) payload.adminNotes = adminNotes;
      
      await adminCompanyService.updateCompanyStatus(companyId, payload);
      await loadCompanies();
      
      return { success: true, message: `Company ${status.toLowerCase()} successfully.` };
    } catch (err) {
      const message = err?.response?.data?.message || "Failed to update status.";
      return { success: false, message };
    } finally {
      setSavingId(null);
    }
  };

  const bulkUpdate = async (companyIds, status, defaultRejectionReason = null, adminNotes = null) => {
    setBulkLoading(true);
    
    try {
      const payload = {
        companyIds,
        status,
        sendEmailNotifications: true,
      };
      if (defaultRejectionReason) payload.defaultRejectionReason = defaultRejectionReason;
      if (adminNotes) payload.adminNotes = adminNotes;
      
      const { data } = await adminCompanyService.bulkUpdateStatus(payload);
      await loadCompanies();
      
      return {
        success: true,
        successCount: data.successCount,
        failCount: data.failCount,
        results: data.results,
      };
    } catch (err) {
      const message = err?.response?.data?.message || "Bulk operation failed.";
      return { success: false, message };
    } finally {
      setBulkLoading(false);
    }
  };

  const setPage = (page) => dispatch({ type: "SET_PAGE", payload: page });
  const setPageSize = (size) => dispatch({ type: "SET_PAGE_SIZE", payload: size });
  const setFilters = (filters) => dispatch({ type: "SET_FILTERS", payload: filters });
  const resetFilters = () => dispatch({ type: "RESET_FILTERS" });

  return {
    ...state,
    savingId,
    bulkLoading,
    loadCompanies,
    updateStatus,
    bulkUpdate,
    setPage,
    setPageSize,
    setFilters,
    resetFilters,
  };
}