import { useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";

function ChooseRoleCard({ icon, title, desc, accentColor, accentBg, action, onClick, delay }) {
  return (
    <button
      type="button"
      className="auth-choose-role-card animate-fade-up"
      onClick={onClick}
      style={{ animationDelay: delay, "--accent": accentColor, "--accent-bg": accentBg }}
    >
      <div className="auth-choose-role-icon" style={{ background: accentBg, color: accentColor }}>
        {icon}
      </div>
      <div className="auth-choose-role-title">{title}</div>
      <p className="auth-choose-role-desc">{desc}</p>
      <div className="auth-choose-role-action" style={{ color: accentColor }}>
        {action} <span>{"->"}</span>
      </div>
    </button>
  );
}

export default function AuthChoose() {
  const location = useLocation();
  const nav = useNavigate();

  const mode = useMemo(() => {
    const q = new URLSearchParams(location.search);
    const m = (q.get("mode") || "login").toLowerCase();
    return m === "register" ? "register" : "login";
  }, [location.search]);

  return (
    <div className="auth-choose-page">
      <div className="auth-choose-bg-dot" />
      <div className="auth-choose-bg-glow" />

      <div className="container auth-choose-container">
        <div className="auth-choose-header">
          <div className="badge badge-teal" style={{ marginBottom: 12 }}>
            Role selection
          </div>
          <h1>{mode === "login" ? "Sign In" : "Create Account"}</h1>
          <p>Choose your role to continue.</p>
          <div className="auth-choose-mode-tabs">
            <button
              type="button"
              className={`auth-mode-tab ${mode === "login" ? "active" : ""}`}
              onClick={() => nav("/auth/choose?mode=login")}
            >
              Login mode
            </button>
            <button
              type="button"
              className={`auth-mode-tab ${mode === "register" ? "active" : ""}`}
              onClick={() => nav("/auth/choose?mode=register")}
            >
              Register mode
            </button>
          </div>
        </div>

        <div className="auth-choose-grid">
          <ChooseRoleCard
            icon="ST"
            title="Student"
            desc="Register, build your profile, upload your CV, and browse and apply for internship and job opportunities."
            accentColor="var(--primary)"
            accentBg="var(--primary-dim)"
            action={mode === "login" ? "Continue to Student Login" : "Continue to Student Register"}
            onClick={() => nav(mode === "login" ? "/student/login" : "/student/register")}
            delay="0.05s"
          />

          <ChooseRoleCard
            icon="CO"
            title="Company"
            desc="Register your company, post internships and jobs, manage applicants, and update statuses after approval."
            accentColor="var(--teal)"
            accentBg="var(--teal-dim)"
            action={mode === "login" ? "Continue to Company Login" : "Continue to Company Register"}
            onClick={() => nav(mode === "login" ? "/company/login" : "/company/register")}
            delay="0.12s"
          />

          <ChooseRoleCard
            icon="AD"
            title="Admin"
            desc="Manage user accounts, approve or reject company registrations, and monitor platform activity."
            accentColor="var(--coral)"
            accentBg="var(--coral-dim)"
            action="Continue to Admin Login"
            onClick={() => nav("/admin/login")}
            delay="0.2s"
          />
        </div>
      </div>

      <style>{`
        .auth-choose-page {
          min-height: calc(100vh - 65px);
          background: linear-gradient(135deg, #0A2472 0%, #1a3a8f 65%, #0d2d7e 100%);
          position: relative;
          overflow: hidden;
          padding: 46px 0 60px;
        }
        .auth-choose-bg-dot {
          position: absolute;
          inset: 0;
          opacity: 0.05;
          background-image: radial-gradient(circle, white 1px, transparent 1px);
          background-size: 28px 28px;
        }
        .auth-choose-bg-glow {
          position: absolute;
          width: 500px;
          height: 500px;
          border-radius: 50%;
          right: -160px;
          top: -140px;
          background: radial-gradient(circle, rgba(46,196,182,0.2) 0%, transparent 72%);
        }
        .auth-choose-container {
          position: relative;
          z-index: 1;
        }
        .auth-choose-header {
          text-align: center;
          margin-bottom: 30px;
        }
        .auth-choose-header h1 {
          font-size: clamp(30px, 4vw, 42px);
          color: white;
          font-weight: 900;
          font-family: 'Sora', sans-serif;
          margin-bottom: 8px;
        }
        .auth-choose-header p {
          color: rgba(255,255,255,0.78);
          font-size: 15px;
        }
        .auth-choose-mode-tabs {
          margin-top: 14px;
          display: inline-flex;
          background: rgba(255,255,255,0.1);
          border: 1px solid rgba(255,255,255,0.22);
          border-radius: 999px;
          padding: 4px;
          gap: 4px;
        }
        .auth-mode-tab {
          background: transparent;
          color: rgba(255,255,255,0.75);
          border: none;
          border-radius: 999px;
          padding: 8px 14px;
          font-size: 13px;
          font-weight: 700;
          transition: background 0.2s ease, color 0.2s ease, transform 0.2s ease;
        }
        .auth-mode-tab:hover {
          transform: translateY(-1px);
          color: white;
        }
        .auth-mode-tab.active {
          background: rgba(46,196,182,0.25);
          border: 1px solid rgba(46,196,182,0.42);
          color: #dffef9;
        }
        .auth-choose-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 20px;
        }
        .auth-choose-role-card {
          display: block;
          width: 100%;
          background: white;
          border: 1.5px solid #dce8f0;
          border-radius: 20px;
          padding: 24px 22px;
          box-shadow: 0 4px 24px rgba(10,36,114,0.08);
          transition: transform 0.24s ease, box-shadow 0.24s ease, border-color 0.24s ease;
          cursor: pointer;
          text-align: left;
          position: relative;
          overflow: hidden;
          transform: translateY(0) scale(1);
        }
        .auth-choose-role-card::after {
          content: "";
          position: absolute;
          inset: auto -15% -22%;
          height: 44%;
          background: radial-gradient(ellipse at center, color-mix(in srgb, var(--accent) 26%, transparent) 0%, transparent 70%);
          opacity: 0;
          transition: opacity 0.24s ease;
          pointer-events: none;
        }
        .auth-choose-role-card::before {
          content: "";
          position: absolute;
          inset: -60% auto -60% -40%;
          width: 42%;
          background: linear-gradient(120deg, transparent 0%, rgba(255,255,255,0.9) 45%, transparent 100%);
          transform: translateX(-260%) rotate(14deg);
          transition: transform 0.65s ease;
          pointer-events: none;
        }
        .auth-choose-role-card:hover {
          transform: translateY(-10px) scale(1.015);
          box-shadow: 0 26px 54px rgba(10,36,114,0.2);
          border-color: var(--accent);
        }
        .auth-choose-role-card:hover::after {
          opacity: 1;
        }
        .auth-choose-role-card:hover::before {
          transform: translateX(540%) rotate(14deg);
        }
        .auth-choose-role-card:active {
          transform: translateY(-5px) scale(0.995);
        }
        .auth-choose-role-icon {
          width: 52px;
          height: 52px;
          border-radius: 16px;
          display: grid;
          place-items: center;
          font-size: 15px;
          font-weight: 800;
          margin-bottom: 14px;
          transition: transform 0.24s ease, box-shadow 0.24s ease;
        }
        .auth-choose-role-card:hover .auth-choose-role-icon {
          transform: translateY(-2px) scale(1.08);
          box-shadow: 0 12px 22px rgba(10,36,114,0.16);
        }
        .auth-choose-role-title {
          font-weight: 800;
          font-size: 17px;
          margin-bottom: 6px;
          font-family: 'Sora', sans-serif;
          color: var(--text);
        }
        .auth-choose-role-desc {
          color: var(--muted);
          margin-bottom: 18px;
          line-height: 1.6;
          font-size: 15px;
          min-height: 128px;
        }
        .auth-choose-role-action {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-weight: 700;
          font-size: 15px;
        }
        .auth-choose-role-action span {
          font-size: 18px;
          transition: transform 0.22s ease;
        }
        .auth-choose-role-card:hover .auth-choose-role-action span {
          transform: translateX(6px);
        }
        @media (max-width: 1200px) {
          .auth-choose-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }
        @media (max-width: 780px) {
          .auth-choose-page {
            padding: 30px 0 40px;
          }
          .auth-choose-grid {
            grid-template-columns: 1fr;
            gap: 14px;
          }
          .auth-choose-role-desc {
            min-height: 0;
          }
          .auth-choose-mode-tabs {
            width: 100%;
            max-width: 330px;
          }
          .auth-mode-tab {
            flex: 1;
          }
        }
      `}</style>
    </div>
  );
}
