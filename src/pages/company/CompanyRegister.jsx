import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../../services/api";

function StrengthBar({ password }) {
  const getStrength = () => {
    if (!password) return 0;
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    return score;
  };

  const strength = getStrength();
  const labels = ["", "Weak", "Fair", "Good", "Strong"];
  const colors = ["", "#FF6B6B", "#FF9F1C", "#2EC4B6", "#0A2472"];

  if (!password) return null;

  return (
    <div style={{ marginTop: 8 }}>
      <div style={{ display: "flex", gap: 4, marginBottom: 4 }}>
        {[1, 2, 3, 4].map((i) => (
          <div key={i} style={{
            flex: 1, height: 4, borderRadius: 4,
            background: i <= strength ? colors[strength] : "var(--border)",
            transition: "background 0.3s",
          }} />
        ))}
      </div>
      {strength > 0 && (
        <div style={{ fontSize: 12, color: colors[strength], fontWeight: 600 }}>
          {labels[strength]} password
        </div>
      )}
    </div>
  );
}

export default function CompanyRegister() {
  const nav = useNavigate();

  const [form, setForm] = useState({
    companyName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const onChange = (e) => {
    setError("");
    setSuccess("");
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
  };

  const validate = () => {
    if (!form.companyName.trim()) return "Company name is required.";
    if (!form.email.trim()) return "Email is required.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return "Please enter a valid email address.";
    if (form.password.length < 8) return "Password must be at least 8 characters.";
    if (form.password !== form.confirmPassword) return "Passwords do not match.";
    return null;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const v = validate();
    if (v) { setError(v); return; }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const { data } = await api.post("/api/company/auth/register", {
        CompanyName: form.companyName.trim(),
        Email: form.email.trim().toLowerCase(),
        Password: form.password,
      });

      // Backend returns: message + status, no token (pending approval)
      setSuccess(
        data?.message ||
        "Company registered successfully. Waiting for admin approval."
      );

      // Optional: take them to login after short delay, but no background timers required.
      // We keep it simple: show success and provide a button.
    } catch (err) {
      const msg = err.response?.data;
      if (err.response?.status === 409) {
        setError("This email is already registered. Try logging in instead.");
      } else if (typeof msg === "string") {
        setError(msg);
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page auth-register-page" style={{
      height: "calc(100vh - 65px)",
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      overflow: "hidden",
    }}>
      {/* Left panel */}
      <div className="auth-page-side" style={{
        background: "linear-gradient(145deg, #0A2472 0%, #1a3a8f 100%)",
        display: "flex",
        flexDirection: "column",
        position: "relative",
        overflow: "hidden",
        height: "100%",
      }}>
        <div style={{ position: "absolute", top: -60, right: -60, width: 280, height: 280, borderRadius: "50%", background: "rgba(46,196,182,0.1)" }} />
        <div style={{ position: "absolute", bottom: -80, left: -40, width: 320, height: 320, borderRadius: "50%", background: "rgba(255,107,107,0.06)" }} />

        {/* Logo */}
        <div style={{ position: "relative", zIndex: 1, padding: "32px 48px 0" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 38, height: 38, borderRadius: 12,
              background: "#2EC4B6", display: "grid", placeItems: "center",
              color: "white", fontWeight: 900, fontSize: 13, fontFamily: "'Sora', sans-serif",
            }}>PF</div>
            <div>
              <div style={{ fontWeight: 800, fontSize: 15, color: "white", fontFamily: "'Sora', sans-serif" }}>PathFinder</div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)" }}>Internship & Job Platform</div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "0 48px",
          position: "relative",
          zIndex: 1,
        }}>
          <h2 style={{
            fontSize: 34, fontWeight: 900, color: "white",
            lineHeight: 1.1, marginBottom: 16, fontFamily: "'Sora', sans-serif",
          }}>
            Register your<br />
            <span style={{ color: "#2EC4B6" }}>company</span> today.
          </h2>
          <p style={{ color: "rgba(255,255,255,0.65)", fontSize: 15, lineHeight: 1.7, marginBottom: 40, maxWidth: 360 }}>
            Company accounts require admin approval before you can log in and access your dashboard.
          </p>

          <div style={{ display: "grid", gap: 16 }}>
            {[
              { icon: "✅", text: "Create a verified company account" },
              { icon: "🛡️", text: "Admin approval for platform safety" },
              { icon: "📌", text: "Post jobs & manage applicants after approval" },
            ].map((f) => (
              <div key={f.text} style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 12,
                  background: "rgba(46,196,182,0.15)",
                  display: "grid", placeItems: "center",
                  fontSize: 18, flexShrink: 0,
                }}>{f.icon}</div>
                <p style={{ color: "rgba(255,255,255,0.75)", fontSize: 14, lineHeight: 1.5 }}>{f.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="auth-page-form" style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        padding: "0 64px",
        background: "white",
        height: "100%",
        overflowY: "auto",
      }}>
        <div style={{ width: "100%", maxWidth: 420 }} className="auth-form-shell animate-fade-up">
          <div style={{ marginBottom: 32 }}>
            <h1 style={{ fontSize: 32, fontWeight: 900, color: "var(--text)", marginBottom: 10, fontFamily: "'Sora', sans-serif" }}>
              Company Registration
            </h1>
            <p className="helper" style={{ fontSize: 15 }}>
              Create your company account (admin approval required).
            </p>
          </div>

          {error && (
            <div className="alert error animate-fade-in" style={{ marginBottom: 20 }}>
              ⚠️ {error}
            </div>
          )}

          {success && (
            <div className="alert success animate-fade-in" style={{ marginBottom: 20 }}>
              ✅ {success}
              <div style={{ marginTop: 10 }}>
                <Link className="btn btn-outline btn-sm" to="/company/login">
                  Go to Company Login →
                </Link>
              </div>
            </div>
          )}

          <form onSubmit={onSubmit}>
            <div className="form-row">
              <div>
                <label className="label" htmlFor="companyName" style={{ fontSize: 14 }}>Company name</label>
                <input
                  id="companyName"
                  className="input"
                  type="text"
                  name="companyName"
                  placeholder="ABC Pvt Ltd"
                  value={form.companyName}
                  onChange={onChange}
                  required
                  style={{ fontSize: 15, padding: "14px 16px" }}
                />
              </div>

              <div>
                <label className="label" htmlFor="email" style={{ fontSize: 14 }}>Company email</label>
                <input
                  id="email"
                  className="input"
                  type="email"
                  name="email"
                  placeholder="company@example.com"
                  value={form.email}
                  onChange={onChange}
                  autoComplete="email"
                  required
                  style={{ fontSize: 15, padding: "14px 16px" }}
                />
              </div>

              <div>
                <label className="label" htmlFor="password" style={{ fontSize: 14 }}>Password</label>
                <div style={{ position: "relative" }}>
                  <input
                    id="password"
                    className="input"
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="At least 8 characters"
                    value={form.password}
                    onChange={onChange}
                    autoComplete="new-password"
                    required
                    style={{ paddingRight: 44, fontSize: 15, padding: "14px 44px 14px 16px" }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    style={{
                      position: "absolute", right: 12, top: "50%",
                      transform: "translateY(-50%)", background: "none",
                      border: "none", color: "var(--muted)", cursor: "pointer",
                      fontSize: 16, padding: 4,
                    }}
                    title={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? "🙈" : "👁️"}
                  </button>
                </div>
                <StrengthBar password={form.password} />
              </div>

              <div>
                <label className="label" htmlFor="confirmPassword" style={{ fontSize: 14 }}>Confirm password</label>
                <input
                  id="confirmPassword"
                  className="input"
                  type="password"
                  name="confirmPassword"
                  placeholder="Re-enter your password"
                  value={form.confirmPassword}
                  onChange={onChange}
                  autoComplete="new-password"
                  required
                  style={{
                    fontSize: 15, padding: "14px 16px",
                    borderColor: form.confirmPassword && form.password !== form.confirmPassword
                      ? "var(--coral)" : undefined,
                  }}
                />
                {form.confirmPassword && form.password !== form.confirmPassword && (
                  <p style={{ fontSize: 12, color: "var(--coral)", marginTop: 4 }}>Passwords don't match</p>
                )}
                {form.confirmPassword && form.password === form.confirmPassword && form.password && (
                  <p style={{ fontSize: 12, color: "var(--teal)", marginTop: 4 }}>✓ Passwords match</p>
                )}
              </div>

              <p style={{ fontSize: 12, color: "var(--muted)", lineHeight: 1.6 }}>
                By registering, you agree to PathFinder's terms of service and privacy policy.
              </p>

              <button
                type="submit"
                className="btn btn-teal"
                disabled={loading}
                style={{
                  width: "100%", justifyContent: "center",
                  padding: "14px 24px", fontSize: 15,
                  opacity: loading ? 0.7 : 1,
                }}
              >
                {loading ? "Creating account…" : "Register Company →"}
              </button>
            </div>
          </form>

          <hr className="divider" />

          <p style={{ textAlign: "center", fontSize: 14, color: "var(--muted)" }}>
            Already registered?{" "}
            <Link to="/company/login" style={{ color: "var(--primary)", fontWeight: 600 }}>
              Company login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}