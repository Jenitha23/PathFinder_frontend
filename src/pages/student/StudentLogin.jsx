import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../../services/api";
import { saveAuth } from "../../services/auth";

export default function StudentLogin() {
  const nav = useNavigate();

  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const onChange = (e) => {
    setError("");
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!form.email.trim() || !form.password) {
      setError("Please enter your email and password.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const { data } = await api.post("/api/student/auth/login", {
        Email: form.email.trim().toLowerCase(),
        Password: form.password,
      });

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
      if (typeof msg === "string") setError(msg);
      else setError("Invalid email or password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      height: "calc(100vh - 65px)",
      background: "var(--bg)",
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      overflow: "hidden",
    }}>

      {/* ── Left Panel ────────────────────────────────── */}
      <div style={{
        background: "linear-gradient(145deg, #0A2472 0%, #1a3a8f 100%)",
        display: "flex",
        flexDirection: "column",
        position: "relative",
        overflow: "hidden",
        height: "100%",
      }}>
        {/* Background decoration */}
        <div style={{ position: "absolute", top: -80, right: -80, width: 300, height: 300, borderRadius: "50%", background: "rgba(46,196,182,0.12)" }} />
        <div style={{ position: "absolute", bottom: -60, left: -60, width: 250, height: 250, borderRadius: "50%", background: "rgba(46,196,182,0.08)" }} />

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
            fontSize: 38, fontWeight: 900, color: "white",
            lineHeight: 1.15, marginBottom: 16,
            fontFamily: "'Sora', sans-serif",
          }}>
            Welcome back.<br />
            <span style={{ color: "#2EC4B6" }}>Your career</span><br />
            awaits.
          </h2>
          <p style={{ color: "rgba(255,255,255,0.65)", fontSize: 15, lineHeight: 1.7, marginBottom: 40, maxWidth: 340 }}>
            Log in to access your dashboard, track applications, and discover new opportunities.
          </p>

          <div style={{ display: "grid", gap: 16 }}>
            {[
              { icon: "📋", text: "Track all your applications in one place" },
              { icon: "🔔", text: "Get notified on application status changes" },
              { icon: "🎯", text: "AI-matched job recommendations" },
            ].map(f => (
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

      {/* ── Right Panel: Form ──────────────────────────── */}
      <div style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        padding: "0 64px",
        background: "white",
        height: "100%",
        overflowY: "auto",
      }}>
        <div style={{ width: "100%", maxWidth: 400 }} className="animate-fade-up">

          <div style={{ marginBottom: 36 }}>
            <h1 style={{ fontSize: 32, fontWeight: 900, color: "var(--text)", marginBottom: 10, fontFamily: "'Sora', sans-serif" }}>
              Student Login
            </h1>
            <p className="helper" style={{ fontSize: 15 }}>Sign in to your PathFinder account.</p>
          </div>

          {error && (
            <div className="alert error animate-fade-in" style={{ marginBottom: 20 }}>
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={onSubmit}>
            <div className="form-row">

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
                    placeholder="Enter your password"
                    value={form.password}
                    onChange={onChange}
                    autoComplete="current-password"
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
                    title={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? "🙈" : "👁️"}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
                style={{
                  width: "100%", justifyContent: "center",
                  padding: "14px 24px", fontSize: 15,
                  opacity: loading ? 0.7 : 1,
                  marginTop: 4,
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
                    Signing in…
                  </>
                ) : "Sign In →"}
              </button>
            </div>
          </form>

          <hr className="divider" />

          <p style={{ textAlign: "center", fontSize: 14, color: "var(--muted)" }}>
            Don't have an account?{" "}
            <Link to="/student/register" style={{ color: "var(--teal)", fontWeight: 600 }}>
              Create one free
            </Link>
          </p>

          <p style={{ textAlign: "center", fontSize: 13, color: "var(--muted)", marginTop: 24 }}>
            Are you a company?{" "}
            <Link to="/company/login" style={{ color: "var(--primary)" }}>Company login</Link>
          </p>
        </div>
      </div>

      {/* Spinner keyframe */}
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (max-width: 768px) {
          div[style*="gridTemplateColumns: \"1fr 1fr\""] {
            grid-template-columns: 1fr !important;
          }
          div[style*="padding: \"60px 56px\""] {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}