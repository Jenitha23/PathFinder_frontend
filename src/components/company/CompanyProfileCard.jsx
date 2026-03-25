/**
 * File: src/components/company/CompanyProfileCard.jsx
 * Purpose: Company profile display and editing component
 */
import { useState, useRef } from "react";

export default function CompanyProfileCard({ profile, onUpdate, onRemoveLogo, saving }) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    companyName: profile?.companyName || "",
    email: profile?.email || "",
    description: profile?.description || "",
    industry: profile?.industry || "",
    website: profile?.website || "",
    location: profile?.location || "",
    phone: profile?.phone || "",
  });
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(profile?.logoUrl || null);
  const [errors, setErrors] = useState({});
  const [removeLogoFlag, setRemoveLogoFlag] = useState(false);
  const fileInputRef = useRef(null);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.companyName.trim()) newErrors.companyName = "Company name is required.";
    if (!formData.email.trim()) newErrors.email = "Email is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) 
      newErrors.email = "Enter a valid email address.";
    if (formData.website && !/^https?:\/\/.+/.test(formData.website))
      newErrors.website = "Enter a valid URL (http:// or https://)";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleEdit = () => {
    setIsEditing(true);
    setFormData({
      companyName: profile?.companyName || "",
      email: profile?.email || "",
      description: profile?.description || "",
      industry: profile?.industry || "",
      website: profile?.website || "",
      location: profile?.location || "",
      phone: profile?.phone || "",
    });
    setLogoPreview(profile?.logoUrl || null);
    setLogoFile(null);
    setRemoveLogoFlag(false);
    setErrors({});
  };

  const handleCancel = () => {
    setIsEditing(false);
    setLogoFile(null);
    setLogoPreview(profile?.logoUrl || null);
    setRemoveLogoFlag(false);
    setErrors({});
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/svg+xml", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      alert("Invalid file type. Allowed: JPG, PNG, GIF, SVG, WEBP.");
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("File is too large. Max size is 5MB.");
      return;
    }

    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
    setRemoveLogoFlag(false);
  };

  const handleRemoveLogo = () => {
    setLogoFile(null);
    setLogoPreview(null);
    setRemoveLogoFlag(true);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const submitData = new FormData();
    submitData.append("CompanyName", formData.companyName.trim());
    submitData.append("Email", formData.email.trim().toLowerCase());
    if (formData.description) submitData.append("Description", formData.description.trim());
    if (formData.industry) submitData.append("Industry", formData.industry.trim());
    if (formData.website) submitData.append("Website", formData.website.trim());
    if (formData.location) submitData.append("Location", formData.location.trim());
    if (formData.phone) submitData.append("Phone", formData.phone.trim());
    submitData.append("RemoveLogo", removeLogoFlag);
    
    if (logoFile) {
      submitData.append("LogoFile", logoFile);
    }

    const result = await onUpdate(submitData);
    if (result?.success) {
      setIsEditing(false);
      setLogoFile(null);
      setRemoveLogoFlag(false);
    }
  };

  const handleRemoveLogoOnly = async () => {
    if (window.confirm("Are you sure you want to remove your company logo?")) {
      await onRemoveLogo();
    }
  };

  const fieldLabels = {
    companyName: "Company Name",
    email: "Email",
    description: "Description",
    industry: "Industry",
    website: "Website",
    location: "Location",
    phone: "Phone",
  };

  if (!profile) return null;

  return (
    <div className="card animate-fade-up" style={{ padding: "26px 22px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h3 style={{ fontFamily: "'Sora', sans-serif", fontSize: 20, fontWeight: 800 }}>
          Company Profile
        </h3>
        {!isEditing && (
          <button className="btn btn-outline btn-sm" onClick={handleEdit}>
            Edit Profile ✏️
          </button>
        )}
      </div>

      {isEditing ? (
        <form onSubmit={handleSubmit}>
          {/* Logo Upload Section */}
          <div style={{ marginBottom: 20, textAlign: "center" }}>
            <div style={{ marginBottom: 12 }}>
              {logoPreview ? (
                <div style={{ position: "relative", display: "inline-block" }}>
                  <img
                    src={logoPreview}
                    alt="Company logo"
                    style={{
                      width: 100,
                      height: 100,
                      borderRadius: 12,
                      objectFit: "cover",
                      border: "2px solid var(--border)",
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleRemoveLogo}
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
                </div>
              ) : (
                <div
                  style={{
                    width: 100,
                    height: 100,
                    borderRadius: 12,
                    background: "var(--bg)",
                    border: "2px dashed var(--border)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto",
                    color: "var(--muted)",
                  }}
                >
                  No Logo
                </div>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/gif,image/svg+xml,image/webp"
              onChange={handleFileChange}
              style={{ fontSize: 13 }}
            />
            <p style={{ fontSize: 12, color: "var(--muted)", marginTop: 8 }}>
              JPG, PNG, GIF, SVG, WEBP (max 5MB)
            </p>
          </div>

          {/* Form Fields */}
          <div style={{ display: "grid", gap: 14 }}>
            {Object.keys(fieldLabels).map((field) => (
              <div key={field}>
                <label className="label" htmlFor={field}>
                  {fieldLabels[field]}
                  {field === "companyName" || field === "email" ? " *" : ""}
                </label>
                {field === "description" ? (
                  <textarea
                    id={field}
                    className="input"
                    value={formData[field]}
                    onChange={(e) => setFormData({ ...formData, [field]: e.target.value })}
                    rows={3}
                    style={{ resize: "vertical" }}
                  />
                ) : (
                  <input
                    id={field}
                    className="input"
                    type={field === "email" ? "email" : "text"}
                    value={formData[field]}
                    onChange={(e) => setFormData({ ...formData, [field]: e.target.value })}
                    placeholder={fieldLabels[field]}
                  />
                )}
                {errors[field] && (
                  <div className="helper" style={{ color: "var(--coral)", marginTop: 4 }}>
                    {errors[field]}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div style={{ display: "flex", gap: 12, marginTop: 20 }}>
            <button type="submit" className="btn btn-teal" style={{ flex: 1 }} disabled={saving}>
              {saving ? "Saving..." : "Save Changes"}
            </button>
            <button type="button" className="btn btn-outline" style={{ flex: 1 }} onClick={handleCancel}>
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <>
          {/* Display Mode */}
          <div style={{ display: "grid", gap: 14 }}>
            {/* Logo Display */}
            {profile.logoUrl && (
              <div style={{ textAlign: "center", marginBottom: 12 }}>
                <img
                  src={profile.logoUrl}
                  alt={profile.companyName}
                  style={{
                    width: 100,
                    height: 100,
                    borderRadius: 12,
                    objectFit: "cover",
                    border: "1px solid var(--border)",
                  }}
                />
                <button
                  onClick={handleRemoveLogoOnly}
                  className="btn btn-outline btn-sm"
                  style={{ marginTop: 8, fontSize: 12 }}
                >
                  Remove Logo
                </button>
              </div>
            )}

            {[
              { label: "Company Name", value: profile.companyName },
              { label: "Email", value: profile.email },
              { label: "Description", value: profile.description || "Not provided" },
              { label: "Industry", value: profile.industry || "Not provided" },
              { label: "Website", value: profile.website || "Not provided" },
              { label: "Location", value: profile.location || "Not provided" },
              { label: "Phone", value: profile.phone || "Not provided" },
            ].map((item) => (
              <div key={item.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <span style={{ fontSize: 14, color: "var(--muted)" }}>{item.label}</span>
                <span
                  style={{
                    fontSize: 14,
                    fontWeight: 600,
                    color: "var(--text)",
                    maxWidth: "60%",
                    textAlign: "right",
                    wordBreak: "break-word",
                  }}
                >
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}