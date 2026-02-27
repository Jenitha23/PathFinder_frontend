import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../../services/api";
import { useAuth } from "../../context/AuthContext";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function getErrorMessage(error) {
  const data = error?.response?.data;
  if (typeof data === "string") return data;
  if (data?.message) return data.message;
  if (data?.title) return data.title;
  return "Invalid email or password. Please try again.";
}

export default function AdminLogin() {
  const nav = useNavigate();
  const auth = useAuth();

  const [form, setForm] = useState({ email: "", password: "" });
  const [fieldErrors, setFieldErrors] = useState({});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const canSubmit = useMemo(
    () => !!form.email.trim() && !!form.password && !loading,
    [form, loading],
  );

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    setError("");
  };

  const validate = () => {
    const next = {};

    if (!form.email.trim()) next.email = "Email is required.";
    else if (!emailRegex.test(form.email.trim())) next.email = "Enter a valid email address.";

    if (!form.password) next.password = "Password is required.";

    setFieldErrors(next);
    return Object.keys(next).length === 0;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setError("");

    try {
      const { data } = await api.post("/api/admin/auth/login", {
        email: form.email.trim().toLowerCase(),
        password: form.password,
      });

      if (data?.role !== "ADMIN") {
        setError("You are not authorized for admin access.");
        return;
      }

      auth.login({
        token: data.token,
        role: data.role,
        userId: data.userId,
        email: data.email,
        fullName: data.fullName,
      });

      nav("/admin/dashboard", { replace: true });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page auth-login-page" style={{ height: "calc(100vh - 65px)", display: "grid", gridTemplateColumns: "1fr 1fr" }}>
      <div className="auth-page-side" style={{ background: "linear-gradient(145deg, #6E1E1E 0%, #0A2472 100%)", padding: "44px 48px", color: "white" }}>
        <div style={{ fontFamily: "'Sora', sans-serif", fontSize: 40, fontWeight: 900, lineHeight: 1.1 }}>
          Admin control
          <br />
          center.
        </div>
        <p style={{ marginTop: 16, color: "rgba(255,255,255,0.75)", maxWidth: 400 }}>
          Manage platform users and approval status from a single place.
        </p>
      </div>

      <div className="auth-page-form" style={{ display: "grid", placeItems: "center", background: "white", padding: "24px" }}>
        <div className="card" style={{ width: "100%", maxWidth: 420, padding: 26 }}>
          <h1 style={{ fontSize: 32, fontWeight: 900, marginBottom: 8 }}>Admin Login</h1>
          <p className="helper" style={{ marginBottom: 16 }}>Use your admin credentials to continue.</p>

          {error ? <div className="alert error" style={{ marginBottom: 12 }}>{error}</div> : null}

          <form onSubmit={onSubmit} className="form-row">
            <div>
              <label className="label" htmlFor="email">Email</label>
              <input id="email" name="email" className="input" type="email" value={form.email} onChange={onChange} />
              {fieldErrors.email ? <div className="helper" style={{ color: "#c0392b", marginTop: 4 }}>{fieldErrors.email}</div> : null}
            </div>

            <div>
              <label className="label" htmlFor="password">Password</label>
              <input id="password" name="password" className="input" type="password" value={form.password} onChange={onChange} />
              {fieldErrors.password ? <div className="helper" style={{ color: "#c0392b", marginTop: 4 }}>{fieldErrors.password}</div> : null}
            </div>

            <button type="submit" className="btn btn-primary" disabled={!canSubmit} style={{ justifyContent: "center" }}>
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <p className="helper" style={{ marginTop: 14 }}>
            Not an admin? <Link to="/">Go back home</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
