/**
 * File: src/services/api.js
 * Purpose: Shared service layer for API/auth utilities.
 */
import axios from "axios";
import { clearAuth, getAuth } from "./auth";

export const API_BASE =
//import.meta.env.VITE_API_BASE || "https://pathfinder-fqgwf0e6bvc2cmbq.southeastasia-01.azurewebsites.net";
import.meta.env.VITE_API_BASE || "http://localhost:5249";


export const api = axios.create({
  baseURL: API_BASE,
});

const isAuthEndpoint = (url = "") =>
  url.includes("/api/admin/auth/login") ||
  url.includes("/api/student/auth/login") ||
  url.includes("/api/company/auth/login");

api.interceptors.request.use((config) => {
  const { token } = getAuth();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    const url = error?.config?.url || "";

    if ((status === 401 || status === 403) && !isAuthEndpoint(url)) {
      clearAuth();
      const redirectTo = window.location.pathname.startsWith("/admin") ? "/admin/login" : "/";
      if (window.location.pathname !== redirectTo) {
        window.location.replace(redirectTo);
      }
    }

    return Promise.reject(error);
  },
);

