/**
 * File: src/components/Navbar.jsx
 * Purpose: Reusable UI component used across pages.
 */
import { Link, useNavigate, useLocation } from "react-router-dom";
import { clearAuth, getAuth, isLoggedIn } from "../services/auth";
import { api } from "../services/api";

// Renders the Navbar component.
export default function Navbar() {
  const nav = useNavigate();
  const location = useLocation();
  const auth = getAuth();
  const loggedIn = isLoggedIn();

  // Role-based dashboard path
  const getDashboardPath = () => {
    if (auth.role === "STUDENT") return "/student/home";
    if (auth.role === "COMPANY") return "/company/dashboard";
    if (auth.role === "ADMIN") return "/admin/dashboard";
    return "/";
  };

  // Runs an async operation and handles success/error states.
  const logout = async () => {
    try {
      if (auth.role === "STUDENT") {
        await api.post("/api/student/auth/logout");
      } else if (auth.role === "COMPANY") {
        await api.post("/api/company/auth/logout");
      }
    } catch {
      // ignore errors
    } finally {
      clearAuth();
      nav("/");
    }
  };

  // Hide full navbar on auth pages
  const isAuthPage = [
    "/student/login",
    "/student/register",
    "/company/login",
    "/company/register",
    "/admin/login",
    "/auth/choose",
  ].includes(location.pathname);

  if (isAuthPage) {
    return (
      <div
        className="pf-nav-min"
        style={{
          borderBottom: "1px solid var(--border)",
          background: "white",
          height: 65,
          display: "flex",
          alignItems: "center",
        }}
      >
        <div
          className="container pf-nav-min-inner"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
          }}
        >
          <Link
            to="/"
            className="pf-nav-brand"
            style={{ display: "flex", gap: 10, alignItems: "center" }}
          >
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: 12,
                background: "var(--primary)",
                color: "white",
                display: "grid",
                placeItems: "center",
                fontWeight: 900,
                fontSize: 13,
                fontFamily: "'Sora', sans-serif",
              }}
            >
              PF
            </div>
            <div className="pf-brand-text">
              <div
                style={{
                  fontWeight: 800,
                  fontFamily: "'Sora', sans-serif",
                  lineHeight: 1.1,
                }}
              >
                PathFinder
              </div>
              <div style={{ fontSize: 11, color: "var(--muted)" }}>
                Internship & Job Platform
              </div>
            </div>
          </Link>
          <Link className="btn btn-ghost btn-sm" to="/">
            â† Back to home
          </Link>
        </div>
      </div>
    );
  }

  const dashboardPath = getDashboardPath();

  return (
    <nav
      className="pf-nav"
      style={{
        borderBottom: "1px solid var(--border)",
        background: "white",
        position: "sticky",
        top: 0,
        zIndex: 100,
        boxShadow: "0 2px 12px rgba(10,36,114,0.05)",
        height: 65,
      }}
    >
      <div
        className="container pf-nav-inner"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          height: "100%",
        }}
      >
        {/* Logo */}
        <Link
          to="/"
          className="pf-nav-brand"
          style={{ display: "flex", gap: 10, alignItems: "center" }}
        >
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 12,
              background: "var(--primary)",
              color: "white",
              display: "grid",
              placeItems: "center",
              fontWeight: 900,
              fontSize: 13,
              fontFamily: "'Sora', sans-serif",
            }}
          >
            PF
          </div>
          <div className="pf-brand-text">
            <div
              style={{
                fontWeight: 800,
                fontFamily: "'Sora', sans-serif",
                lineHeight: 1.1,
                fontSize: 15,
              }}
            >
              PathFinder
            </div>
            <div style={{ fontSize: 11, color: "var(--muted)" }}>
              Internship & Job Platform
            </div>
          </div>
        </Link>

        {/* Nav links */}
        <div
          className="pf-nav-links"
          style={{ display: "flex", gap: 4, alignItems: "center" }}
        >
          <Link
            className="btn btn-ghost btn-sm"
            to="/"
            style={{
              color:
                location.pathname === "/"
                  ? "var(--primary)"
                  : "var(--text)",
            }}
          >
            Home
          </Link>

          {loggedIn && (
            <Link
              className="btn btn-ghost btn-sm"
              to={dashboardPath}
              style={{
                color:
                  location.pathname === dashboardPath
                    ? "var(--primary)"
                    : "var(--text)",
              }}
            >
              Dashboard
            </Link>
          )}
        </div>

        {/* Auth section */}
        <div
          className="pf-nav-auth"
          style={{ display: "flex", gap: 10, alignItems: "center" }}
        >
          {!loggedIn ? (
            <>
              <Link
                className="btn btn-outline btn-sm"
                to="/auth/choose?mode=login"
              >
                Sign In
              </Link>
              <Link
                className="btn btn-primary btn-sm"
                to="/auth/choose?mode=register"
              >
                Get Started
              </Link>
            </>
          ) : (
            <div
              className="pf-nav-user"
              style={{ display: "flex", gap: 10, alignItems: "center" }}
            >
              {/* User chip */}
              <div
                className="pf-user-chip"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  background: "var(--bg)",
                  border: "1px solid var(--border)",
                  borderRadius: 999,
                  padding: "6px 14px 6px 8px",
                }}
              >
                <div
                  style={{
                    width: 26,
                    height: 26,
                    borderRadius: "50%",
                    background:
                      auth.role === "COMPANY"
                        ? "var(--teal)"
                        : auth.role === "ADMIN"
                        ? "var(--coral)"
                        : "var(--primary)",
                    color: "white",
                    display: "grid",
                    placeItems: "center",
                    fontWeight: 700,
                    fontSize: 12,
                  }}
                >
                  {(auth.fullName || auth.email || "U")[0].toUpperCase()}
                </div>
                <div>
                  <div
                    style={{
                      fontWeight: 600,
                      fontSize: 13,
                      lineHeight: 1,
                    }}
                  >
                    {auth.fullName || auth.email}
                  </div>
                  <div
                    style={{
                      fontSize: 11,
                      color:
                        auth.role === "COMPANY"
                          ? "var(--teal)"
                          : auth.role === "ADMIN"
                          ? "var(--coral)"
                          : "var(--primary)",
                      lineHeight: 1,
                      marginTop: 2,
                    }}
                  >
                    {auth.role}
                  </div>
                </div>
              </div>

              <button className="btn btn-outline btn-sm" onClick={logout}>
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

