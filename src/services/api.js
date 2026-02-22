import axios from "axios";

// Change this if your backend runs on a different port
export const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5249";

export const api = axios.create({
  baseURL: API_BASE,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("pf_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});