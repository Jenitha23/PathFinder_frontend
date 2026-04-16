/**
 * File: src/pages/auth/ResetPassword.jsx
 * Purpose: Reset password page - validates token and allows user to set new password
 */
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { api } from "../../services/api";
import { Eye, EyeOff, CheckCircle, AlertCircle, ArrowLeft } from "lucide-react";

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

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const type = searchParams.get("type")?.toUpperCase();
  
  const [loading, setLoading] = useState(false);
  const [validating, setValidating] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [tokenData, setTokenData] = useState(null);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitted, setSubmitted] = useState(false);

  // Validate token on page load
  useEffect(() => {
    const validateToken = async () => {
      if (!token) {
        setTokenValid(false);
        setValidating(false);
        return;
      }

      try {
        const { data } = await api.post("/api/passwordreset/validate-token", { token });
        setTokenValid(data.valid);
        if (data.valid) {
          setTokenData({ email: data.email, userType: data.userType, expiresAt: data.expiresAt });
        }
      } catch (err) {
        console.error("Token validation error:", err);
        setTokenValid(false);
      } finally {
        setValidating(false);
      }
    };

    validateToken();
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    
    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const { data } = await api.post("/api/passwordreset/reset", {
        token,
        newPassword: password,
        confirmPassword: confirmPassword
      });

      setSuccess(data.message);
      setSubmitted(true);
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        const loginPath = type === "COMPANY" ? "/company/login" : "/student/login";
        navigate(loginPath);
      }, 3000);
      
    } catch (err) {
      const message = err.response?.data?.message || "Failed to reset password. Please try again.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  // Show loading state while validating token
  if (validating) {
    return (
      <div style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #0A2472 0%, #1a3a8f 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}>
        <div className="card" style={{ padding: 40, textAlign: "center", background: "white", borderRadius: 16 }}>
          <div style={{
            width: 40, height: 40, borderRadius: "50%",
            border: "3px solid #e5e7eb",
            borderTopColor: "#2EC4B6",
            animation: "spin 1s linear infinite",
            margin: "0 auto 16px",
          }} />
          <p>Validating your reset link...</p>
        </div>
      </div>
    );
  }

  // Show invalid token message
  if (!tokenValid && !submitted) {
    return (
      <div style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #0A2472 0%, #1a3a8f 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
      }}>
        <div className="card" style={{ maxWidth: 450, padding: "40px 36px", textAlign: "center", background: "white", borderRadius: 16 }}>
          <div style={{
            width: 64, height: 64, borderRadius: "50%",
            background: "#FEE2E2", display: "flex",
            alignItems: "center", justifyContent: "center",
            margin: "0 auto 20px"
          }}>
            <AlertCircle size={32} color="#EF4444" />
          </div>
          <h2 style={{ marginBottom: 12 }}>Invalid Reset Link</h2>
          <p style={{ color: "#6B7280", marginBottom: 24 }}>
            This password reset link is invalid or has expired.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
            <Link
              to="/auth/forgot-password"
              style={{
                padding: "10px 20px",
                background: "#2563EB",
                color: "white",
                borderRadius: 8,
                textDecoration: "none"
              }}
            >
              Request New Link
            </Link>
            <Link
              to="/auth/choose"
              style={{
                padding: "10px 20px",
                background: "white",
                color: "#4B5563",
                borderRadius: 8,
                textDecoration: "none",
                border: "1px solid #E5E7EB"
              }}
            >
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Show success message after reset
  if (submitted) {
    const loginPath = type === "COMPANY" ? "/company/login" : "/student/login";
    return (
      <div style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #0A2472 0%, #1a3a8f 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
      }}>
        <div className="card" style={{ maxWidth: 450, padding: "40px 36px", textAlign: "center", background: "white", borderRadius: 16 }}>
          <div style={{
            width: 64, height: 64, borderRadius: "50%",
            background: "#D1FAE5", display: "flex",
            alignItems: "center", justifyContent: "center",
            margin: "0 auto 20px"
          }}>
            <CheckCircle size={32} color="#10B981" />
          </div>
          <h2 style={{ marginBottom: 12 }}>Password Reset Successful!</h2>
          <p style={{ color: "#6B7280", marginBottom: 16 }}>{success}</p>
          <p style={{ fontSize: 13, color: "#9CA3AF" }}>
            Redirecting you to login page...
          </p>
          <Link
            to={loginPath}
            style={{
              display: "inline-block",
              marginTop: 16,
              padding: "10px 20px",
              background: "#2563EB",
              color: "white",
              borderRadius: 8,
              textDecoration: "none"
            }}
          >
            Login Now →
          </Link>
        </div>
      </div>
    );
  }

  // Show reset password form
  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #0A2472 0%, #1a3a8f 100%)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "40px 20px",
    }}>
      <div style={{ width: "100%", maxWidth: 500 }}>
        <div style={{ background: "white", padding: "40px 36px", borderRadius: 24, boxShadow: "0 20px 60px rgba(0,0,0,0.1)" }}>
          
          {/* Header */}
          <div style={{ textAlign: "center", marginBottom: 32 }}>
            <div style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              background: "#E6F7F5",
              color: "#0D9488",
              padding: "4px 12px",
              borderRadius: 20,
              fontSize: 12,
              fontWeight: 600,
              marginBottom: 12
            }}>
              🔒 Create New Password
            </div>
            <h1 style={{ fontSize: 28, fontWeight: 800, fontFamily: "'Sora', sans-serif", marginBottom: 8, color: "#1F2937" }}>
              Reset Your Password
            </h1>
            {tokenData?.email && (
              <p style={{ fontSize: 13, color: "#6B7280" }}>
                For: <strong style={{ color: "#1F2937" }}>{tokenData.email}</strong>
              </p>
            )}
            {tokenData?.expiresAt && (
              <p style={{ fontSize: 12, color: "#9CA3AF", marginTop: 4 }}>
                Link expires at: {new Date(tokenData.expiresAt).toLocaleString()}
              </p>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div style={{
              background: "#FEE2E2",
              color: "#EF4444",
              padding: "12px 16px",
              borderRadius: 8,
              marginBottom: 20,
              display: "flex",
              alignItems: "center",
              gap: 8,
              fontSize: 14
            }}>
              <AlertCircle size={16} /> {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* New Password */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: "block", fontSize: 14, fontWeight: 600, marginBottom: 8, color: "#374151" }}>
                New Password
              </label>
              <div style={{ position: "relative" }}>
                <input
                  type={showPassword ? "text" : "password"}
                  className="input"
                  placeholder="At least 8 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  style={{ width: "100%", padding: "12px 40px 12px 16px", fontSize: 15, borderRadius: 8, border: "1px solid #E5E7EB" }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: "absolute", right: 12, top: "50%",
                    transform: "translateY(-50%)", background: "none",
                    border: "none", cursor: "pointer",
                    padding: 4, display: "flex", alignItems: "center",
                  }}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <StrengthBar password={password} />
            </div>

            {/* Confirm Password */}
            <div style={{ marginBottom: 24 }}>
              <label style={{ display: "block", fontSize: 14, fontWeight: 600, marginBottom: 8, color: "#374151" }}>
                Confirm Password
              </label>
              <div style={{ position: "relative" }}>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  className="input"
                  placeholder="Re-enter your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  style={{
                    width: "100%",
                    padding: "12px 40px 12px 16px",
                    fontSize: 15,
                    borderRadius: 8,
                    border: confirmPassword && password !== confirmPassword ? "1px solid #EF4444" : "1px solid #E5E7EB"
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={{
                    position: "absolute", right: 12, top: "50%",
                    transform: "translateY(-50%)", background: "none",
                    border: "none", cursor: "pointer",
                    padding: 4, display: "flex", alignItems: "center",
                  }}
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {confirmPassword && password !== confirmPassword && (
                <p style={{ fontSize: 12, color: "#EF4444", marginTop: 4 }}>Passwords do not match</p>
              )}
              {confirmPassword && password === confirmPassword && password && (
                <p style={{ fontSize: 12, color: "#10B981", marginTop: 4 }}>✓ Passwords match</p>
              )}
            </div>

            {/* Password Requirements Checklist */}
            <div style={{ marginBottom: 24, padding: "12px 16px", background: "#F9FAFB", borderRadius: 10 }}>
              <p style={{ fontSize: 12, fontWeight: 600, marginBottom: 8, color: "#6B7280" }}>Password requirements:</p>
              <div style={{ display: "grid", gap: 4 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ color: password.length >= 8 ? "#10B981" : "#9CA3AF" }}>
                    {password.length >= 8 ? "✓" : "○"}
                  </span>
                  <span style={{ fontSize: 12, color: password.length >= 8 ? "#10B981" : "#6B7280" }}>
                    At least 8 characters
                  </span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ color: /[A-Z]/.test(password) ? "#10B981" : "#9CA3AF" }}>
                    {/[A-Z]/.test(password) ? "✓" : "○"}
                  </span>
                  <span style={{ fontSize: 12, color: /[A-Z]/.test(password) ? "#10B981" : "#6B7280" }}>
                    At least one uppercase letter
                  </span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ color: /[0-9]/.test(password) ? "#10B981" : "#9CA3AF" }}>
                    {/[0-9]/.test(password) ? "✓" : "○"}
                  </span>
                  <span style={{ fontSize: 12, color: /[0-9]/.test(password) ? "#10B981" : "#6B7280" }}>
                    At least one number
                  </span>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !password || !confirmPassword || password !== confirmPassword || password.length < 8}
              style={{
                width: "100%",
                padding: "14px",
                background: "#2563EB",
                color: "white",
                border: "none",
                borderRadius: 8,
                fontSize: 15,
                fontWeight: 600,
                cursor: "pointer",
                opacity: loading || !password || !confirmPassword || password !== confirmPassword || password.length < 8 ? 0.7 : 1,
              }}
            >
              {loading ? "Resetting Password..." : "Reset Password →"}
            </button>

            {/* Back to Login Link */}
            <div style={{ textAlign: "center", marginTop: 20 }}>
              <Link
                to={type === "COMPANY" ? "/company/login" : "/student/login"}
                style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 14, color: "#6B7280", textDecoration: "none" }}
                onMouseEnter={(e) => e.currentTarget.style.color = "#0D9488"}
                onMouseLeave={(e) => e.currentTarget.style.color = "#6B7280"}
              >
                <ArrowLeft size={14} /> Back to Login
              </Link>
            </div>
          </form>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}