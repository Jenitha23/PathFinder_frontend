/**
 * File: src/hooks/usePasswordReset.js
 * Purpose: Custom hook for password reset functionality
 * Follows pattern similar to useCompanyJobsPerMonthReport.js
 */
import { useState } from "react";
import passwordResetService from "../services/passwordResetService";

export const usePasswordReset = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [tokenValid, setTokenValid] = useState(null);
  const [tokenData, setTokenData] = useState(null);

  const forgotPassword = async (email, userType) => {
    setLoading(true);
    setError("");
    setSuccess("");
    
    try {
      const { data } = await passwordResetService.forgotPassword({ email, userType });
      setSuccess(data.message);
      return { success: true, message: data.message, expiresAt: data.expiresAt };
    } catch (err) {
      const message = err.response?.data?.message || "Failed to send reset link. Please try again.";
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (token, newPassword, confirmPassword) => {
    setLoading(true);
    setError("");
    setSuccess("");
    
    try {
      const { data } = await passwordResetService.resetPassword({ token, newPassword, confirmPassword });
      setSuccess(data.message);
      return { success: true, message: data.message };
    } catch (err) {
      const message = err.response?.data?.message || "Failed to reset password. Please try again.";
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  const validateToken = async (token) => {
    setLoading(true);
    setError("");
    
    try {
      const { data } = await passwordResetService.validateToken({ token });
      setTokenValid(data.valid);
      if (data.valid) {
        setTokenData({ email: data.email, userType: data.userType, expiresAt: data.expiresAt });
      }
      return data;
    } catch (err) {
      setTokenValid(false);
      setError("Invalid or expired reset link.");
      return { valid: false };
    } finally {
      setLoading(false);
    }
  };

  const clearState = () => {
    setError("");
    setSuccess("");
    setTokenValid(null);
    setTokenData(null);
  };

  return {
    forgotPassword,
    resetPassword,
    validateToken,
    loading,
    error,
    success,
    tokenValid,
    tokenData,
    clearState,
  };
};