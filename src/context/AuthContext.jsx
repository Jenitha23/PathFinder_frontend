import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { AUTH_CHANGED_EVENT, clearAuth, getAuth, saveAuth } from "../services/auth";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(getAuth());

  useEffect(() => {
    const syncAuth = () => setAuth(getAuth());
    window.addEventListener("storage", syncAuth);
    window.addEventListener(AUTH_CHANGED_EVENT, syncAuth);

    return () => {
      window.removeEventListener("storage", syncAuth);
      window.removeEventListener(AUTH_CHANGED_EVENT, syncAuth);
    };
  }, []);

  const value = useMemo(
    () => ({
      ...auth,
      isAuthenticated: !!auth.token,
      login: (payload) => {
        saveAuth(payload);
        setAuth(getAuth());
      },
      logout: () => {
        clearAuth();
        setAuth(getAuth());
      },
    }),
    [auth],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return ctx;
}
