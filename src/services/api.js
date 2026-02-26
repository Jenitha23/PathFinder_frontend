import axios from "axios";

// Change this if your backend runs on a different port
export const API_BASE = import.meta.env.VITE_API_BASE || "https://pathfinder-fqgwf0e6bvc2cmbq.southeastasia-01.azurewebsites.net";

export const api = axios.create({
  baseURL: API_BASE,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("pf_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});