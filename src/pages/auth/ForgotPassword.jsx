/**
 * File: src/pages/auth/ForgotPassword.jsx
 * Purpose: Forgot password page - user enters email to receive reset link
 * Follows styling pattern from StudentLogin.jsx
 */
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { usePasswordReset } from "../../hooks/usePasswordReset";
import { Mail, ArrowLeft, CheckCircle, AlertCircle } from "lucide-react";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const { forgotPassword, loading, error, success, clearState } = usePasswordReset();
  
  const [email, setEmail] = useState("");
  const [userType, setUserType] = useState("STUDENT");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearState();
    
    if (!email.trim()) {
      return;
    }
    
    const result = await forgotPassword(email, userType);
    if (result.success) {
      setSubmitted(true);
    }
  };

  const handleBackToLogin = () => {
    if (userType === "STUDENT") {
      navigate("/student/login");
    } else {
      navigate("/company/login");
    }
  };

  return (
    <div className="auth-page" style={{
      minHeight: "calc(100vh - 65px)",
      background: "linear-gradient(135deg, #0A2472 0%, #1a3a8f 100%)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "40px 20px",
    }}>
      <div className="container" style={{ maxWidth: 500 }}>
        <div className="card animate-fade-up" style={{ padding: "40px 36px", borderRadius: 24 }}>
          
          {/* Header */}
          <div style={{ textAlign: "center", marginBottom: 32 }}>
            <div className="badge badge-teal" style={{ marginBottom: 12, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <Mail size={14} /> Reset Password
            </div>
            <h1 style={{ fontSize: 28, fontWeight: 800, fontFamily: "'Sora', sans-serif", marginBottom: 8 }}>
              Forgot Password?
            </h1>
            <p className="helper" style={{ fontSize: 14 }}>
              {!submitted 
                ? "Enter your email address and we'll send you a link to reset your password."
                : "Check your email for the reset link"}
            </p>
          </div>

          {/* Success Message */}
          {success && !submitted && (
            <div className="alert success animate-fade-in" style={{ marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
              <CheckCircle size={16} /> {success}
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="alert error animate-fade-in" style={{ marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
              <AlertCircle size={16} /> {error}
            </div>
          )}

          {/* Success Submitted State */}
          {submitted ? (
            <div style={{ textAlign: "center" }}>
              <div style={{
                width: 64, height: 64, borderRadius: "50%",
                background: "var(--teal-dim)", display: "flex",
                alignItems: "center", justifyContent: "center",
                margin: "0 auto 20px"
              }}>
                <Mail size={32} color="var(--teal)" />
              </div>
              <p style={{ marginBottom: 16, lineHeight: 1.6 }}>
                We've sent a password reset link to <strong>{email}</strong>.
              </p>
              <p className="helper" style={{ marginBottom: 24, fontSize: 13 }}>
                The link will expire in 1 hour. Check your spam folder if you don't see it within a few minutes.
              </p>
              <button
                onClick={handleBackToLogin}
                className="btn btn-primary"
                style={{ width: "100%", justifyContent: "center", padding: "12px" }}
              >
                Back to Login
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              {/* User Type Selection */}
              <div style={{ marginBottom: 20 }}>
                <label className="label" style={{ fontSize: 14, marginBottom: 8 }}>Account Type</label>
                <div style={{ display: "flex", gap: 12 }}>
                  <button
                    type="button"
                    onClick={() => setUserType("STUDENT")}
                    style={{
                      flex: 1,
                      padding: "12px",
                      borderRadius: 10,
                      border: `2px solid ${userType === "STUDENT" ? "var(--primary)" : "var(--border)"}`,
                      background: userType === "STUDENT" ? "var(--primary-dim)" : "white",
                      fontWeight: 600,
                      color: userType === "STUDENT" ? "var(--primary)" : "var(--muted)",
                      cursor: "pointer",
                      transition: "all 0.2s",
                    }}
                  >
                    🎓 Student
                  </button>
                  <button
                    type="button"
                    onClick={() => setUserType("COMPANY")}
                    style={{
                      flex: 1,
                      padding: "12px",
                      borderRadius: 10,
                      border: `2px solid ${userType === "COMPANY" ? "var(--teal)" : "var(--border)"}`,
                      background: userType === "COMPANY" ? "var(--teal-dim)" : "white",
                      fontWeight: 600,
                      color: userType === "COMPANY" ? "var(--teal)" : "var(--muted)",
                      cursor: "pointer",
                      transition: "all 0.2s",
                    }}
                  >
                    🏢 Company
                  </button>
                </div>
              </div>

              {/* Email Input */}
              <div style={{ marginBottom: 24 }}>
                <label className="label" htmlFor="email" style={{ fontSize: 14, marginBottom: 8 }}>
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  className="input"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  style={{ fontSize: 15, padding: "14px 16px" }}
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
                style={{
                  width: "100%",
                  justifyContent: "center",
                  padding: "14px",
                  fontSize: 15,
                  fontWeight: 600,
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
                      marginRight: 8,
                    }} />
                    Sending...
                  </>
                ) : (
                  "Send Reset Link →"
                )}
              </button>

              {/* Back to Login Link */}
              <div style={{ textAlign: "center", marginTop: 20 }}>
                <Link
                  to={userType === "STUDENT" ? "/student/login" : "/company/login"}
                  style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 14, color: "var(--muted)" }}
                >
                  <ArrowLeft size={14} /> Back to Login
                </Link>
              </div>
            </form>
          )}
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