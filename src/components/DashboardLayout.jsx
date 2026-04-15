import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, User, Briefcase, Bookmark, FileText, LogOut, FileSearch, Users, PlusCircle, BarChart, Menu, X, Brain } from "lucide-react";
import { clearAuth, getAuth } from "../services/auth";
import { api } from "../services/api";

const getStudentLinks = () => [
  { label: "Dashboard", path: "/student/home", icon: <LayoutDashboard size={20} /> },
  { label: "Profile", path: "/student/profile", icon: <User size={20} /> },
  { label: "Browse Jobs", path: "/student/jobs", icon: <Briefcase size={20} /> },
  { label: "Saved Jobs", path: "/student/saved-jobs", icon: <Bookmark size={20} /> },
  { label: "Applications", path: "/student/applications", icon: <FileText size={20} /> },
  { label: "AI Career Assistant", path: "/student/ai-dashboard", icon: <Brain size={20} /> },
];

const getCompanyLinks = () => [
  { label: "Dashboard", path: "/company/dashboard", icon: <LayoutDashboard size={20} /> },
  { label: "Post a Job", path: "/company/post-job", icon: <PlusCircle size={20} /> },
  { label: "Active Jobs", path: "/company/jobs", icon: <Briefcase size={20} /> },
  { label: "Applicants", path: "/company/applicants", icon: <Users size={20} /> },
  { label: "AI Ranked Applicants", path: "/company/ranked-applicants", icon: <Brain size={20} /> },
  { label: "Reports", path: "/company/reports/jobs-per-month", icon: <BarChart size={20} /> },
];

export default function DashboardLayout({ children, role }) {
  const location = useLocation();
  const auth = getAuth();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  
  const links = role === "STUDENT" ? getStudentLinks() : getCompanyLinks();
  
  // Close mobile sidebar on route change
  useEffect(() => {
    setIsMobileOpen(false);
  }, [location.pathname]);

  const handleSignOut = async () => {
    try {
      if (role === "STUDENT") {
        await api.post("/api/student/auth/logout");
      } else if (role === "COMPANY") {
        await api.post("/api/company/auth/logout");
      }
    } catch {
      // ignore
    } finally {
      clearAuth();
      window.location.href = "/";
    }
  };

  return (
    <div style={{ display: "flex", height: "100vh", backgroundColor: "#f8f9fa", overflow: "hidden" }}>
      {/* Mobile Overlay */}
      <div 
        className={`sidebar-overlay ${isMobileOpen ? 'open' : ''}`} 
        onClick={() => setIsMobileOpen(false)}
      />

      {/* Sidebar */}
      <aside 
        className={`dashboard-sidebar ${isMobileOpen ? 'open' : ''}`}
        style={{ 
          width: 260, 
          backgroundColor: "white", 
          borderRight: "1px solid #e5e7eb",
          display: "flex",
          flexDirection: "column",
          padding: "24px 16px",
          flexShrink: 0,
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 40, padding: "0 12px" }}>
          <Link to="/" style={{ display: "flex", alignItems: "center", gap: 12, textDecoration: "none" }}>
            <img
                src="/Logo.png"
                alt="PathFinder"
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 12,
                  objectFit: "cover",
                }}
                onError={(e) => {
                  e.target.style.display = 'none';
                  const parent = e.target.parentElement;
                  const fallback = document.createElement('div');
                  fallback.style.cssText = `
                    width: 40px;
                    height: 40px;
                    border-radius: 12px;
                    background: #1e3a8a;
                    color: white;
                    display: grid;
                    place-items: center;
                    font-weight: 900;
                    font-size: 16px;
                    font-family: 'Sora', sans-serif;
                  `;
                  fallback.textContent = 'PF';
                  parent.insertBefore(fallback, e.target);
                }}
              />
              <div>
                <div style={{ fontWeight: 800, fontFamily: "'Sora', sans-serif", fontSize: 18, color: "#1f2937", lineHeight: 1 }}>PathFinder</div>
                <div style={{ fontSize: 10, color: "#6b7280", fontWeight: 600, letterSpacing: "0.5px", textTransform: "uppercase", marginTop: 4 }}>
                  {role === "STUDENT" ? "Student Portal" : "Company Portal"}
                </div>
              </div>
          </Link>
          <button 
            className="mobile-close-btn"
            onClick={() => setIsMobileOpen(false)}
            style={{ background: 'none', border: 'none', color: '#6b7280', cursor: 'pointer', padding: 4 }}
          >
            <X size={24} />
          </button>
        </div>

        {/* Menu */}
        <div style={{ fontSize: 12, fontWeight: 600, color: "#9ca3af", marginBottom: 12, padding: "0 12px", letterSpacing: "1px" }}>MENU</div>
        <nav style={{ display: "flex", flexDirection: "column", gap: 6, flex: 1 }}>
          {links.map((link) => {
            const isActive = location.pathname === link.path || location.pathname.startsWith(link.path + '/');
            return (
              <Link
                key={link.label}
                to={link.path}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "12px 16px",
                  borderRadius: 12,
                  textDecoration: "none",
                  fontWeight: 600,
                  fontSize: 14,
                  color: isActive ? "#1e3a8a" : "#4b5563",
                  backgroundColor: isActive ? "#eff6ff" : "transparent",
                  transition: "all 0.2s"
                }}
                onMouseEnter={(e) => {
                  if (!isActive) e.currentTarget.style.backgroundColor = "#f3f4f6";
                }}
                onMouseLeave={(e) => {
                  if (!isActive) e.currentTarget.style.backgroundColor = "transparent";
                }}
              >
                <div style={{ color: isActive ? "#2563eb" : "#6b7280", display: "flex" }}>
                  {link.icon}
                </div>
                {link.label}
              </Link>
            )
          })}
        </nav>

        {/* Sign Out */}
        <button 
          onClick={handleSignOut}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "12px 16px",
            borderRadius: 12,
            border: "none",
            backgroundColor: "transparent",
            color: "#ef4444",
            fontWeight: 600,
            fontSize: 14,
            cursor: "pointer",
            transition: "background 0.2s",
            textAlign: "left"
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#fef2f2"}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
        >
          <LogOut size={20} />
          Sign Out
        </button>
      </aside>

      {/* Main Content Area */}
      <main style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", position: "relative" }}>
        {/* Top Header */}
        <header className="header-nav" style={{ 
          height: 72, 
          borderBottom: "1px solid #e5e7eb", 
          backgroundColor: "white",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 40px",
          flexShrink: 0
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <button 
              className="mobile-menu-btn" 
              style={{ display: 'none', background: 'none', border: 'none', color: '#4b5563', cursor: 'pointer', padding: 4 }} 
              onClick={() => setIsMobileOpen(true)}
            >
              <Menu size={24} />
            </button>
            <h2 className="header-title" style={{ margin: 0, fontSize: 20, fontWeight: 700, color: "#1f2937", fontFamily: "'Sora', sans-serif" }}>
              Overview
            </h2>
          </div>
          
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div className="header-profile-text" style={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
              <span style={{ fontSize: 14, fontWeight: 600, color: "#1f2937", lineHeight: 1.2 }}>
                {auth.fullName || auth.email || "User"}
              </span>
              <span style={{ fontSize: 12, color: "#6b7280", marginTop: 2 }}>
                {role === "STUDENT" ? "Student" : "Company"}
              </span>
            </div>
            <div style={{
              width: 40,
              height: 40,
              borderRadius: "50%",
              backgroundColor: role === "COMPANY" ? "#0d9488" : "#1e3a8a",
              color: "white",
              display: "grid",
              placeItems: "center",
              fontWeight: 700,
              fontSize: 16,
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
              flexShrink: 0
            }}>
              {(auth.fullName || auth.email || "U")[0].toUpperCase()}
            </div>
          </div>
        </header>

        {/* Scrollable Content */}
        <div style={{ flex: 1, overflowY: "auto", overflowX: "hidden" }}>
          {children}
        </div>
      </main>

      {/* Global CSS for Dashboard Responsiveness */}
      <style>{`
        .mobile-close-btn { display: none !important; }
        
        @media (max-width: 1024px) {
          .header-nav { padding: 0 24px !important; }
        }

        @media (max-width: 768px) {
          .dashboard-sidebar {
            position: fixed;
            top: 0;
            left: 0;
            height: 100vh;
            z-index: 50;
            transform: translateX(-100%);
            transition: transform 0.3s ease;
          }
          .dashboard-sidebar.open {
            transform: translateX(0);
          }
          .sidebar-overlay {
            position: fixed;
            inset: 0;
            background: rgba(15, 23, 42, 0.4);
            backdrop-filter: blur(2px);
            z-index: 40;
            opacity: 0;
            pointer-events: none;
            transition: opacity 0.3s ease;
          }
          .sidebar-overlay.open {
            opacity: 1;
            pointer-events: auto;
          }
          .mobile-menu-btn { display: flex !important; }
          .mobile-close-btn { display: block !important; }
          .header-nav { padding: 0 20px !important; }
        }

        @media (max-width: 480px) {
          .header-profile-text { display: none !important; }
          .header-title { display: none !important; }
        }
      `}</style>
    </div>
  );
}