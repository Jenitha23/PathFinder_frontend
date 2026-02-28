/**
 * File: src/services/auth.js
 * Purpose: Shared service layer for API/auth utilities.
 */
const AUTH_EVENT = "pf-auth-changed";

export function saveAuth({ token, role, userId, email, fullName }) {
  localStorage.setItem("pf_token", token || "");
  localStorage.setItem("pf_role", role || "");
  localStorage.setItem("pf_userId", String(userId ?? ""));
  localStorage.setItem("pf_email", email || "");
  localStorage.setItem("pf_fullName", fullName || "");
  window.dispatchEvent(new Event(AUTH_EVENT));
}

export function clearAuth() {
  localStorage.removeItem("pf_token");
  localStorage.removeItem("pf_role");
  localStorage.removeItem("pf_userId");
  localStorage.removeItem("pf_email");
  localStorage.removeItem("pf_fullName");
  window.dispatchEvent(new Event(AUTH_EVENT));
}

export function getAuth() {
  return {
    token: localStorage.getItem("pf_token"),
    role: localStorage.getItem("pf_role"),
    userId: localStorage.getItem("pf_userId"),
    email: localStorage.getItem("pf_email"),
    fullName: localStorage.getItem("pf_fullName"),
  };
}

export function isLoggedIn() {
  return !!localStorage.getItem("pf_token");
}

export const AUTH_CHANGED_EVENT = AUTH_EVENT;

