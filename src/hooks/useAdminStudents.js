/**
 * File: src/hooks/useAdminStudents.js
 * Purpose: Custom hook for admin student management
 */
import { useState, useEffect, useCallback, useReducer } from "react";
import adminStudentService from "../services/adminStudentService";

const initialState = {
  students: [],
  total: 0,
  page: 1,
  pageSize: 20,
  totalPages: 0,
  loading: true,
  error: null,
  filters: {
    searchTerm: "",
    status: "ALL",
  },
};

function reducer(state, action) {
  switch (action.type) {
    case "SET_LOADING":
      return { ...state, loading: action.payload };
    case "SET_STUDENTS":
      return {
        ...state,
        students: action.payload.users || [],
        total: action.payload.total || 0,
        totalPages: action.payload.totalPages || 0,
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

export function useAdminStudents() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [savingId, setSavingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const loadStudents = useCallback(async () => {
    dispatch({ type: "SET_LOADING", payload: true });
    
    try {
      const { data } = await adminStudentService.getStudents({
        searchTerm: state.filters.searchTerm,
        status: state.filters.status,
        page: state.page,
        pageSize: state.pageSize,
      });
      
      dispatch({
        type: "SET_STUDENTS",
        payload: {
          users: data.users || [],
          total: data.total || 0,
          totalPages: data.totalPages || 0,
        },
      });
    } catch (err) {
      dispatch({
        type: "SET_ERROR",
        payload: err?.response?.data?.message || "Failed to load students.",
      });
    }
  }, [state.filters, state.page, state.pageSize]);

  useEffect(() => {
    loadStudents();
  }, [loadStudents]);

  const updateStudent = async (studentId, data) => {
    setSavingId(studentId);
    
    try {
      await adminStudentService.updateStudent(studentId, data);
      await loadStudents();
      return { success: true, message: "Student updated successfully." };
    } catch (err) {
      const message = err?.response?.data?.message || "Failed to update student.";
      return { success: false, message };
    } finally {
      setSavingId(null);
    }
  };

  const deleteStudent = async (studentId) => {
    setDeletingId(studentId);
    
    try {
      await adminStudentService.deleteStudent(studentId);
      await loadStudents();
      return { success: true, message: "Student deleted successfully." };
    } catch (err) {
      const message = err?.response?.data?.message || "Failed to delete student.";
      return { success: false, message };
    } finally {
      setDeletingId(null);
    }
  };

  const setPage = (page) => dispatch({ type: "SET_PAGE", payload: page });
  const setPageSize = (size) => dispatch({ type: "SET_PAGE_SIZE", payload: size });
  const setFilters = (filters) => dispatch({ type: "SET_FILTERS", payload: filters });
  const resetFilters = () => dispatch({ type: "RESET_FILTERS" });

  return {
    ...state,
    savingId,
    deletingId,
    loadStudents,
    updateStudent,
    deleteStudent,
    setPage,
    setPageSize,
    setFilters,
    resetFilters,
  };
}