import { Link } from "react-router-dom";
import { isLoggedIn, getAuth } from "../services/auth";

// ── Hero Showcase — user benefit focused, no tech stack mentions ──────────
function HeroShowcase() {
  const features = [
    { icon: "🎯", label: "Find the right opportunity", desc: "Browse internships & jobs matched to you", color: "var(--primary-dim)" },
    { icon: "📄", label: "Apply with your CV", desc: "One profile, apply to any listing", color: "var(--teal-dim)" },
    { icon: "📬", label: "Get notified instantly", desc: "Know when your status changes", color: "rgba(255,159,28,0.10)" },
    { icon: "📊", label: "Track every application", desc: "Pending · Approved · Rejected", color: "var(--coral-dim)" },
  ];

  return (
    <div style={{ position: "relative", display: "flex", justifyContent: "center", alignItems: "center" }}>
      <div style={{
        position: "absolute", width: 340, height: 340, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(46,196,182,0.13) 0%, transparent 70%)",
        top: "50%", left: "50%", transform: "translate(-50%,-50%)",
        animation: "float 6s ease-in-out infinite",
      }} />

      <div style={{
        background: "white", borderRadius: 24, padding: "24px 22px",
        boxShadow: "0 20px 60px rgba(10,36,114,0.14)", width: 330,
        position: "relative", animation: "float 5s ease-in-out infinite",
        border: "1px solid #dce8f0",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20, paddingBottom: 16, borderBottom: "1px solid var(--border)" }}>
          <div style={{
            width: 40, height: 40, borderRadius: 12, background: "var(--primary)",
            display: "grid", placeItems: "center", color: "white",
            fontWeight: 900, fontSize: 13, fontFamily: "'Sora', sans-serif",
          }}>PF</div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 14, color: "var(--text)" }}>PathFinder</div>
            <div style={{ fontSize: 11, color: "var(--muted)" }}>Smart Internship Management</div>
          </div>
          <div style={{ marginLeft: "auto" }}>
            <span className="badge badge-teal" style={{ fontSize: 11 }}>● Live</span>
          </div>
        </div>

        <div style={{ display: "grid", gap: 10 }}>
          {features.map((f, i) => (
            <div key={i} style={{
              display: "flex", alignItems: "center", gap: 12,
              padding: "10px 12px", borderRadius: 12,
              background: "var(--bg)", border: "1px solid var(--border)",
            }}>
              <div style={{
                width: 36, height: 36, borderRadius: 10, background: f.color,
                display: "grid", placeItems: "center", fontSize: 18, flexShrink: 0,
              }}>{f.icon}</div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 13, color: "var(--text)" }}>{f.label}</div>
                <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 1 }}>{f.desc}</div>
              </div>
              <div style={{ marginLeft: "auto", width: 8, height: 8, borderRadius: "50%", background: "var(--teal)" }} />
            </div>
          ))}
        </div>
      </div>

      <div style={{
        position: "absolute", top: 0, right: -24,
        background: "white", borderRadius: 14, padding: "10px 14px",
        boxShadow: "0 8px 24px rgba(10,36,114,0.12)", border: "1px solid var(--border)",
        animation: "float 4s ease-in-out infinite 1s", fontSize: 12, fontWeight: 600,
      }}>
        🎉 It's free for students!
        <div style={{ fontSize: 11, color: "var(--teal)", fontWeight: 500, marginTop: 2 }}>No credit card needed</div>
      </div>

      <div style={{
        position: "absolute", bottom: 16, left: -28,
        background: "var(--primary)", borderRadius: 14, padding: "10px 14px",
        boxShadow: "0 8px 24px rgba(10,36,114,0.22)",
        animation: "float 5s ease-in-out infinite 0.5s",
        fontSize: 12, fontWeight: 600, color: "white",
      }}>
        ✅ Application submitted!
        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.65)", fontWeight: 500, marginTop: 2 }}>Company will review soon</div>
      </div>
    </div>
  );
}

// ── Role Card ──────────────────────────────────────────────────────────────
function RoleCard({ emoji, title, desc, to, accentColor, accentBg, delay }) {
  return (
    <Link to={to} className="animate-fade-up" style={{ animationDelay: delay }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = "translateY(-4px)";
        e.currentTarget.style.boxShadow = "0 16px 40px rgba(10,36,114,0.12)";
        e.currentTarget.style.borderColor = accentColor;
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "0 4px 24px rgba(10,36,114,0.08)";
        e.currentTarget.style.borderColor = "#dce8f0";
      }}
      style={{
        display: "block", background: "white", border: "1.5px solid #dce8f0",
        borderRadius: 20, padding: "24px 22px",
        boxShadow: "0 4px 24px rgba(10,36,114,0.08)",
        transition: "all 0.22s ease", cursor: "pointer",
      }}>
      <div style={{ width: 52, height: 52, borderRadius: 16, background: accentBg, display: "grid", placeItems: "center", fontSize: 24, marginBottom: 14 }}>{emoji}</div>
      <div style={{ fontWeight: 800, fontSize: 17, marginBottom: 6, fontFamily: "'Sora', sans-serif" }}>{title}</div>
      <p className="helper" style={{ marginBottom: 18, lineHeight: 1.6 }}>{desc}</p>
      <div style={{ display: "inline-flex", alignItems: "center", gap: 6, color: accentColor, fontWeight: 600, fontSize: 14 }}>
        Get started <span style={{ fontSize: 18 }}>→</span>
      </div>
    </Link>
  );
}

// ── Step Card ──────────────────────────────────────────────────────────────
function StepCard({ number, title, desc, delay }) {
  return (
    <div className="animate-fade-up" style={{ animationDelay: delay }}>
      <div style={{
        width: 42, height: 42, borderRadius: 13, background: "var(--primary)",
        color: "white", display: "grid", placeItems: "center",
        fontWeight: 800, fontSize: 16, marginBottom: 16, fontFamily: "'Sora', sans-serif",
      }}>{number}</div>
      <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 8 }}>{title}</div>
      <p className="helper" style={{ lineHeight: 1.6 }}>{desc}</p>
    </div>
  );
}

// ── Feature Card ───────────────────────────────────────────────────────────
function FeatureCard({ icon, title, desc, color, bg, delay }) {
  return (
    <div className="card animate-fade-up" style={{ padding: "24px 22px", animationDelay: delay, borderTop: `3px solid ${color}` }}>
      <div style={{ width: 48, height: 48, borderRadius: 14, background: bg, display: "grid", placeItems: "center", fontSize: 22, marginBottom: 16 }}>{icon}</div>
      <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 8, fontFamily: "'Sora', sans-serif" }}>{title}</div>
      <p className="helper" style={{ lineHeight: 1.6 }}>{desc}</p>
    </div>
  );
}

// ── Main ───────────────────────────────────────────────────────────────────
export default function Landing() {
  const loggedIn = isLoggedIn();
  const auth = loggedIn ? getAuth() : null;

  return (
    <div style={{ minHeight: "100vh" }}>

      {/* HERO */}
      <section style={{
        background: "linear-gradient(135deg, #0A2472 0%, #1a3a8f 60%, #0d2d7e 100%)",
        padding: "80px 0 100px", position: "relative", overflow: "hidden",
      }}>
        <div style={{ position: "absolute", inset: 0, opacity: 0.04, backgroundImage: `radial-gradient(circle, white 1px, transparent 1px)`, backgroundSize: "32px 32px" }} />
        <div style={{ position: "absolute", top: -100, right: -100, width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle, rgba(46,196,182,0.15) 0%, transparent 60%)" }} />

        <div className="container">
          <div className="grid-2">
            <div style={{ display: "grid", gap: 24 }}>
              {loggedIn ? (
                <div className="animate-fade-up" style={{
                  display: "inline-flex", alignItems: "center", gap: 8,
                  background: "rgba(46,196,182,0.15)", border: "1px solid rgba(46,196,182,0.3)",
                  borderRadius: 999, padding: "6px 14px",
                  color: "#2EC4B6", fontSize: 13, fontWeight: 600, width: "fit-content",
                }}>
                  <span style={{ display: "inline-block", width: 8, height: 8, borderRadius: "50%", background: "#2EC4B6" }} />
                  Welcome back, {auth.fullName || auth.email}
                </div>
              ) : (
                <div className="animate-fade-up" style={{
                  display: "inline-flex", alignItems: "center", gap: 8,
                  background: "rgba(46,196,182,0.15)", border: "1px solid rgba(46,196,182,0.3)",
                  borderRadius: 999, padding: "6px 14px",
                  color: "#2EC4B6", fontSize: 13, fontWeight: 600, width: "fit-content",
                }}>
                  🎓 PathFinder – Smart Internship Management System
                </div>
              )}

              <h1 className="animate-fade-up animate-delay-1" style={{ fontSize: "clamp(36px, 5vw, 58px)", fontWeight: 900, color: "white", lineHeight: 1.05 }}>
                Find Your <span style={{ color: "#2EC4B6" }}>Path.</span><br />Build Your Future.
              </h1>

              <p className="animate-fade-up animate-delay-2" style={{ fontSize: 17, color: "rgba(255,255,255,0.75)", maxWidth: 480, lineHeight: 1.7 }}>
                PathFinder is a smart internship management system that connects students with internship and job opportunities, and helps companies discover and manage talent — all through a secure, role-based platform.
              </p>

              <div className="animate-fade-up animate-delay-3" style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                {loggedIn ? (
                  <Link className="btn btn-teal btn-lg" to="/student/home">Go to Dashboard →</Link>
                ) : (
                  <>
                    <Link className="btn btn-teal btn-lg" to="/student/register">Get Started Free</Link>
                    <Link className="btn btn-lg" to="/student/login" style={{ background: "rgba(255,255,255,0.1)", color: "white", border: "1.5px solid rgba(255,255,255,0.2)" }}>Sign In</Link>
                  </>
                )}
              </div>

              <div className="animate-fade-up animate-delay-4" style={{ display: "flex", gap: 20, flexWrap: "wrap", marginTop: 8 }}>
                {[
                  { icon: "✓", text: "Free for students" },
                  { icon: "✓", text: "Apply with one click" },
                  { icon: "✓", text: "Track every application" },
                ].map(t => (
                  <div key={t.text} style={{ display: "flex", alignItems: "center", gap: 6, color: "rgba(255,255,255,0.6)", fontSize: 13 }}>
                    <span style={{ color: "#2EC4B6", fontWeight: 700 }}>{t.icon}</span> {t.text}
                  </div>
                ))}
              </div>
            </div>

            <div className="animate-fade-up animate-delay-2" style={{ display: "flex", justifyContent: "center" }}>
              <HeroShowcase />
            </div>
          </div>
        </div>
      </section>

      {/* WHAT YOU GET */}
      <section style={{ background: "white", borderBottom: "1px solid var(--border)", padding: "60px 0" }}>
        <div className="container">
          <div style={{ textAlign: "center", marginBottom: 40 }}>
            <div className="badge badge-primary" style={{ marginBottom: 10 }}>What you get</div>
            <h2 style={{ fontSize: 30, fontWeight: 900, color: "var(--text)", fontFamily: "'Sora', sans-serif" }}>Everything you need to land your internship</h2>
            <p className="helper" style={{ marginTop: 8, maxWidth: 480, margin: "8px auto 0" }}>
              PathFinder handles the whole journey — from finding the right opportunity to hearing back from companies.
            </p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
            <FeatureCard icon="🎯" title="Discover Opportunities"
              desc="Browse and search internships and job listings. Filter by role, industry, and more to find what suits you."
              color="var(--primary)" bg="var(--primary-dim)" delay="0.1s" />
            <FeatureCard icon="📋" title="One-Click Apply"
              desc="Build your profile once, upload your CV, and apply to any listing directly through the platform."
              color="var(--teal)" bg="var(--teal-dim)" delay="0.2s" />
            <FeatureCard icon="📬" title="Stay in the Loop"
              desc="Track every application you've submitted. Know your status — Pending, Approved, or Rejected — at any time."
              color="#FF9F1C" bg="rgba(255,159,28,0.10)" delay="0.3s" />
            <FeatureCard icon="🏢" title="Connect with Companies"
              desc="Real companies post verified opportunities. Apply with confidence knowing listings are managed and reviewed."
              color="#FF6B6B" bg="var(--coral-dim)" delay="0.4s" />
          </div>
        </div>
        <style>{`@media (max-width: 900px) { .feat-grid { grid-template-columns: 1fr 1fr !important; } }`}</style>
      </section>

      {/* ROLES */}
      <section id="roles" style={{ padding: "80px 0" }}>
        <div className="container">
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <div className="badge badge-primary" style={{ marginBottom: 12 }}>Role-based access</div>
            <h2 style={{ fontSize: 36, fontWeight: 900, color: "var(--text)" }}>Choose your role</h2>
            <p className="helper" style={{ marginTop: 10, maxWidth: 500, margin: "10px auto 0" }}>
              PathFinder provides dedicated dashboards for students, companies, and administrators — each with tailored features and access control.
            </p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
            <RoleCard emoji="🎓" title="Student"
              desc="Register, build your profile, upload your CV, and browse & apply for internship and job opportunities. Track your application status in real time."
              to="/student/login" accentColor="var(--primary)" accentBg="var(--primary-dim)" delay="0.1s" />
            <RoleCard emoji="🏢" title="Company"
              desc="Register your company, post internship and job listings, manage applicants, and update application statuses after admin approval."
              to="/company/login" accentColor="var(--teal)" accentBg="var(--teal-dim)" delay="0.2s" />
            <RoleCard emoji="🛡️" title="Admin"
              desc="Manage user accounts, approve or reject company registrations, monitor platform activity, and access analytics and system reports."
              to="/admin/login" accentColor="#FF6B6B" accentBg="var(--coral-dim)" delay="0.3s" />
          </div>
          <style>{`@media (max-width: 900px) { #roles > div > div:last-child { grid-template-columns: 1fr !important; } }`}</style>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" style={{ background: "white", borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)", padding: "80px 0" }}>
        <div className="container">
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <div className="badge badge-teal" style={{ marginBottom: 12 }}>How it works</div>
            <h2 style={{ fontSize: 36, fontWeight: 900, color: "var(--text)" }}>Land your internship in 4 simple steps</h2>
            <p className="helper" style={{ marginTop: 10, maxWidth: 440, margin: "10px auto 0" }}>
              PathFinder makes it easy to go from zero to hired — all in one place.
            </p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 32 }}>
            <StepCard number="1" title="Create your account"
              desc="Sign up in minutes as a student. It's completely free — just your name, email, and a password."
              delay="0.1s" />
            <StepCard number="2" title="Build your profile"
              desc="Add your skills, education, and experience. Upload your CV so companies can learn more about you."
              delay="0.2s" />
            <StepCard number="3" title="Browse & apply"
              desc="Explore internship and job listings posted by verified companies. Apply to the ones that interest you."
              delay="0.3s" />
            <StepCard number="4" title="Track & get hired"
              desc="Follow your applications in real time. See when a company reviews, approves, or moves you forward."
              delay="0.4s" />
          </div>
          <style>{`@media (max-width: 900px) { #how > div > div:last-child { grid-template-columns: 1fr 1fr !important; } }`}</style>
        </div>
      </section>

      {/* CTA */}
      {!loggedIn && (
        <section style={{ background: "linear-gradient(135deg, #0A2472 0%, #1a3a8f 100%)", padding: "64px 0", textAlign: "center" }}>
          <div className="container">
            <h2 className="animate-fade-up" style={{ fontSize: 36, fontWeight: 900, color: "white", marginBottom: 14 }}>
              Ready to start your internship journey?
            </h2>
            <p className="animate-fade-up animate-delay-1" style={{ color: "rgba(255,255,255,0.7)", marginBottom: 28, fontSize: 16 }}>
              Join PathFinder — Sri Lanka's Smart Internship Management System. Free for students, built for real opportunities.
            </p>
            <div className="animate-fade-up animate-delay-2" style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
              <Link className="btn btn-teal btn-lg" to="/student/register">Create Free Account</Link>
              <Link className="btn btn-lg" to="/student/login" style={{ background: "rgba(255,255,255,0.1)", color: "white", border: "1.5px solid rgba(255,255,255,0.25)" }}>Sign In Instead</Link>
            </div>
          </div>
        </section>
      )}

      {/* FOOTER */}
      <footer style={{ background: "var(--text)", padding: "32px 0", color: "rgba(255,255,255,0.5)", fontSize: 13, textAlign: "center" }}>
        <div className="container">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 10 }}>
            <div style={{ width: 30, height: 30, borderRadius: 10, background: "var(--teal)", display: "grid", placeItems: "center", color: "white", fontWeight: 900, fontSize: 12 }}>PF</div>
            <span style={{ color: "white", fontWeight: 700 }}>PathFinder</span>
          </div>
          <p>© {new Date().getFullYear()} PathFinder – Smart Internship Management System. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}