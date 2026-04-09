/**
 * File: src/components/admin/AdminUserEditModal.jsx
 * Purpose: Modal for editing student/company user accounts
 */
import { useState, useEffect } from "react";

const STATUS_OPTIONS_STUDENT = [
  { value: "ACTIVE", label: "Active" },
];

const STATUS_OPTIONS_COMPANY = [
  { value: "PENDING_APPROVAL", label: "Pending Approval" },
  { value: "APPROVED", label: "Approved" },
  { value: "REJECTED", label: "Rejected" },
  { value: "SUSPENDED", label: "Suspended" },
];

export default function AdminUserEditModal({ 
  isOpen, 
  onClose, 
  onSave, 
  user, 
  userType, 
  loading 
}) {
  const [formData, setFormData] = useState({
    fullName: "",
    companyName: "",
    email: "",
    status: "",
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (user && isOpen) {
      setFormData({
        fullName: user.fullName || user.FullName || "",
        companyName: user.companyName || user.CompanyName || "",
        email: user.email || user.Email || "",
        status: user.status || user.Status || (userType === "STUDENT" ? "ACTIVE" : "PENDING_APPROVAL"),
      });
      setErrors({});
    }
  }, [user, isOpen, userType]);

  if (!isOpen) return null;

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const validate = () => {
    const newErrors = {};
    
    if (userType === "STUDENT") {
      if (!formData.fullName.trim()) {
        newErrors.fullName = "Full name is required.";
      } else if (formData.fullName.trim().length < 2) {
        newErrors.fullName = "Full name must be at least 2 characters.";
      }
    } else {
      if (!formData.companyName.trim()) {
        newErrors.companyName = "Company name is required.";
      } else if (formData.companyName.trim().length < 2) {
        newErrors.companyName = "Company name must be at least 2 characters.";
      }
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = "Invalid email format.";
    }

    if (!formData.status) {
      newErrors.status = "Status is required.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const payload = {
      ...(userType === "STUDENT" 
        ? { fullName: formData.fullName.trim() }
        : { companyName: formData.companyName.trim() }
      ),
      email: formData.email.trim().toLowerCase(),
      status: formData.status,
    };

    onSave(payload);
  };

  const statusOptions = userType === "STUDENT" ? STATUS_OPTIONS_STUDENT : STATUS_OPTIONS_COMPANY;

  return (
    <div className="modal-overlay" style={{
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: "rgba(0,0,0,0.5)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 1000,
    }}>
      <div className="card" style={{ maxWidth: 500, width: "90%", padding: 24 }}>
        <h3 style={{ marginBottom: 8 }}>
          Edit {userType === "STUDENT" ? "Student" : "Company"}
        </h3>
        <p className="helper" style={{ marginBottom: 16 }}>
          Update account information for {user?.email || ""}
        </p>

        <form onSubmit={handleSubmit}>
          {userType === "STUDENT" ? (
            <div style={{ marginBottom: 16 }}>
              <label className="label" htmlFor="fullName">Full Name *</label>
              <input
                id="fullName"
                className="input"
                value={formData.fullName}
                onChange={(e) => handleChange("fullName", e.target.value)}
                disabled={loading}
              />
              {errors.fullName && (
                <div className="helper" style={{ color: "#c0392b", marginTop: 4 }}>
                  {errors.fullName}
                </div>
              )}
            </div>
          ) : (
            <div style={{ marginBottom: 16 }}>
              <label className="label" htmlFor="companyName">Company Name *</label>
              <input
                id="companyName"
                className="input"
                value={formData.companyName}
                onChange={(e) => handleChange("companyName", e.target.value)}
                disabled={loading}
              />
              {errors.companyName && (
                <div className="helper" style={{ color: "#c0392b", marginTop: 4 }}>
                  {errors.companyName}
                </div>
              )}
            </div>
          )}

          <div style={{ marginBottom: 16 }}>
            <label className="label" htmlFor="email">Email *</label>
            <input
              id="email"
              className="input"
              type="email"
              value={formData.email}
              onChange={(e) => handleChange("email", e.target.value)}
              disabled={loading}
            />
            {errors.email && (
              <div className="helper" style={{ color: "#c0392b", marginTop: 4 }}>
                {errors.email}
              </div>
            )}
          </div>

          <div style={{ marginBottom: 20 }}>
            <label className="label" htmlFor="status">Status *</label>
            <select
              id="status"
              className="input"
              value={formData.status}
              onChange={(e) => handleChange("status", e.target.value)}
              disabled={loading}
            >
              {statusOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            {errors.status && (
              <div className="helper" style={{ color: "#c0392b", marginTop: 4 }}>
                {errors.status}
              </div>
            )}
          </div>

          <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
            <button 
              type="button"
              className="btn btn-outline" 
              onClick={onClose} 
              disabled={loading}
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="btn btn-primary" 
              disabled={loading}
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}