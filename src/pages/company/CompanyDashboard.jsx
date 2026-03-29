import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { clearAuth, getAuth, saveAuth } from "../../services/auth";
import { companyProfileApi } from "../../services/profile";
import companyJobService from "../../services/companyjobService";

const COMPANY_ACTIONS = [
  {
    icon: "JP",
    title: "Create a job post",
    desc: "Add title, skills, and role details to prepare your next opening.",
    action: "Create Job Post",
    link: "/company/post-job", 
  },
  {
    icon: "IN",
    title: "Create an internship post",
    desc: "Publish internship opportunities and define candidate requirements.",
    action: "Create Internship Post",
    link: "/company/post-job", 
  },
  {
    icon: "AP",
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
    <div style={{ minHeight: "calc(100vh - 65px)", background: "var(--bg)", paddingBottom: 60 }}>
      <div
        className="company-home-hero"
        style={{
          background: "linear-gradient(135deg, #0A5F75 0%, #0A2472 100%)",
          padding: "56px 0 80px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: -80,
            right: -80,
            width: 300,
            height: 300,
            borderRadius: "50%",
            background: "rgba(46,196,182,0.10)",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            opacity: 0.03,
            backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />

        <div className="container" style={{ position: "relative" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
            {profile.logoUrl ? (
              <img
                src={profile.logoUrl}
                alt={name}
                style={{
                  width: 72,
                  height: 72,
                  borderRadius: 22,
                  objectFit: "cover",
                  border: "2px solid rgba(255,255,255,0.3)",
                }}
                onError={(e) => {
                  e.target.style.display = 'none';
                  const parent = e.target.parentElement;
                  const fallback = document.createElement('div');
                  fallback.style.cssText = `
                    width: 72px;
                    height: 72px;
                    border-radius: 22px;
                    background: #2EC4B6;
                    display: grid;
                    place-items: center;
                    font-weight: 900;
                    font-size: 24px;
                    color: white;
                    font-family: 'Sora', sans-serif;
                    flex-shrink: 0;
                  `;
                  fallback.textContent = name[0].toUpperCase();
                  parent.appendChild(fallback);
                }}
              />
            ) : (
              <div
                style={{
                  width: 72,
                  height: 72,
                  borderRadius: 22,
                  background: "#2EC4B6",
                  display: "grid",
                  placeItems: "center",
                  fontWeight: 900,
                  fontSize: 24,
                  color: "white",
                  fontFamily: "'Sora', sans-serif",
                  flexShrink: 0,
                }}
              >
                {name[0].toUpperCase()}
              </div>
            )}

            <div>
              <div style={{ fontSize: 15, color: "rgba(255,255,255,0.6)", marginBottom: 6 }}>{getGreeting()},</div>
              <h1 style={{ fontFamily: "'Sora', sans-serif", fontSize: 36, fontWeight: 900, color: "white" }}>
                {name}
              </h1>
              <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
                <span
                  className="badge"
                  style={{
                    background: "rgba(46,196,182,0.2)",
                    color: "#2EC4B6",
                    border: "1px solid rgba(46,196,182,0.3)",
                    fontSize: 13,
                    padding: "5px 12px",
                  }}
                >
                  Company
                </span>
                <span
                  className="badge"
                  style={{
                    background: "rgba(255,255,255,0.1)",
                    color: "rgba(255,255,255,0.7)",
                    fontSize: 13,
                    padding: "5px 12px",
                  }}
                >
                  {profile.email}
                </span>
                {profile.industry && (
                  <span
                    className="badge"
                    style={{
                      background: "rgba(255,255,255,0.1)",
                      color: "rgba(255,255,255,0.7)",
                      fontSize: 13,
                      padding: "5px 12px",
                    }}
                  >
                    {profile.industry}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container" style={{ marginTop: -28 }}>
        {/* Stats Grid */}
        <div
          className="company-stats-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 16,
            marginBottom: 28,
          }}
        >
          {/* Active Job Posts Card */}
          <div className="card animate-fade-up" style={{ padding: "24px 22px", animationDelay: "0s" }}>
            <div
              style={{
                width: 46,
                height: 46,
                borderRadius: 14,
                background: "var(--teal-dim)",
                color: "var(--teal)",
                display: "grid",
                placeItems: "center",
                fontSize: 12,
                fontWeight: 700,
                marginBottom: 16,
              }}
            >
              JP
            </div>
            <div style={{ fontWeight: 900, fontSize: 28, color: "var(--text)", fontFamily: "'Sora', sans-serif" }}>
              {jobStats.loading ? "..." : jobStats.activeJobs}
            </div>
            <div style={{ fontSize: 14, color: "var(--muted)", marginTop: 4, fontWeight: 500 }}>Active Job Posts</div>
            <Link 
              to="/company/jobs" 
              style={{ fontSize: 11, color: "var(--teal)", marginTop: 4, fontWeight: 600, display: "inline-block", textDecoration: "none" }}
            >
              View all →
            </Link>
          </div>

          {/* Active Internships Card */}
          <div className="card animate-fade-up" style={{ padding: "24px 22px", animationDelay: "0.08s" }}>
            <div
              style={{
                width: 46,
                height: 46,
                borderRadius: 14,
                background: "rgba(255,159,28,0.10)",
                color: "#FF9F1C",
                display: "grid",
                placeItems: "center",
                fontSize: 12,
                fontWeight: 700,
                marginBottom: 16,
              }}
            >
              IN
            </div>
            <div style={{ fontWeight: 900, fontSize: 28, color: "var(--text)", fontFamily: "'Sora', sans-serif" }}>
              {jobStats.loading ? "..." : jobStats.activeInternships}
            </div>
            <div style={{ fontSize: 14, color: "var(--muted)", marginTop: 4, fontWeight: 500 }}>Active Internships</div>
            <Link 
              to="/company/jobs" 
              style={{ fontSize: 11, color: "var(--teal)", marginTop: 4, fontWeight: 600, display: "inline-block", textDecoration: "none" }}
            >
              View all →
            </Link>
          </div>

          {/* Total Applicants Card */}
          <div className="card animate-fade-up" style={{ padding: "24px 22px", animationDelay: "0.16s" }}>
            <div
              style={{
                width: 46,
                height: 46,
                borderRadius: 14,
                background: "var(--coral-dim)",
                color: "var(--coral)",
                display: "grid",
                placeItems: "center",
                fontSize: 12,
                fontWeight: 700,
                marginBottom: 16,
              }}
            >
              AP
            </div>
            <div style={{ fontWeight: 900, fontSize: 28, color: "var(--text)", fontFamily: "'Sora', sans-serif" }}>
              {jobStats.loading ? "..." : jobStats.totalApplicants}
            </div>
            <div style={{ fontSize: 14, color: "var(--muted)", marginTop: 4, fontWeight: 500 }}>Total Applicants</div>
            <Link 
              to="/company/applicants" 
              style={{ fontSize: 11, color: "var(--teal)", marginTop: 4, fontWeight: 600, display: "inline-block", textDecoration: "none" }}
            >
              Review →
            </Link>
          </div>
        </div>

        <div className="company-main-grid" style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 20 }}>
          <div>
            <div style={{ fontWeight: 800, fontSize: 20, marginBottom: 16, fontFamily: "'Sora', sans-serif" }}>
              Company actions
            </div>
            <div style={{ display: "grid", gap: 14 }}>
              {COMPANY_ACTIONS.map((step, i) => (
                <div
                  key={step.title}
                  className="card animate-fade-up company-action-card"
                  style={{
                    padding: "22px 24px",
                    display: "flex",
                    gap: 18,
                    alignItems: "flex-start",
                    animationDelay: `${0.2 + i * 0.1}s`,
                    cursor: step.link ? "pointer" : "default",
                    transition: "transform 0.2s, box-shadow 0.2s",
                  }}
                  onClick={() => step.link && handleActionClick(step.link)}
                  onMouseEnter={(e) => {
                    if (step.link) {
                      e.currentTarget.style.transform = "translateY(-2px)";
                      e.currentTarget.style.boxShadow = "var(--shadow-md)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "var(--shadow)";
                  }}
                >
                  <div
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 14,
                      background: "var(--teal-dim)",
                      color: "var(--teal)",
                      display: "grid",
                      placeItems: "center",
                      fontSize: 12,
                      fontWeight: 700,
                      flexShrink: 0,
                    }}
                  >
                    {step.icon}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 6 }}>{step.title}</div>
                    <p className="helper" style={{ marginBottom: 14, fontSize: 14 }}>
                      {step.desc}
                    </p>
                    <button 
                      className="btn btn-outline btn-sm" 
                      style={{ fontSize: 13 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (step.link) handleActionClick(step.link);
                      }}
                    >
                      {step.action} {"->"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div style={{ fontWeight: 800, fontSize: 20, marginBottom: 16, fontFamily: "'Sora', sans-serif" }}>
              Company profile
            </div>
            <div className="card animate-fade-up" style={{ padding: "26px 22px", animationDelay: "0.3s" }}>
              <div style={{ marginBottom: 24 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                  <span style={{ fontSize: 15, fontWeight: 600 }}>Onboarding status</span>
                  <span style={{ fontSize: 13, color: "var(--muted)", fontWeight: 500 }}>In progress</span>
                </div>
                <div style={{ height: 8, background: "var(--bg)", borderRadius: 999, overflow: "hidden" }}>
                  <div
                    style={{
                      height: "100%",
                      width: "20%",
                      background: "linear-gradient(90deg, var(--primary), var(--teal))",
                      borderRadius: 999,
                      transition: "width 1s ease",
                    }}
                  />
                </div>
                <p className="helper" style={{ marginTop: 8, fontSize: 13 }}>
                  Complete company setup and publish your first opportunity.
                </p>
              </div>

              <hr className="divider" style={{ margin: "0 0 20px" }} />

              {message ? <div className="alert success" style={{ marginBottom: 12 }}>{message}</div> : null}
              {error ? <div className="alert error" style={{ marginBottom: 12 }}>{error}</div> : null}

              {isEditing ? (
                <div style={{ display: "grid", gap: 12 }}>
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
                            borderRadius: 12,
                            objectFit: "cover",
                            border: "1px solid var(--border)",
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
                              background: "var(--coral)",
                              color: "white",
                              border: "none",
                              borderRadius: "50%",
                              width: 24,
                              height: 24,
                              cursor: "pointer",
                              fontSize: 12,
                            }}
                          >
                            ×
                          </button>
                        )}
                      </div>
                    )}
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/gif,image/svg+xml,image/webp"
                      onChange={handleFileChange}
                      style={{ fontSize: 13 }}
                    />
                    <p style={{ fontSize: 11, color: "var(--muted)", marginTop: 4 }}>
                      JPG, PNG, GIF, SVG, WEBP (max 5MB)
                    </p>
                  </div>

                  <div>
                    <label className="label" htmlFor="company-name">Company name</label>
                    <input
                      id="company-name"
                      className="input"
                      value={form.companyName}
                      onChange={(e) => {
                        setForm((prev) => ({ ...prev, companyName: e.target.value }));
                        setFormErrors((prev) => ({ ...prev, companyName: "" }));
                      }}
                    />
                    {formErrors.companyName ? <div className="helper" style={{ color: "var(--danger)", marginTop: 6 }}>{formErrors.companyName}</div> : null}
                  </div>
                  <div>
                    <label className="label" htmlFor="company-email">Email</label>
                    <input
                      id="company-email"
                      className="input"
                      type="email"
                      value={form.email}
                      onChange={(e) => {
                        setForm((prev) => ({ ...prev, email: e.target.value }));
                        setFormErrors((prev) => ({ ...prev, email: "" }));
                      }}
                    />
                    {formErrors.email ? <div className="helper" style={{ color: "var(--danger)", marginTop: 6 }}>{formErrors.email}</div> : null}
                  </div>
                  <div>
                    <label className="label" htmlFor="company-description">Description</label>
                    <textarea
                      id="company-description"
                      className="input"
                      rows="3"
                      value={form.description}
                      onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                      placeholder="Tell students about your company"
                      style={{ resize: "vertical" }}
                    />
                  </div>
                  <div>
                    <label className="label" htmlFor="company-industry">Industry</label>
                    <input
                      id="company-industry"
                      className="input"
                      value={form.industry}
                      onChange={(e) => setForm((prev) => ({ ...prev, industry: e.target.value }))}
                      placeholder="e.g., Information Technology, Finance, Healthcare"
                    />
                  </div>
                  <div>
                    <label className="label" htmlFor="company-website">Website</label>
                    <input
                      id="company-website"
                      className="input"
                      type="url"
                      value={form.website}
                      onChange={(e) => setForm((prev) => ({ ...prev, website: e.target.value }))}
                      placeholder="https://www.yourcompany.com"
                    />
                    {formErrors.website ? <div className="helper" style={{ color: "var(--danger)", marginTop: 6 }}>{formErrors.website}</div> : null}
                  </div>
                  <div>
                    <label className="label" htmlFor="company-location">Location</label>
                    <input
                      id="company-location"
                      className="input"
                      value={form.location}
                      onChange={(e) => setForm((prev) => ({ ...prev, location: e.target.value }))}
                      placeholder="City, Country"
                    />
                  </div>
                  <div>
                    <label className="label" htmlFor="company-phone">Phone</label>
                    <input
                      id="company-phone"
                      className="input"
                      value={form.phone}
                      onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))}
                      placeholder="+94 77 123 4567"
                    />
                  </div>
                  <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
                    <button className="btn btn-teal" style={{ flex: 1, justifyContent: "center" }} onClick={handleSaveProfile} disabled={saving}>
                      {saving ? "Saving..." : "Save Changes"}
                    </button>
                    <button className="btn btn-outline" style={{ flex: 1, justifyContent: "center" }} onClick={handleCancelEdit} disabled={saving}>
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
                    className="btn btn-teal"
                    style={{ width: "100%", justifyContent: "center", marginTop: 22, fontSize: 15 }}
                    onClick={handleEditProfile}
                  >
                    Edit Company Profile {"->"}
                  </button>
                </>
              )}
              <button
                className="btn btn-outline"
                style={{ width: "100%", justifyContent: "center", marginTop: 10, fontSize: 15 }}
                onClick={handleDeleteAccount}
              >
                Delete Account
              </button>
            </div>

            <div className="card animate-fade-up" style={{ padding: "20px 22px", marginTop: 16, animationDelay: "0.4s" }}>
              <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 14 }}>Quick links</div>
              <div style={{ display: "grid", gap: 10 }}>
                {[
                  { label: "Create Job Posting", to: "/company/post-job" },
                  { label: "Create Internship Posting", to: "/company/post-job" },
                  { label: "View Applicants", to: "/company/applicants" },
                  { label: "View All Jobs", to: "/company/jobs" },
                ].map((l) => (
                  <Link
                    key={l.label}
                    to={l.to}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "var(--teal-dim)")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "var(--bg)")}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      padding: "12px 14px",
                      borderRadius: 10,
                      background: "var(--bg)",
                      border: "1px solid var(--border)",
                      fontSize: 15,
                      fontWeight: 500,
                      color: "var(--text)",
                      transition: "background 0.15s",
                      textDecoration: "none",
                    }}
                  >
                    {l.label}
                    <span style={{ marginLeft: "auto", color: "var(--muted)" }}>{"->"}</span>
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