import { useEffect, useState } from "react";
import AdminLayout from "../../components/admin/AdminLayout";
import { api } from "../../services/api";
import { useAuth } from "../../context/AuthContext";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function getError(error, fallback) {
  const data = error?.response?.data;
  if (typeof data === "string") return data;
  return data?.message || data?.title || fallback;
}

export default function AdminProfile() {
  const auth = useAuth();

  const [profile, setProfile] = useState({ fullName: "", email: "" });
  const [passwordForm, setPasswordForm] = useState({ currentPassword: "", newPassword: "" });

  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const { data } = await api.get("/api/admin/me");
        setProfile({
          fullName: data?.fullName || "",
          email: data?.email || "",
        });
      } catch (err) {
        setError(getError(err, "Failed to load admin profile."));
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const validateProfile = () => {
    const next = {};
    if (!profile.fullName.trim()) next.fullName = "Full name is required.";
    if (!profile.email.trim()) next.email = "Email is required.";
    else if (!emailRegex.test(profile.email.trim())) next.email = "Enter a valid email.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const validatePassword = () => {
    const next = {};
    if (!passwordForm.currentPassword) next.currentPassword = "Current password is required.";
    if (!passwordForm.newPassword) next.newPassword = "New password is required.";
    setErrors((prev) => ({ ...prev, ...next }));
    return Object.keys(next).length === 0;
  };

  const updateProfile = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    if (!validateProfile()) return;

    try {
      await api.put("/api/admin/profile", {
        fullName: profile.fullName.trim(),
        email: profile.email.trim().toLowerCase(),
      });

      auth.login({
        token: auth.token,
        role: auth.role,
        userId: auth.userId,
        fullName: profile.fullName.trim(),
        email: profile.email.trim().toLowerCase(),
      });

      setMessage("Profile updated successfully.");
    } catch (err) {
      setError(getError(err, "Failed to update profile."));
    }
  };

  const changePassword = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    if (!validatePassword()) return;

    try {
      await api.post("/api/admin/change-password", {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      setPasswordForm({ currentPassword: "", newPassword: "" });
      setMessage("Password changed successfully.");
    } catch (err) {
      setError(getError(err, "Failed to change password."));
    }
  };

  return (
    <AdminLayout title="Admin Profile" subtitle="Manage your account details">
      {loading ? <div className="alert info" style={{ marginBottom: 14 }}>Loading profile...</div> : null}
      {error ? <div className="alert error" style={{ marginBottom: 14 }}>{error}</div> : null}
      {message ? <div className="alert success" style={{ marginBottom: 14 }}>{message}</div> : null}

      <div className="admin-profile-grid">
        <form className="card admin-form-card" onSubmit={updateProfile}>
          <h3 style={{ marginBottom: 14 }}>Update Profile</h3>
          <div className="form-row">
            <div>
              <label className="label" htmlFor="fullName">Full name</label>
              <input
                id="fullName"
                className="input"
                value={profile.fullName}
                onChange={(e) => {
                  setProfile((prev) => ({ ...prev, fullName: e.target.value }));
                  setErrors((prev) => ({ ...prev, fullName: "" }));
                }}
              />
              {errors.fullName ? <div className="helper admin-field-error">{errors.fullName}</div> : null}
            </div>

            <div>
              <label className="label" htmlFor="email">Email</label>
              <input
                id="email"
                className="input"
                type="email"
                value={profile.email}
                onChange={(e) => {
                  setProfile((prev) => ({ ...prev, email: e.target.value }));
                  setErrors((prev) => ({ ...prev, email: "" }));
                }}
              />
              {errors.email ? <div className="helper admin-field-error">{errors.email}</div> : null}
            </div>

            <button className="btn btn-primary" type="submit">Save Profile</button>
          </div>
        </form>

        <form className="card admin-form-card" onSubmit={changePassword}>
          <h3 style={{ marginBottom: 14 }}>Change Password</h3>
          <div className="form-row">
            <div>
              <label className="label" htmlFor="currentPassword">Current password</label>
              <input
                id="currentPassword"
                className="input"
                type="password"
                value={passwordForm.currentPassword}
                onChange={(e) => {
                  setPasswordForm((prev) => ({ ...prev, currentPassword: e.target.value }));
                  setErrors((prev) => ({ ...prev, currentPassword: "" }));
                }}
              />
              {errors.currentPassword ? <div className="helper admin-field-error">{errors.currentPassword}</div> : null}
            </div>

            <div>
              <label className="label" htmlFor="newPassword">New password</label>
              <input
                id="newPassword"
                className="input"
                type="password"
                value={passwordForm.newPassword}
                onChange={(e) => {
                  setPasswordForm((prev) => ({ ...prev, newPassword: e.target.value }));
                  setErrors((prev) => ({ ...prev, newPassword: "" }));
                }}
              />
              {errors.newPassword ? <div className="helper admin-field-error">{errors.newPassword}</div> : null}
            </div>

            <button className="btn btn-outline" type="submit">Update Password</button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}
