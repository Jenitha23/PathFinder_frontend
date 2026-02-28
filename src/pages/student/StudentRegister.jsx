/**
 * File: src/pages/student/StudentRegister.jsx
 * Purpose: Student-facing page for authentication and workflow.
 */
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../../services/api";
import { saveAuth } from "../../services/auth";

// Renders the StrengthBar component.
function StrengthBar({ password }) {
  // Fetches or derives data needed for this section.
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
        {[1, 2, 3, 4].map(i => (
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

// Renders the StudentRegister component.
export default function StudentRegister() {
  const nav = useNavigate();

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Handles onChange event flow and related state updates.
  const onChange = (e) => {
    setError("");
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // Validates input values before submitting data.
  const validate = () => {
    if (!form.fullName.trim()) return "Full name is required.";
    if (!form.email.trim()) return "Email is required.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return "Please enter a valid email address.";
    if (form.password.length < 8) return "Password must be at least 8 characters.";
    if (form.password !== form.confirmPassword) return "Passwords do not match.";
    return null;
  };

  // Handles onSubmit event flow and related state updates.
  const onSubmit = async (e) => {
    e.preventDefault();
    const validationError = validate();
    if (validationError) { setError(validationError); return; }

    setLoading(true);
    setError("");

    try {
      const { data } = await api.post("/api/student/auth/register", {
        FullName: form.fullName.trim(),
        Email:    form.email.trim().toLowerCase(),
        Password: form.password,
      });

      // Backend auto-logs in after register — save the token
      saveAuth({
        token:    data.token,
        role:     data.role,
        userId:   data.userId,
        email:    data.email,
        fullName: data.fullName,
      });

      nav("/student/home");
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

      {/* ── Left: Visual Panel ─────────────────────────── */}
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

        {/* Logo — pinned top */}
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

        {/* Centered content */}
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
            Start your<br />
            <span style={{ color: "#2EC4B6" }}>career journey</span><br />
            today.
          </h2>
          <p style={{ color: "rgba(255,255,255,0.65)", fontSize: 15, lineHeight: 1.7, marginBottom: 40, maxWidth: 340 }}>
            Join thousands of students who found their first internship through PathFinder. It's completely free.
          </p>

          {/* Progress timeline */}
          <div style={{ display: "grid", gap: 0 }}>
            {[
              { step: "1", title: "Create account", desc: "Takes under 2 minutes", done: true },
              { step: "2", title: "Complete profile", desc: "Add skills & experience", done: false },
              { step: "3", title: "Browse & apply", desc: "1,200+ open positions", done: false },
              { step: "4", title: "Get hired 🎉", desc: "Land your dream role", done: false },
            ].map((item, i) => (
              <div key={i} style={{ display: "flex", gap: 14, paddingBottom: i < 3 ? 16 : 0 }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: "50%",
                    background: item.done ? "#2EC4B6" : "rgba(255,255,255,0.12)",
                    display: "grid", placeItems: "center",
                    fontWeight: 700, fontSize: 13, color: "white",
                    border: item.done ? "none" : "1.5px solid rgba(255,255,255,0.2)",
                    flexShrink: 0,
                  }}>{item.done ? "✓" : item.step}</div>
                  {i < 3 && <div style={{ width: 1.5, flex: 1, background: "rgba(255,255,255,0.12)", marginTop: 4 }} />}
                </div>
                <div style={{ paddingTop: 4 }}>
                  <div style={{ fontWeight: 600, color: item.done ? "white" : "rgba(255,255,255,0.7)", fontSize: 14 }}>{item.title}</div>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", marginTop: 2 }}>{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right: Form ────────────────────────────────── */}
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
              Create your account
            </h1>
            <p className="helper" style={{ fontSize: 15 }}>Free forever. No credit card required.</p>
          </div>

          {error && (
            <div className="alert error animate-fade-in" style={{ marginBottom: 20 }}>
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={onSubmit}>
            <div className="form-row">

              {/* Full Name */}
              <div>
                <label className="label" htmlFor="fullName" style={{ fontSize: 14 }}>Full name</label>
                <input
                  id="fullName"
                  className="input"
                  type="text"
                  name="fullName"
                  placeholder="John Perera"
                  value={form.fullName}
                  onChange={onChange}
                  autoComplete="name"
                  required
                  style={{ fontSize: 15, padding: "14px 16px" }}
                />
              </div>

              {/* Email */}
              <div>
                <label className="label" htmlFor="email" style={{ fontSize: 14 }}>Email address</label>
                <input
                  id="email"
                  className="input"
                  type="email"
                  name="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={onChange}
                  autoComplete="email"
                  required
                  style={{ fontSize: 15, padding: "14px 16px" }}
                />
              </div>

              {/* Password */}
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
                    onClick={() => setShowPassword(v => !v)}
                    style={{
                      position: "absolute", right: 12, top: "50%",
                      transform: "translateY(-50%)", background: "none",
                      border: "none", color: "var(--muted)", cursor: "pointer",
                      fontSize: 16, padding: 4,
                    }}
                  >
                    {showPassword ? "ðŸ™ˆ" : "ðŸ‘ï¸"}
                  </button>
                </div>
                <StrengthBar password={form.password} />
              </div>

              {/* Confirm Password */}
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

              {/* Terms note */}
              <p style={{ fontSize: 12, color: "var(--muted)", lineHeight: 1.6 }}>
                By creating an account, you agree to PathFinder's terms of service and privacy policy.
              </p>

              {/* Submit */}
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
                {loading ? (
                  <>
                    <span style={{
                      width: 16, height: 16, borderRadius: "50%",
                      border: "2px solid rgba(255,255,255,0.3)",
                      borderTopColor: "white",
                      animation: "spin 0.7s linear infinite",
                      display: "inline-block",
                    }} />
                    Creating account…
                  </>
                ) : "Create Account →"}
              </button>
            </div>
          </form>

          <hr className="divider" />

          <p style={{ textAlign: "center", fontSize: 14, color: "var(--muted)" }}>
            Already have an account?{" "}
            <Link to="/student/login" style={{ color: "var(--primary)", fontWeight: 600 }}>
              Sign in
            </Link>
          </p>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

