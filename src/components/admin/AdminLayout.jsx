import { NavLink, useNavigate } from "react-router-dom";
import { api } from "../../services/api";
import { useAuth } from "../../context/AuthContext";

const NAV_ITEMS = [
  { to: "/admin/dashboard", label: "Dashboard" },
  { to: "/admin/profile", label: "Profile" },
  { to: "/admin/students", label: "Students" },
  { to: "/admin/companies", label: "Companies" },
];

export default function AdminLayout({ title, subtitle, children }) {
  const nav = useNavigate();
  const auth = useAuth();
  const initial = (auth.fullName || auth.email || "A")[0].toUpperCase();

  const logout = async () => {
    try {
      await api.post("/api/admin/auth/logout");
    } catch {
      // ignore logout errors
    } finally {
      auth.logout();
      nav("/admin/login", { replace: true });
    }
  };

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar card">
        <div className="admin-brand">
          <div className="admin-brand-logo">PF</div>
          <div>
            <div className="admin-brand-title">PathFinder</div>
            <div className="admin-brand-sub">Admin Portal</div>
          </div>
        </div>

        <nav className="admin-nav">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `admin-nav-link ${isActive ? "admin-nav-link-active" : ""}`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="admin-sidebar-footer">
          <div className="helper" style={{ marginBottom: 10 }}>
            {auth.fullName || auth.email}
          </div>
          <button className="btn btn-outline btn-sm" onClick={logout}>
            Logout
          </button>
        </div>
      </aside>

      <section className="admin-main">
        <header className="admin-hero">
          <div className="admin-hero-bg" />
          <div className="admin-hero-content">
            <div className="admin-hero-avatar">{initial}</div>
            <div>
              <h1>{title}</h1>
              {subtitle ? <p>{subtitle}</p> : null}
            </div>
          </div>
        </header>
        {children}
      </section>
    </div>
  );
}
