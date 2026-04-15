/**
 * File: src/pages/company/CompanyDashboard.jsx
 * Purpose: Company dashboard with AI applicant ranking integration
 */
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { clearAuth, getAuth, saveAuth } from "../../services/auth";
import { companyProfileApi } from "../../services/profile";
import companyJobService from "../../services/companyjobService";
import { Briefcase, GraduationCap, Users, Sparkles, Plus, ClipboardList, TrendingUp, Brain, Award } from "lucide-react";

const COMPANY_ACTIONS = [
  {
    icon: <Briefcase size={24} />,
    title: "Create a job post",
    desc: "Add title, skills, and role details to prepare your next opening.",
    action: "Create Job Post",
    link: "/company/post-job",
  },
  {
    icon: <GraduationCap size={24} />,
    title: "Create an internship post",
    desc: "Publish internship opportunities and define candidate requirements.",
    action: "Create Internship Post",
    link: "/company/post-job",
  },
  {
    icon: <Users size={24} />,
    title: "Review applicants",
    desc: "Check candidate lists and update statuses from one place.",
    action: "View Applicants",
    link: "/company/applicants",
  },
];

// Renders the CompanyDashboard component.
export default function CompanyDashboard() {
  const nav = useNavigate();
  const auth = getAuth();
  const [profile, setProfile] = useState({
    companyName: auth.fullName || "",
    email: auth.email || "",
    description: "",
    industry: "",
    website: "",
    location: "",
    phone: "",
    logoUrl: null,
  });
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({
    companyName: auth.fullName || "",
    email: auth.email || "",
    description: "",
    industry: "",
    website: "",
    location: "",
    phone: "",
  });
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [removeLogo, setRemoveLogo] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // Job stats state
  const [jobStats, setJobStats] = useState({
    activeJobs: 0,
    activeInternships: 0,
    totalApplicants: 0,
    loading: true
  });

  const name = profile.companyName || profile.email || "Company";

  const getErrorMessage = (err, fallback) => {
    const data = err?.response?.data;
    if (typeof data === "string") return data;
    return data?.message || data?.error || fallback;
  };

  // Load company profile
  useEffect(() => {
    const loadProfile = async () => {
      try {
        // Try to get full profile first
        let data;
        try {
          const response = await companyProfileApi.getProfile();
          data = response.data;
        } catch (err) {
          // Fallback to /me endpoint if full profile fails
          const response = await companyProfileApi.getMe();
          data = response.data;
        }

        const nextCompanyName = data?.companyName || data?.fullName || data?.name || "";
        const nextEmail = data?.email || "";

        setProfile({
          companyName: nextCompanyName,
          email: nextEmail,
          description: data?.description || "",
          industry: data?.industry || "",
          website: data?.website || "",
          location: data?.location || "",
          phone: data?.phone || "",
          logoUrl: data?.logoUrl || null,
        });
        setForm({
          companyName: nextCompanyName,
          email: nextEmail,
          description: data?.description || "",
          industry: data?.industry || "",
          website: data?.website || "",
          location: data?.location || "",
          phone: data?.phone || "",
        });

        if (data?.logoUrl) {
          setLogoPreview(data.logoUrl);
        }

        saveAuth({
          token: auth.token,
          role: auth.role,
          userId: auth.userId,
          fullName: nextCompanyName,
          email: nextEmail,
        });
      } catch (err) {
        setError(getErrorMessage(err, "Failed to load company profile."));
      }
    };

    loadProfile();
  }, []);

  // Load job statistics
  useEffect(() => {
    const loadJobStats = async () => {
      try {
        const { data } = await companyJobService.getJobStats();
        setJobStats({
          activeJobs: data.activeJobs || 0,
          activeInternships: data.activeInternships || 0,
          totalApplicants: data.totalApplicants || 0,
          loading: false
        });
      } catch (err) {
        console.error("Failed to load job stats:", err);
        setJobStats(prev => ({ ...prev, loading: false }));
      }
    };

    loadJobStats();
  }, []);

  const validateForm = () => {
    const next = {};
    if (!form.companyName.trim()) next.companyName = "Company name is required.";
    if (!form.email.trim()) next.email = "Email is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) next.email = "Enter a valid email.";
    if (form.website && !/^https?:\/\//.test(form.website)) {
      next.website = "Enter a valid URL (http:// or https://)";
    }
    setFormErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleEditProfile = () => {
    setMessage("");
    setError("");
    setFormErrors({});
    setForm({
      companyName: profile.companyName || "",
      email: profile.email || "",
      description: profile.description || "",
      industry: profile.industry || "",
      website: profile.website || "",
      location: profile.location || "",
      phone: profile.phone || "",
    });
    setLogoFile(null);
    setLogoPreview(profile.logoUrl || null);
    setRemoveLogo(false);
    setIsEditing(true);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/svg+xml", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      alert("Invalid file type. Allowed: JPG, PNG, GIF, SVG, WEBP.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("File is too large. Max size is 5MB.");
      return;
    }

    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
    setRemoveLogo(false);
  };

  const handleRemoveLogoClick = () => {
    setLogoFile(null);
    setLogoPreview(null);
    setRemoveLogo(true);
  };

  const handleSaveProfile = async () => {
    if (!validateForm()) return;
    setSaving(true);
    setMessage("");
    setError("");
    try {
      const formData = new FormData();
      formData.append("CompanyName", form.companyName.trim());
      formData.append("Email", form.email.trim().toLowerCase());
      if (form.description) formData.append("Description", form.description.trim());
      if (form.industry) formData.append("Industry", form.industry.trim());
      if (form.website) formData.append("Website", form.website.trim());
      if (form.location) formData.append("Location", form.location.trim());
      if (form.phone) formData.append("Phone", form.phone.trim());
      formData.append("RemoveLogo", removeLogo);

      if (logoFile) {
        formData.append("LogoFile", logoFile);
      }

      const { data } = await companyProfileApi.updateProfileWithLogo(formData);

      const updated = data.profile;
      setProfile({
        companyName: updated.companyName,
        email: updated.email,
        description: updated.description || "",
        industry: updated.industry || "",
        website: updated.website || "",
        location: updated.location || "",
        phone: updated.phone || "",
        logoUrl: updated.logoUrl || null,
      });
      setLogoPreview(updated.logoUrl || null);

      saveAuth({
        token: auth.token,
        role: auth.role,
        userId: auth.userId,
        fullName: updated.companyName,
        email: updated.email,
      });
      setIsEditing(false);
      setMessage("Company profile updated successfully.");
    } catch (err) {
      const status = err?.response?.status;
      const fallback = status === 400 || status === 409 ? "Profile update failed." : "Failed to update company profile.";
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
    setLogoFile(null);
    setLogoPreview(profile.logoUrl || null);
    setRemoveLogo(false);
    setForm({
      companyName: profile.companyName || "",
      email: profile.email || "",
      description: profile.description || "",
      industry: profile.industry || "",
      website: profile.website || "",
      location: profile.location || "",
      phone: profile.phone || "",
    });
  };

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm("Delete your company account permanently?");
    if (!confirmed) return;

    try {
      await companyProfileApi.deleteAccount();
      clearAuth();
      sessionStorage.clear();
      localStorage.clear();
      nav("/company/login", { replace: true });
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

  const handleActionClick = (link) => {
    if (link) {
      nav(link);
    }
  };

  return (
    <div style={{ padding: "32px 40px" }}>
      <div className="container" style={{ width: "100%", margin: "0 auto" }}>
        {/* Welcome Banner */}
        <div
          className="company-home-hero"
          style={{
            background: "linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%)",
            borderRadius: "16px",
            padding: "40px",
            position: "relative",
            overflow: "hidden",
            marginBottom: "32px",
            boxShadow: "0 10px 25px -5px rgba(15, 23, 42, 0.3)"
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

          <div style={{ position: "relative", zIndex: 1, display: "flex", alignItems: "center", gap: 24, flexWrap: "wrap" }}>
            {profile.logoUrl ? (
              <img
                src={profile.logoUrl}
                alt={name}
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: 16,
                  objectFit: "cover",
                  background: "white",
                  padding: "4px",
                  boxShadow: "0 4px 15px rgba(0,0,0,0.1)"
                }}
                onError={(e) => {
                  e.target.style.display = 'none';
                  const parent = e.target.parentElement;
                  const fallback = document.createElement('div');
                  fallback.style.cssText = `
                    width: 80px;
                    height: 80px;
                    border-radius: 16px;
                    background: white;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: 800;
                    font-size: 32px;
                    color: #0f172a;
                    font-family: 'Sora', sans-serif;
                    box-shadow: 0 4px 15px rgba(0,0,0,0.1);
                  `;
                  fallback.textContent = name[0].toUpperCase();
                  parent.appendChild(fallback);
                }}
              />
            ) : (
              <div
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: 16,
                  background: "white",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 800,
                  fontSize: 32,
                  color: "#0f172a",
                  fontFamily: "'Sora', sans-serif",
                  flexShrink: 0,
                  boxShadow: "0 4px 15px rgba(0,0,0,0.1)"
                }}
              >
                {name[0].toUpperCase()}
              </div>
            )}

            <div>
              <div style={{ fontSize: 13, fontWeight: 600, letterSpacing: "1px", color: "rgba(255,255,255,0.8)", marginBottom: 8, textTransform: "uppercase" }}>
                {getGreeting()}
              </div>
              <h1 style={{ fontFamily: "'Sora', sans-serif", fontSize: 42, fontWeight: 800, color: "white", margin: 0, display: "flex", alignItems: "center", gap: 12 }}>
                {name} <Sparkles size={36} color="#fbbf24" style={{ animation: "sparkleAnim 2s infinite" }} />
              </h1>
              <div style={{ display: "flex", gap: 10, marginTop: 12, flexWrap: "wrap" }}>
                <span
                  style={{
                    background: "rgba(255,255,255,0.15)",
                    color: "white",
                    fontSize: 13,
                    fontWeight: 600,
                    padding: "6px 14px",
                    borderRadius: "20px",
                  }}
                >
                  🏢 Company Account
                </span>
                {profile.industry && (
                  <span
                    style={{
                      background: "rgba(255,255,255,0.1)",
                      color: "rgba(255,255,255,0.9)",
                      fontSize: 13,
                      fontWeight: 500,
                      padding: "6px 14px",
                      borderRadius: "20px",
                    }}
                  >
                    {profile.industry}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* Stats Grid */}
        <div
          className="company-stats-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 24,
            marginBottom: 40,
          }}
        >
          {/* Active Job Posts Card */}
          <div className="card animate-fade-up" style={{
            padding: "24px",
            background: "white",
            borderRadius: "16px",
            border: "none",
            boxShadow: "0 4px 15px rgba(0,0,0,0.03)",
            animationDelay: "0s",
            position: "relative",
            overflow: "hidden"
          }}>
            <div style={{
              position: "absolute", top: "-20px", right: "-20px", width: "100px", height: "100px", borderRadius: "50%", background: "#f0fdfa", opacity: 0.5, zIndex: 0
            }} />
            <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column" }}>
              <div
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: 10,
                  background: "white",
                  border: "1px solid #ccfbf1",
                  color: "#0d9488",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 16,
                  fontWeight: 700,
                  marginBottom: 20,
                  boxShadow: "0 2px 5px rgba(0,0,0,0.02)"
                }}
              >
                <Briefcase size={20} />
              </div>
              <div style={{ fontWeight: 800, fontSize: 32, color: "#1f2937", fontFamily: "'Sora', sans-serif", lineHeight: 1 }}>
                {jobStats.loading ? "..." : jobStats.activeJobs}
              </div>
              <div style={{ fontSize: 14, color: "#6b7280", marginTop: 8, fontWeight: 500 }}>Active Job Posts</div>
              <Link
                to="/company/jobs"
                style={{ fontSize: 12, color: "#0d9488", marginTop: 8, fontWeight: 600, textDecoration: "none" }}
              >
                View all &rarr;
              </Link>
            </div>
          </div>

          {/* Active Internships Card */}
          <div className="card animate-fade-up" style={{
            padding: "24px",
            background: "white",
            borderRadius: "16px",
            border: "none",
            boxShadow: "0 4px 15px rgba(0,0,0,0.03)",
            animationDelay: "0.08s",
            position: "relative",
            overflow: "hidden"
          }}>
            <div style={{
              position: "absolute", top: "-20px", right: "-20px", width: "100px", height: "100px", borderRadius: "50%", background: "#fffbeb", opacity: 0.5, zIndex: 0
            }} />
            <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column" }}>
              <div
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: 10,
                  background: "white",
                  border: "1px solid #fef3c7",
                  color: "#d97706",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 16,
                  fontWeight: 700,
                  marginBottom: 20,
                  boxShadow: "0 2px 5px rgba(0,0,0,0.02)"
                }}
              >
                <GraduationCap size={20} />
              </div>
              <div style={{ fontWeight: 800, fontSize: 32, color: "#1f2937", fontFamily: "'Sora', sans-serif", lineHeight: 1 }}>
                {jobStats.loading ? "..." : jobStats.activeInternships}
              </div>
              <div style={{ fontSize: 14, color: "#6b7280", marginTop: 8, fontWeight: 500 }}>Active Internships</div>
              <Link
                to="/company/jobs"
                style={{ fontSize: 12, color: "#d97706", marginTop: 8, fontWeight: 600, textDecoration: "none" }}
              >
                View all &rarr;
              </Link>
            </div>
          </div>

          {/* Total Applicants Card */}
          <div className="card animate-fade-up" style={{
            padding: "24px",
            background: "white",
            borderRadius: "16px",
            border: "none",
            boxShadow: "0 4px 15px rgba(0,0,0,0.03)",
            animationDelay: "0.16s",
            position: "relative",
            overflow: "hidden"
          }}>
            <div style={{
              position: "absolute", top: "-20px", right: "-20px", width: "100px", height: "100px", borderRadius: "50%", background: "#fef2f2", opacity: 0.5, zIndex: 0
            }} />
            <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column" }}>
              <div
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: 10,
                  background: "white",
                  border: "1px solid #fee2e2",
                  color: "#dc2626",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 16,
                  fontWeight: 700,
                  marginBottom: 20,
                  boxShadow: "0 2px 5px rgba(0,0,0,0.02)"
                }}
              >
                <Users size={20} />
              </div>
              <div style={{ fontWeight: 800, fontSize: 32, color: "#1f2937", fontFamily: "'Sora', sans-serif", lineHeight: 1 }}>
                {jobStats.loading ? "..." : jobStats.totalApplicants}
              </div>
              <div style={{ fontSize: 14, color: "#6b7280", marginTop: 8, fontWeight: 500 }}>Total Applicants</div>
              <Link
                to="/company/applicants"
                style={{ fontSize: 12, color: "#dc2626", marginTop: 8, fontWeight: 600, textDecoration: "none" }}
              >
                Review &rarr;
              </Link>
            </div>
          </div>
        </div>

        <div className="company-main-grid" style={{ display: "grid", gridTemplateColumns: "1.8fr 1fr", gap: 24 }}>
          {/* Company Actions */}
          <div>
            <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 20, color: "#1f2937", fontFamily: "'Sora', sans-serif" }}>
              Company Actions
            </div>
            <div style={{ display: "grid", gap: 16 }}>
              {COMPANY_ACTIONS.map((step, i) => (
                <div
                  key={step.title}
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
                    cursor: step.link ? "pointer" : "default",
                    transition: "all 0.2s",
                  }}
                  onClick={() => step.link && handleActionClick(step.link)}
                  onMouseEnter={(e) => {
                    if (step.link) {
                      e.currentTarget.style.transform = "translateY(-2px)";
                      e.currentTarget.style.boxShadow = "0 8px 20px rgba(0,0,0,0.06)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "0 4px 15px rgba(0,0,0,0.03)";
                  }}
                >
                  <div
                    style={{
                      width: 52,
                      height: 52,
                      borderRadius: 12,
                      background: "#f0fdfa",
                      color: "#0d9488",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 16,
                      fontWeight: 700,
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
                    <button
                      style={{
                        display: "inline-block",
                        padding: "8px 16px",
                        fontSize: 13,
                        fontWeight: 600,
                        color: "#4b5563",
                        background: "white",
                        border: "1px solid #e5e7eb",
                        borderRadius: "8px",
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
                    >
                      {step.action} &rarr;
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Company Profile Dashboard */}
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
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
                  Company Profile
                </div>
                <span style={{
                  background: "#e0e7ff",
                  color: "#4338ca",
                  fontSize: 12,
                  fontWeight: 600,
                  padding: "4px 10px",
                  borderRadius: "12px"
                }}>
                  Setup
                </span>
              </div>

              {message ? <div className="alert success" style={{ marginBottom: 12 }}>{message}</div> : null}
              {error ? <div className="alert error" style={{ marginBottom: 12 }}>{error}</div> : null}

              {isEditing ? (
                <div style={{ display: "grid", gap: 12, marginTop: 16 }}>
                  {/* Logo Upload Section */}
                  <div style={{ textAlign: "center", marginBottom: 8 }}>
                    {logoPreview && (
                      <div style={{ position: "relative", display: "inline-block", marginBottom: 12 }}>
                        <img
                          src={logoPreview}
                          alt="Logo preview"
                          style={{
                            width: 80,
                            height: 80,
                            borderRadius: 16,
                            objectFit: "cover",
                            border: "1px solid #e5e7eb",
                            background: "white",
                            padding: "4px"
                          }}
                        />
                        {!removeLogo && (
                          <button
                            type="button"
                            onClick={handleRemoveLogoClick}
                            style={{
                              position: "absolute",
                              top: -8,
                              right: -8,
                              background: "#ef4444",
                              color: "white",
                              border: "none",
                              borderRadius: "50%",
                              width: 24,
                              height: 24,
                              cursor: "pointer",
                              fontSize: 12,
                              fontWeight: "bold",
                              boxShadow: "0 2px 5px rgba(0,0,0,0.2)"
                            }}
                          >
                            ×
                          </button>
                        )}
                      </div>
                    )}
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/gif,image/svg+xml,image/webp"
                        onChange={handleFileChange}
                        style={{ fontSize: 13, color: "#6b7280", maxWidth: "100%" }}
                      />
                      <p style={{ fontSize: 11, color: "#9ca3af", marginTop: 4 }}>
                        JPG, PNG, GIF, SVG, WEBP (max 5MB)
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="label" htmlFor="company-name" style={{ fontSize: 12, color: "#6b7280" }}>Company name</label>
                    <input
                      id="company-name"
                      className="input"
                      style={{ padding: "10px 14px", borderRadius: "8px", border: "1px solid #e5e7eb" }}
                      value={form.companyName}
                      onChange={(e) => {
                        setForm((prev) => ({ ...prev, companyName: e.target.value }));
                        setFormErrors((prev) => ({ ...prev, companyName: "" }));
                      }}
                    />
                    {formErrors.companyName ? <div className="helper" style={{ color: "var(--danger)", marginTop: 6 }}>{formErrors.companyName}</div> : null}
                  </div>
                  <div>
                    <label className="label" htmlFor="company-email" style={{ fontSize: 12, color: "#6b7280" }}>Email address</label>
                    <input
                      id="company-email"
                      className="input"
                      type="email"
                      style={{ padding: "10px 14px", borderRadius: "8px", border: "1px solid #e5e7eb" }}
                      value={form.email}
                      onChange={(e) => {
                        setForm((prev) => ({ ...prev, email: e.target.value }));
                        setFormErrors((prev) => ({ ...prev, email: "" }));
                      }}
                    />
                    {formErrors.email ? <div className="helper" style={{ color: "var(--danger)", marginTop: 6 }}>{formErrors.email}</div> : null}
                  </div>
                  <div>
                    <label className="label" htmlFor="company-description" style={{ fontSize: 12, color: "#6b7280" }}>Description</label>
                    <textarea
                      id="company-description"
                      className="input"
                      rows="3"
                      style={{ padding: "10px 14px", borderRadius: "8px", border: "1px solid #e5e7eb", resize: "vertical" }}
                      value={form.description}
                      onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                      placeholder="Tell students about your company"
                    />
                  </div>
                  <div>
                    <label className="label" htmlFor="company-industry" style={{ fontSize: 12, color: "#6b7280" }}>Industry</label>
                    <input
                      id="company-industry"
                      className="input"
                      style={{ padding: "10px 14px", borderRadius: "8px", border: "1px solid #e5e7eb" }}
                      value={form.industry}
                      onChange={(e) => setForm((prev) => ({ ...prev, industry: e.target.value }))}
                      placeholder="e.g., Information Technology, Finance, Healthcare"
                    />
                  </div>
                  <div>
                    <label className="label" htmlFor="company-website" style={{ fontSize: 12, color: "#6b7280" }}>Website</label>
                    <input
                      id="company-website"
                      className="input"
                      type="url"
                      style={{ padding: "10px 14px", borderRadius: "8px", border: "1px solid #e5e7eb" }}
                      value={form.website}
                      onChange={(e) => setForm((prev) => ({ ...prev, website: e.target.value }))}
                      placeholder="https://www.yourcompany.com"
                    />
                    {formErrors.website ? <div className="helper" style={{ color: "var(--danger)", marginTop: 6 }}>{formErrors.website}</div> : null}
                  </div>
                  <div>
                    <label className="label" htmlFor="company-location" style={{ fontSize: 12, color: "#6b7280" }}>Location</label>
                    <input
                      id="company-location"
                      className="input"
                      style={{ padding: "10px 14px", borderRadius: "8px", border: "1px solid #e5e7eb" }}
                      value={form.location}
                      onChange={(e) => setForm((prev) => ({ ...prev, location: e.target.value }))}
                      placeholder="City, Country"
                    />
                  </div>
                  <div>
                    <label className="label" htmlFor="company-phone" style={{ fontSize: 12, color: "#6b7280" }}>Phone</label>
                    <input
                      id="company-phone"
                      className="input"
                      style={{ padding: "10px 14px", borderRadius: "8px", border: "1px solid #e5e7eb" }}
                      value={form.phone}
                      onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))}
                      placeholder="+94 77 123 4567"
                    />
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
                <>
                  <div style={{ display: "grid", gap: 14 }}>
                    {[
                      { label: "Company", value: profile.companyName || "-" },
                      { label: "Email", value: profile.email || "-" },
                      { label: "Description", value: profile.description || "-" },
                      { label: "Industry", value: profile.industry || "-" },
                      { label: "Website", value: profile.website || "-" },
                      { label: "Location", value: profile.location || "-" },
                      { label: "Phone", value: profile.phone || "-" },
                      { label: "Role", value: "Company" },
                      { label: "Member since", value: new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" }) },
                    ].map((r) => (
                      <div key={r.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontSize: 14, color: "var(--muted)" }}>{r.label}</span>
                        {r.label === "Website" && r.value !== "-" ? (
                          <a
                            href={r.value}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              fontSize: 14,
                              fontWeight: 600,
                              color: "var(--teal)",
                              maxWidth: 180,
                              textAlign: "right",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                              textDecoration: "none",
                            }}
                          >
                            {r.value}
                          </a>
                        ) : (
                          <span
                            style={{
                              fontSize: 14,
                              fontWeight: 600,
                              color: "var(--text)",
                              maxWidth: 180,
                              textAlign: "right",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {r.value}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>

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
                      transition: "all 0.2s",
                      marginTop: 22
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
                    Edit Company Profile
                  </button>
                </>
              )}
              <style>{`
        @keyframes sparkleAnim {
          0%, 100% { transform: scale(1) rotate(0deg); opacity: 0.8; }
          50% { transform: scale(1.15) rotate(15deg); opacity: 1; }
        }
      `}</style>
              <button
                style={{
                  width: "100%",
                  padding: "12px",
                  background: "transparent",
                  border: "none",
                  color: "#ef4444",
                  fontWeight: 600,
                  fontSize: 14,
                  cursor: "pointer",
                  marginTop: 8
                }}
                onClick={handleDeleteAccount}
              >
                Delete Account
              </button>
            </div>

            <div className="card animate-fade-up" style={{
              padding: "24px",
              background: "white",
              borderRadius: "16px",
              border: "none",
              boxShadow: "0 4px 15px rgba(0,0,0,0.03)",
              marginTop: 0,
              animationDelay: "0.4s"
            }}>
              <div style={{ fontWeight: 700, fontSize: 16, color: "#1f2937", fontFamily: "'Sora', sans-serif", marginBottom: 16 }}>
                Quick Links
              </div>
              <div style={{ display: "grid", gap: 8 }}>
                {[
                  { label: "Create Job Posting", icon: <Plus size={16} color="var(--primary)" />, to: "/company/post-job" },
                  { label: "Create Internship Posting", icon: <Sparkles size={16} color="#fbbf24" />, to: "/company/post-job" },
                  { label: "View Applicants", icon: <Users size={16} color="var(--teal)" />, to: "/company/applicants" },
                  { label: "AI Ranked Applicants", icon: <Brain size={16} color="#4b5563" />, to: "/company/ranked-applicants" },
                  { label: "View All Jobs", icon: <ClipboardList size={16} color="#4f46e5" />, to: "/company/jobs" },
                  { label: "Jobs Per Month Report", icon: <TrendingUp size={16} color="#dc2626" />, to: "/company/reports/jobs-per-month" },
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