import { Link, useNavigate, useLocation } from "react-router-dom";
import { clearAuth, getAuth, isLoggedIn } from "../services/auth";

export default function Navbar() {
  const nav = useNavigate();
  const location = useLocation();
  const auth = getAuth();
  const loggedIn = isLoggedIn();

  const logout = () => {
    clearAuth();
    nav("/");
  };

  // Hide full navbar on auth pages (login/register) — show minimal version
  const isAuthPage = ["/student/login", "/student/register", "/company/login", "/admin/login"].includes(location.pathname);

  if (isAuthPage) {
    return (
      <div style={{
        borderBottom: "1px solid var(--border)",
        background: "white",
        height: 65,
        display: "flex",
        alignItems: "center",
      }}>
        <div className="container" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
          <Link to="/" style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <div style={{
              width: 34, height: 34, borderRadius: 12,
              background: "var(--primary)", color: "white",
              display: "grid", placeItems: "center",
              fontWeight: 900, fontSize: 13, fontFamily: "'Sora', sans-serif",
            }}>PF</div>
            <div>
              <div style={{ fontWeight: 800, fontFamily: "'Sora', sans-serif", lineHeight: 1.1 }}>PathFinder</div>
              <div style={{ fontSize: 11, color: "var(--muted)" }}>Internship & Job Platform</div>
            </div>
          </Link>
          <Link className="btn btn-ghost btn-sm" to="/">← Back to home</Link>
        </div>
      </div>
    );
  }

  return (
    <nav style={{
      borderBottom: "1px solid var(--border)",
      background: "white",
      position: "sticky", top: 0, zIndex: 100,
      boxShadow: "0 2px 12px rgba(10,36,114,0.05)",
      height: 65,
    }}>
      <div className="container" style={{
        display: "flex", alignItems: "center",
        justifyContent: "space-between",
        height: "100%",
      }}>
        {/* Logo */}
        <Link to="/" style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <div style={{
            width: 36, height: 36, borderRadius: 12,
            background: "var(--primary)", color: "white",
            display: "grid", placeItems: "center",
            fontWeight: 900, fontSize: 13, fontFamily: "'Sora', sans-serif",
          }}>PF</div>
          <div>
            <div style={{ fontWeight: 800, fontFamily: "'Sora', sans-serif", lineHeight: 1.1, fontSize: 15 }}>PathFinder</div>
            <div style={{ fontSize: 11, color: "var(--muted)" }}>Internship & Job Platform</div>
          </div>
        </Link>

        {/* Nav links */}
        <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
          <Link
            className="btn btn-ghost btn-sm"
            to="/"
            style={{ color: location.pathname === "/" ? "var(--primary)" : "var(--text)" }}
          >Home</Link>

          {loggedIn && (
            <Link
              className="btn btn-ghost btn-sm"
              to="/student/home"
              style={{ color: location.pathname === "/student/home" ? "var(--primary)" : "var(--text)" }}
            >Dashboard</Link>
          )}
        </div>

        {/* Auth section */}
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          {!loggedIn ? (
            <>
              <Link className="btn btn-outline btn-sm" to="/student/login">Sign In</Link>
              <Link className="btn btn-primary btn-sm" to="/student/register">Get Started</Link>
            </>
          ) : (
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              {/* User chip */}
              <div style={{
                display: "flex", alignItems: "center", gap: 8,
                background: "var(--bg)", border: "1px solid var(--border)",
                borderRadius: 999, padding: "6px 14px 6px 8px",
              }}>
                <div style={{
                  width: 26, height: 26, borderRadius: "50%",
                  background: "var(--teal)", color: "white",
                  display: "grid", placeItems: "center",
                  fontWeight: 700, fontSize: 12,
                }}>
                  {(auth.fullName || auth.email || "U")[0].toUpperCase()}
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 13, lineHeight: 1 }}>
                    {auth.fullName || auth.email}
                  </div>
                  <div style={{ fontSize: 11, color: "var(--teal)", lineHeight: 1, marginTop: 2 }}>
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