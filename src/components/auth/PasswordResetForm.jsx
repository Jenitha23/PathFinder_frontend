/**
 * File: src/components/auth/PasswordResetForm.jsx
 * Purpose: Reusable password reset form component
 * Follows styling pattern from other components like JobFilters.jsx
 */
import { useState } from "react";
import { Eye, EyeOff, Mail, ArrowLeft, CheckCircle, AlertCircle } from "lucide-react";
import { Link } from "react-router-dom";

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

export function ForgotPasswordForm({ onSubmit, loading, error, success }) {
  const [email, setEmail] = useState("");
  const [userType, setUserType] = useState("STUDENT");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email.trim()) {
      onSubmit(email, userType);
    }
  };

  return (
    <div className="card animate-fade-up" style={{ padding: "32px 28px", borderRadius: 20 }}>
      <div style={{ textAlign: "center", marginBottom: 24 }}>
        <div className="badge badge-teal" style={{ marginBottom: 12, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <Mail size={14} /> Reset Password
        </div>
        <h2 style={{ fontSize: 24, fontWeight: 700, fontFamily: "'Sora', sans-serif", marginBottom: 8 }}>
          Forgot Password?
        </h2>
        <p className="helper" style={{ fontSize: 14 }}>
          Enter your email and we'll send you a reset link
        </p>
      </div>

      {error && (
        <div className="alert error animate-fade-in" style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
          <AlertCircle size={16} /> {error}
        </div>
      )}

      {success && (
        <div className="alert success animate-fade-in" style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
          <CheckCircle size={16} /> {success}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 20 }}>
          <label className="label" style={{ fontSize: 13, marginBottom: 6 }}>Account Type</label>
          <div style={{ display: "flex", gap: 10 }}>
            <button
              type="button"
              onClick={() => setUserType("STUDENT")}
              style={{
                flex: 1, padding: "10px", borderRadius: 8,
                border: `2px solid ${userType === "STUDENT" ? "var(--primary)" : "var(--border)"}`,
                background: userType === "STUDENT" ? "var(--primary-dim)" : "white",
                fontWeight: 600, fontSize: 13,
                color: userType === "STUDENT" ? "var(--primary)" : "var(--muted)",
                cursor: "pointer", transition: "all 0.2s",
              }}
            >
              🎓 Student
            </button>
            <button
              type="button"
              onClick={() => setUserType("COMPANY")}
              style={{
                flex: 1, padding: "10px", borderRadius: 8,
                border: `2px solid ${userType === "COMPANY" ? "var(--teal)" : "var(--border)"}`,
                background: userType === "COMPANY" ? "var(--teal-dim)" : "white",
                fontWeight: 600, fontSize: 13,
                color: userType === "COMPANY" ? "var(--teal)" : "var(--muted)",
                cursor: "pointer", transition: "all 0.2s",
              }}
            >
              🏢 Company
            </button>
          </div>
        </div>

        <div style={{ marginBottom: 24 }}>
          <label className="label" htmlFor="reset-email" style={{ fontSize: 13, marginBottom: 6 }}>
            Email Address
          </label>
          <input
            id="reset-email"
            type="email"
            className="input"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ fontSize: 14, padding: "12px 14px" }}
          />
        </div>

        <button
          type="submit"
          className="btn btn-primary"
          disabled={loading}
          style={{ width: "100%", justifyContent: "center", padding: "12px", fontSize: 14 }}
        >
          {loading ? "Sending..." : "Send Reset Link →"}
        </button>
      </form>

      <div style={{ textAlign: "center", marginTop: 16 }}>
        <Link
          to={userType === "STUDENT" ? "/student/login" : "/company/login"}
          style={{ fontSize: 13, color: "var(--muted)", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 4 }}
          onMouseEnter={(e) => e.currentTarget.style.color = "var(--teal)"}
          onMouseLeave={(e) => e.currentTarget.style.color = "var(--muted)"}
        >
          <ArrowLeft size={12} /> Back to Login
        </Link>
      </div>
    </div>
  );
}

export function ResetPasswordForm({ 
  onSubmit, 
  loading, 
  error, 
  success, 
  tokenData,
  onBackToLogin 
}) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (password === confirmPassword && password.length >= 8) {
      onSubmit(password, confirmPassword);
    }
  };

  const isFormValid = password && confirmPassword && password === confirmPassword && password.length >= 8;

  return (
    <div className="card animate-fade-up" style={{ padding: "32px 28px", borderRadius: 20 }}>
      <div style={{ textAlign: "center", marginBottom: 24 }}>
        <div className="badge badge-teal" style={{ marginBottom: 12, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          🔒 Create New Password
        </div>
        <h2 style={{ fontSize: 24, fontWeight: 700, fontFamily: "'Sora', sans-serif", marginBottom: 8 }}>
          Reset Your Password
        </h2>
        {tokenData?.email && (
          <p className="helper" style={{ fontSize: 13 }}>
            For: <strong>{tokenData.email}</strong>
          </p>
        )}
      </div>

      {error && (
        <div className="alert error animate-fade-in" style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
          <AlertCircle size={16} /> {error}
        </div>
      )}

      {success && (
        <div className="alert success animate-fade-in" style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
          <CheckCircle size={16} /> {success}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 16 }}>
          <label className="label" htmlFor="new-password" style={{ fontSize: 13, marginBottom: 6 }}>
            New Password
          </label>
          <div style={{ position: "relative" }}>
            <input
              id="new-password"
              type={showPassword ? "text" : "password"}
              className="input"
              placeholder="At least 8 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{ fontSize: 14, padding: "12px 40px 12px 14px" }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: "absolute", right: 10, top: "50%",
                transform: "translateY(-50%)", background: "none",
                border: "none", color: "var(--muted)", cursor: "pointer",
                padding: 4, display: "flex", alignItems: "center",
              }}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          <StrengthBar password={password} />
        </div>

        <div style={{ marginBottom: 20 }}>
          <label className="label" htmlFor="confirm-password" style={{ fontSize: 13, marginBottom: 6 }}>
            Confirm Password
          </label>
          <div style={{ position: "relative" }}>
            <input
              id="confirm-password"
              type={showConfirmPassword ? "text" : "password"}
              className="input"
              placeholder="Re-enter your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              style={{
                fontSize: 14, padding: "12px 40px 12px 14px",
                borderColor: confirmPassword && password !== confirmPassword ? "var(--coral)" : undefined,
              }}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              style={{
                position: "absolute", right: 10, top: "50%",
                transform: "translateY(-50%)", background: "none",
                border: "none", color: "var(--muted)", cursor: "pointer",
                padding: 4, display: "flex", alignItems: "center",
              }}
            >
              {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {confirmPassword && password !== confirmPassword && (
            <p style={{ fontSize: 11, color: "var(--coral)", marginTop: 4 }}>Passwords do not match</p>
          )}
          {confirmPassword && password === confirmPassword && password && (
            <p style={{ fontSize: 11, color: "var(--teal)", marginTop: 4 }}>✓ Passwords match</p>
          )}
        </div>

        {/* Password Requirements */}
        <div style={{ marginBottom: 20, padding: "10px 14px", background: "var(--bg)", borderRadius: 8 }}>
          <p style={{ fontSize: 11, fontWeight: 600, marginBottom: 6, color: "var(--muted)" }}>Password requirements:</p>
          <div style={{ display: "grid", gap: 3 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ fontSize: 10, color: password.length >= 8 ? "var(--teal)" : "var(--muted)" }}>
                {password.length >= 8 ? "✓" : "○"}
              </span>
              <span style={{ fontSize: 11, color: password.length >= 8 ? "var(--teal)" : "var(--muted)" }}>
                At least 8 characters
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ fontSize: 10, color: /[A-Z]/.test(password) ? "var(--teal)" : "var(--muted)" }}>
                {/[A-Z]/.test(password) ? "✓" : "○"}
              </span>
              <span style={{ fontSize: 11, color: /[A-Z]/.test(password) ? "var(--teal)" : "var(--muted)" }}>
                At least one uppercase letter
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ fontSize: 10, color: /[0-9]/.test(password) ? "var(--teal)" : "var(--muted)" }}>
                {/[0-9]/.test(password) ? "✓" : "○"}
              </span>
              <span style={{ fontSize: 11, color: /[0-9]/.test(password) ? "var(--teal)" : "var(--muted)" }}>
                At least one number
              </span>
            </div>
          </div>
        </div>

        <button
          type="submit"
          className="btn btn-primary"
          disabled={loading || !isFormValid}
          style={{ width: "100%", justifyContent: "center", padding: "12px", fontSize: 14 }}
        >
          {loading ? "Resetting..." : "Reset Password →"}
        </button>
      </form>

      <div style={{ textAlign: "center", marginTop: 16 }}>
        <button
          onClick={onBackToLogin}
          style={{
            fontSize: 13, color: "var(--muted)", background: "none",
            border: "none", cursor: "pointer", display: "inline-flex",
            alignItems: "center", gap: 4
          }}
          onMouseEnter={(e) => e.currentTarget.style.color = "var(--teal)"}
          onMouseLeave={(e) => e.currentTarget.style.color = "var(--muted)"}
        >
          <ArrowLeft size={12} /> Back to Login
        </button>
      </div>
    </div>
  );
}