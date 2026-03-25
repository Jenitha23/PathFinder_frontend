/**
 * File: src/hooks/useCompanyProfile.js
 * Purpose: Custom hook for company profile management
 */
import { useState, useEffect, useCallback } from "react";
import { companyProfileApi } from "../services/profile";
import { saveAuth, getAuth } from "../services/auth";

export const useCompanyProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(null);
  const auth = getAuth();

  const loadProfile = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await companyProfileApi.getProfile();
      setProfile(data);
      
      // Update auth context with latest company info
      if (data && auth.token) {
        saveAuth({
          token: auth.token,
          role: auth.role,
          userId: auth.userId,
          email: data.email,
          fullName: data.companyName,
        });
      }
    } catch (err) {
      const message = err.response?.data?.message || err.response?.data?.error || "Failed to load company profile.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [auth.token, auth.role, auth.userId]);

  const updateProfile = async (formData) => {
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const { data } = await companyProfileApi.updateProfileWithLogo(formData);
      setProfile(data.profile);
      setSuccess(data.message);
      
      // Update auth context
      if (data.profile) {
        saveAuth({
          token: auth.token,
          role: auth.role,
          userId: auth.userId,
          email: data.profile.email,
          fullName: data.profile.companyName,
        });
      }
      
      return { success: true, data: data.profile };
    } catch (err) {
      const message = err.response?.data?.message || err.response?.data?.error || "Failed to update profile.";
      setError(typeof message === 'object' ? JSON.stringify(message) : message);
      return { success: false, error: message };
    } finally {
      setSaving(false);
    }
  };

  const removeLogo = async () => {
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      await companyProfileApi.removeLogo();
      setProfile(prev => ({ ...prev, logoUrl: null }));
      setSuccess("Logo removed successfully.");
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.message || "Failed to remove logo.";
      setError(message);
      return { success: false, error: message };
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  return {
    profile,
    loading,
    error,
    saving,
    success,
    loadProfile,
    updateProfile,
    removeLogo,
    setSuccess,
    setError,
  };
};