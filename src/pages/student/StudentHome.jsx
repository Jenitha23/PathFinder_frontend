/**
 * File: src/pages/student/StudentHome.jsx
 * Purpose: Student-facing page for authentication and workflow.
 */
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { clearAuth, getAuth, saveAuth } from "../../services/auth";
import { studentProfileApi } from "../../services/profile";
import { localApplications, applicationsApi, localSavedJobs } from "../../services/applications";

import { User, FileText, Search, ClipboardList, Briefcase, Bookmark, TrendingUp, Sparkles } from "lucide-react";

// Real data only — zeros are honest placeholders until API is connected
const DASHBOARD_ACTIONS = [
  {
    icon: <User size={24} />,
    title: "Complete your profile",
    desc: "Add your skills, education, CV, and job preferences so companies can find you.",
    action: "Edit Profile",
    to: "/student/profile",
  },
  {
    icon: <FileText size={24} />,
    title: "Upload your CV",
    desc: "Attach a PDF or DOC resume so recruiters can review your qualifications easily.",
    action: "Update Profile",
    to: "/student/profile",
  },
  {
    icon: <Search size={24} />,
    title: "Browse job listings",
    desc: "Search and filter available internship and job opportunities on the platform.",
    action: "Browse Jobs",
    to: "/student/jobs",
  },
  {
    icon: <ClipboardList size={24} />,
    title: "Track your applications",
    desc: "View status updates on all your submitted applications — Pending, Shortlisted, Accepted or Rejected.",
    action: "My Applications",
    to: "/student/applications",
  },
];

// Renders the StudentHome component.
export default function StudentHome() {
  const nav = useNavigate();
  const auth = getAuth();
  const [profile, setProfile] = useState({
    fullName: auth.fullName || "",
    email: auth.email || "",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({
    fullName: auth.fullName || "",
    email: auth.email || "",
  });
  const [formErrors, setFormErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [appliedCount, setAppliedCount] = useState(0);
  const [savedCount, setSavedCount] = useState(() => localSavedJobs.getAll().length);
  const [isCountLoading, setIsCountLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [applicationsCount, setApplicationsCount] = useState("—");
  const firstName = profile.fullName ? profile.fullName.split(" ")[0] : "Student";

  const getErrorMessage = (err, fallback) => {
    const data = err?.response?.data;
    if (typeof data === "string") return data;
    return data?.message || data?.error || fallback;
  };

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const { data } = await studentProfileApi.getMe();
        const nextFullName = data?.fullName || data?.name || "";
        const nextEmail = data?.email || "";

        setProfile({
          fullName: nextFullName,
          email: nextEmail,
        });
        setForm({
          fullName: nextFullName,
          email: nextEmail,
        });

        saveAuth({
          token: auth.token,
          role: auth.role,
          userId: auth.userId,
          fullName: nextFullName,
          email: nextEmail,
        });

        // Fetch application count from database
        try {
          const statsRes = await applicationsApi.getApplicationCount();
          setApplicationsCount(statsRes.data.count.toString());
        } catch (statsErr) {
          // Fallback if backend doesn't have the endpoint yet
          setApplicationsCount(localApplications.getAll().length.toString());
        }

      } catch (err) {
        setError(getErrorMessage(err, "Failed to load profile."));
      }
    };

    loadProfile();
  }, []);

  const validateForm = () => {
    const next = {};
    if (!form.fullName.trim()) next.fullName = "Full name is required.";
    if (!form.email.trim()) next.email = "Email is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) next.email = "Enter a valid email.";
    setFormErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleEditProfile = () => {
    setMessage("");
    setError("");
    setFormErrors({});
    setForm({
      fullName: profile.fullName || "",
      email: profile.email || "",
    });
    setIsEditing(true);
  };

  const handleSaveProfile = async () => {
    if (!validateForm()) return;
    setSaving(true);
    setMessage("");
    setError("");
    try {
      await studentProfileApi.updateBasicProfile({
        fullName: form.fullName.trim(),
        email: form.email.trim(),
      });

      const updated = { fullName: form.fullName.trim(), email: form.email.trim() };
      setProfile(updated);
      saveAuth({
        token: auth.token,
        role: auth.role,
        userId: auth.userId,
        fullName: updated.fullName,
        email: updated.email,
      });
      setIsEditing(false);
      setMessage("Profile updated successfully.");
    } catch (err) {
      const status = err?.response?.status;
      const fallback = status === 400 || status === 409 ? "Profile update failed." : "Failed to update profile.";
      setError(getErrorMessage(err, fallback));
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setFormErrors({});
    setError("");
    setMessage("");
    setForm({
      fullName: profile.fullName || "",
      email: profile.email || "",
    });
  };

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm("Delete your account permanently?");
    if (!confirmed) return;

    try {
      await studentProfileApi.deleteAccount();
      clearAuth();
      sessionStorage.clear();
      localStorage.clear();
      nav("/student/login", { replace: true });
    } catch (err) {
      setError(getErrorMessage(err, "Failed to delete account."));
    }
  };

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  };

  const stats = [
    { label: "Total Applications", value: applicationsCount, icon: <Briefcase size={20} />, color: "#4f46e5", bg: "#e0e7ff", to: "/student/applications" },
    { label: "Saved Listings", value: savedCount.toString(), icon: <Bookmark size={20} />, color: "#d97706", bg: "#fef3c7", to: "/student/saved-jobs" },
    { label: "Profile Views", value: "—", icon: <TrendingUp size={20} />, color: "#dc2626", bg: "#fee2e2" },
  ];

  return (
    <div
      className="student-home-page"
      style={{ padding: "32px 40px" }}
    >
      <style>
        {`
          @keyframes sparkleAnim {
            0%, 100% { transform: scale(1) rotate(0deg); opacity: 0.8; }
            50% { transform: scale(1.15) rotate(15deg); opacity: 1; }
          }
        `}
      </style>
      <div className="container" style={{ width: "100%", margin: "0 auto" }}>
        {/* Welcome Banner */}
        <div
          className="student-home-hero"
          style={{
            background: "linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)",
            borderRadius: "16px",
            padding: "40px 40px",
            position: "relative",
            overflow: "hidden",
            marginBottom: "32px",
            boxShadow: "0 10px 25px -5px rgba(37, 99, 235, 0.3)"
          }}
        >
          {/* Decorative Elements */}
          <div
            style={{
              position: "absolute",
              top: "-50px",
              right: "10%",
              width: "300px",
              height: "300px",
              borderRadius: "50%",
              background: "rgba(255,255,255,0.05)",
            }}
          />
          <div
            style={{
              position: "absolute",
              bottom: "-100px",
              right: "-50px",
              width: "400px",
              height: "400px",
              borderRadius: "50%",
              background: "rgba(255,255,255,0.08)",
            }}
          />

          <div style={{ position: "relative", zIndex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 600, letterSpacing: "1px", color: "rgba(255,255,255,0.8)", marginBottom: 8, textTransform: "uppercase" }}>
              Welcome Back
            </div>
            <h1
              style={{
                fontFamily: "'Sora', sans-serif",
                fontSize: 42,
                fontWeight: 800,
                color: "white",
                marginBottom: 12,
                display: "flex",
                alignItems: "center",
                gap: 12
              }}
            >
              {profile.fullName || profile.email} <Sparkles size={36} color="#fbbf24" style={{ animation: "sparkleAnim 2s infinite" }} />
            </h1>
            <p style={{ fontSize: 16, color: "rgba(255,255,255,0.85)", margin: 0 }}>
              Here's what's happening with your career journey today.
            </p>
          </div>
        </div>
        {/* Stats Grid */}
        <div
          className="student-stats-grid"
          style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24, marginBottom: 40 }}
        >
          {stats.map((s, i) => {
            const Wrapper = s.to ? Link : "div";
            const wrapperProps = s.to ? { to: s.to } : {};
            return (
              <Wrapper
                key={i}
                {...wrapperProps}
                className="card animate-fade-up"
                style={{
                  padding: "24px",
                  background: "white",
                  borderRadius: "16px",
                  border: "none",
                  boxShadow: "0 4px 15px rgba(0,0,0,0.03)",
                  animationDelay: `${i * 0.08}s`,
                  textDecoration: "none",
                  color: "inherit",
                  display: "flex",
                  flexDirection: "column",
                  position: "relative",
                  overflow: "hidden",
                  transition: "transform 0.2s, box-shadow 0.2s",
                  cursor: s.to ? "pointer" : "default",
                }}
                onMouseEnter={s.to ? (e) => {
                  e.currentTarget.style.boxShadow = "0 10px 25px rgba(0,0,0,0.08)";
                  e.currentTarget.style.transform = "translateY(-4px)";
                } : undefined}
                onMouseLeave={s.to ? (e) => {
                  e.currentTarget.style.boxShadow = "0 4px 15px rgba(0,0,0,0.03)";
                  e.currentTarget.style.transform = "translateY(0)";
                } : undefined}
              >
                {/* Decorative corner shape */}
                <div style={{
                  position: "absolute",
                  top: "-20px",
                  right: "-20px",
                  width: "100px",
                  height: "100px",
                  borderRadius: "50%",
                  background: s.bg,
                  opacity: 0.5,
                  zIndex: 0
                }} />

                <div style={{ display: "flex", flexDirection: "column", zIndex: 1 }}>
                  <div
                    style={{
                      width: 42,
                      height: 42,
                      borderRadius: 10,
                      background: "white",
                      border: "1px solid #eee",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 18,
                      marginBottom: 20,
                      color: s.color,
                      boxShadow: "0 2px 5px rgba(0,0,0,0.02)"
                    }}
                  >
                    {s.icon}
                  </div>
                  <div
                    style={{
                      fontWeight: 800,
                      fontSize: 32,
                      color: "#1f2937",
                      fontFamily: "'Sora', sans-serif",
                      lineHeight: 1
                    }}
                  >
                    {s.value}
                  </div>
                  <div style={{ fontSize: 14, color: "#6b7280", marginTop: 8, fontWeight: 500 }}>
                    {s.label}
                  </div>
                </div>
              </Wrapper>
            );
          })}
        </div>

        <div className="student-main-grid" style={{ display: "grid", gridTemplateColumns: "1.8fr 1fr", gap: 24 }}>
          {/* Recommended Next Steps */}
          <div>
            <div
              style={{
                fontWeight: 700,
                fontSize: 18,
                marginBottom: 20,
                color: "#1f2937",
                fontFamily: "'Sora', sans-serif",
              }}
            >
              Recommended Next Steps
            </div>
            <div style={{ display: "grid", gap: 16 }}>
              {DASHBOARD_ACTIONS.map((step, i) => (
                <div
                  key={i}
                  className="card animate-fade-up"
                  style={{
                    padding: "24px",
                    background: "white",
                    borderRadius: "16px",
                    border: "none",
                    boxShadow: "0 4px 15px rgba(0,0,0,0.03)",
                    display: "flex",
                    gap: 20,
                    alignItems: "center",
                    animationDelay: `${0.2 + i * 0.1}s`,
                  }}
                >
                  <div
                    style={{
                      width: 52,
                      height: 52,
                      borderRadius: 12,
                      background: "#f0f9ff",
                      color: "#0ea5e9",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 22,
                      flexShrink: 0,
                    }}
                  >
                    {step.icon}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 16, color: "#1f2937", marginBottom: 4 }}>{step.title}</div>
                    <p style={{ margin: 0, color: "#6b7280", fontSize: 14, lineHeight: 1.5 }}>
                      {step.desc}
                    </p>
                  </div>
                  <div style={{ flexShrink: 0 }}>
                    <Link
                      to={step.to}
                      style={{
                        display: "inline-block",
                        padding: "8px 16px",
                        fontSize: 13,
                        fontWeight: 600,
                        color: "#4b5563",
                        background: "white",
                        border: "1px solid #e5e7eb",
                        borderRadius: "8px",
                        textDecoration: "none",
                        transition: "all 0.2s"
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = "#c1c8d1";
                        e.currentTarget.style.background = "#f9fafb";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = "#e5e7eb";
                        e.currentTarget.style.background = "white";
                      }}
                    >
                      {step.action} &rarr;
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Basic Info & Quick Links */}
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            {/* Basic Info Card */}
            <div className="card animate-fade-up" style={{
              padding: "24px",
              background: "white",
              borderRadius: "16px",
              border: "none",
              boxShadow: "0 4px 15px rgba(0,0,0,0.03)",
              animationDelay: "0.3s"
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                <div style={{ fontWeight: 700, fontSize: 16, color: "#1f2937", fontFamily: "'Sora', sans-serif" }}>
                  Basic Info
                </div>
                <span style={{
                  background: "#e0e7ff",
                  color: "#4338ca",
                  fontSize: 12,
                  fontWeight: 600,
                  padding: "4px 10px",
                  borderRadius: "12px"
                }}>
                  Student
                </span>
              </div>
              <div style={{ marginBottom: 24 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                  <span style={{ fontSize: 15, fontWeight: 600 }}>Profile strength</span>
                  <span style={{ fontSize: 13, color: "var(--muted)", fontWeight: 500 }}>Incomplete</span>
                </div>
                <div
                  style={{
                    height: 8,
                    background: "var(--bg)",
                    borderRadius: 999,
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      height: "100%",
                      width: "15%",
                      background: "linear-gradient(90deg, var(--primary), var(--teal))",
                      borderRadius: 999,
                      transition: "width 1s ease",
                    }}
                  />
                </div>
                <p className="helper" style={{ marginTop: 8, fontSize: 13 }}>
                  Add your skills, education, and CV to strengthen your profile.
                </p>
              </div>

              <hr className="divider" style={{ margin: "0 0 20px" }} />

              {message ? <div className="alert success" style={{ marginBottom: 12 }}>{message}</div> : null}
              {error ? <div className="alert error" style={{ marginBottom: 12 }}>{error}</div> : null}

              {isEditing ? (
                <div style={{ display: "grid", gap: 12, marginTop: 16 }}>
                  <div>
                    <label className="label" htmlFor="student-fullname" style={{ fontSize: 12, color: "#6b7280" }}>Full Name</label>
                    <input
                      id="student-fullname"
                      className="input"
                      style={{ padding: "10px 14px", borderRadius: "8px", border: "1px solid #e5e7eb" }}
                      value={form.fullName}
                      onChange={(e) => {
                        setForm((prev) => ({ ...prev, fullName: e.target.value }));
                        setFormErrors((prev) => ({ ...prev, fullName: "" }));
                      }}
                    />
                    {formErrors.fullName ? (
                      <div className="helper" style={{ color: "var(--danger)", marginTop: 6 }}>
                        {formErrors.fullName}
                      </div>
                    ) : null}
                  </div>
                  <div>
                    <label className="label" htmlFor="student-email" style={{ fontSize: 12, color: "#6b7280" }}>Email Address</label>
                    <input
                      id="student-email"
                      className="input"
                      type="email"
                      style={{ padding: "10px 14px", borderRadius: "8px", border: "1px solid #e5e7eb" }}
                      value={form.email}
                      onChange={(e) => {
                        setForm((prev) => ({ ...prev, email: e.target.value }));
                        setFormErrors((prev) => ({ ...prev, email: "" }));
                      }}
                    />
                    {formErrors.email ? (
                      <div className="helper" style={{ color: "var(--danger)", marginTop: 6 }}>
                        {formErrors.email}
                      </div>
                    ) : null}
                  </div>
                  <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
                    <button
                      style={{
                        flex: 1,
                        background: "#1e3a8a",
                        color: "white",
                        border: "none",
                        padding: "10px",
                        borderRadius: "8px",
                        fontWeight: 600,
                        cursor: "pointer"
                      }}
                      onClick={handleSaveProfile}
                      disabled={saving}
                    >
                      {saving ? "Saving..." : "Save"}
                    </button>
                    <button
                      style={{
                        flex: 1,
                        background: "white",
                        color: "#4b5563",
                        border: "1px solid #e5e7eb",
                        padding: "10px",
                        borderRadius: "8px",
                        fontWeight: 600,
                        cursor: "pointer"
                      }}
                      onClick={handleCancelEdit}
                      disabled={saving}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div style={{ display: "grid", gap: 20 }}>
                  <div>
                    <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 4 }}>Full Name</div>
                    <div style={{ fontSize: 15, color: "#1f2937", fontWeight: 600 }}>{profile.fullName || "—"}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 4 }}>Email Address</div>
                    <div style={{ fontSize: 15, color: "#1f2937", fontWeight: 600 }}>{profile.email || "—"}</div>
                  </div>

                  <div style={{ display: "grid", gap: 12, marginTop: 8 }}>
                    <button
                      style={{
                        width: "100%",
                        padding: "12px",
                        background: "white",
                        border: "1px solid #e5e7eb",
                        borderRadius: "24px",
                        color: "#4b5563",
                        fontWeight: 600,
                        fontSize: 14,
                        cursor: "pointer",
                        transition: "all 0.2s"
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = "#c1c8d1";
                        e.currentTarget.style.background = "#f9fafb";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = "#e5e7eb";
                        e.currentTarget.style.background = "white";
                      }}
                      onClick={handleEditProfile}
                    >
                      Edit Basic Info
                    </button>
                    <Link
                      to="/student/profile"
                      style={{
                        width: "100%",
                        padding: "12px",
                        background: "#1e3a8a",
                        border: "none",
                        borderRadius: "24px",
                        color: "white",
                        fontWeight: 600,
                        fontSize: 14,
                        textAlign: "center",
                        textDecoration: "none",
                        display: "block",
                        transition: "background 0.2s"
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = "#172554"}
                      onMouseLeave={(e) => e.currentTarget.style.background = "#1e3a8a"}
                    >
                      Complete Full Profile
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Links Card */}
            <div className="card animate-fade-up" style={{
              padding: "24px",
              background: "white",
              borderRadius: "16px",
              border: "1px solid #e5e7eb",
              boxShadow: "0 4px 15px rgba(0,0,0,0.03)",
              animationDelay: "0.4s"
            }}>
              <div style={{ fontWeight: 700, fontSize: 16, color: "#1f2937", fontFamily: "'Sora', sans-serif", marginBottom: 16 }}>
                Quick Links
              </div>
              <div style={{ display: "grid", gap: 8 }}>
                {[
                  { label: "Update Profile", icon: <User size={16} />, to: "/student/profile" },
                  { label: "Upload CV", icon: <FileText size={16} />, to: "/student/profile" },
                  { label: "Browse Jobs", icon: <Briefcase size={16} />, to: "/student/jobs" },
                  { label: "Saved Jobs", icon: <Bookmark size={16} />, to: "/student/saved-jobs" },
                ].map((l) => (
                  <Link
                    key={l.label}
                    to={l.to}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      padding: "14px 16px",
                      borderRadius: "12px",
                      background: "#f9fafb",
                      border: "1px solid transparent",
                      fontSize: 14,
                      fontWeight: 600,
                      color: "#4b5563",
                      textDecoration: "none",
                      transition: "all 0.2s",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "white";
                      e.currentTarget.style.borderColor = "#e5e7eb";
                      e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.04)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "#f9fafb";
                      e.currentTarget.style.borderColor = "transparent";
                      e.currentTarget.style.boxShadow = "none";
                    }}
                  >
                    <span style={{ marginRight: 12 }}>{l.icon}</span>
                    {l.label}
                    <span style={{ marginLeft: "auto", color: "#9ca3af" }}>›</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}