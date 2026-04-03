/**
 * File: src/hooks/useCompanyApplications.js
 * Purpose: Custom hook for company applicant management
 */
import { useState, useCallback } from "react";
import companyApplicationsService from "../services/companyApplicationsService";

export const useCompanyApplications = () => {
  const [applicants, setApplicants] = useState([]);
  const [selectedApplicant, setSelectedApplicant] = useState(null);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [stats, setStats] = useState(null);

  const loadApplicants = useCallback(async (jobId, statusFilter = null) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await companyApplicationsService.getJobApplicants(jobId, statusFilter);
      setApplicants(data.applicants || []);
      return data;
    } catch (err) {
      const message = err.response?.data?.message || "Failed to load applicants.";
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const loadApplicantDetails = useCallback(async (jobId, applicationId) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await companyApplicationsService.getApplicantDetails(jobId, applicationId);
      setSelectedApplicant(data.applicant);
      return data.applicant;
    } catch (err) {
      const message = err.response?.data?.message || "Failed to load applicant details.";
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateStatus = useCallback(async (jobId, applicationId, newStatus) => {
    setUpdating(true);
    setError(null);
    setSuccess(null);
    try {
      const { data } = await companyApplicationsService.updateApplicationStatus(
        jobId,
        applicationId,
        newStatus
      );
      
      // Update local state
      setApplicants(prev => prev.map(app => 
        app.applicationId === applicationId 
          ? { ...app, status: newStatus }
          : app
      ));
      
      if (selectedApplicant?.applicationId === applicationId) {
        setSelectedApplicant(prev => ({ ...prev, status: newStatus }));
      }
      
      setSuccess(data.message);
      return data;
    } catch (err) {
      const message = err.response?.data?.message || "Failed to update status.";
      setError(message);
      throw err;
    } finally {
      setUpdating(false);
    }
  }, [selectedApplicant]);

  const loadStats = useCallback(async (jobId) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await companyApplicationsService.getApplicationStats(jobId);
      setStats(data.stats);
      return data.stats;
    } catch (err) {
      const message = err.response?.data?.message || "Failed to load statistics.";
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const clearSuccess = () => setSuccess(null);
  const clearError = () => setError(null);

  return {
    applicants,
    selectedApplicant,
    loading,
    updating,
    error,
    success,
    stats,
    loadApplicants,
    loadApplicantDetails,
    updateStatus,
    loadStats,
    clearSuccess,
    clearError,
    setSelectedApplicant,
  };
};