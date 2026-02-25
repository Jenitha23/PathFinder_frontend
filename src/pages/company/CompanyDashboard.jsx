import { getAuth } from "../../services/auth";

export default function CompanyDashboard() {
  const auth = getAuth();

  return (
    <div className="container" style={{ padding: "28px 0" }}>
      <div className="card" style={{ padding: 22 }}>
        <div style={{ fontSize: 28, fontWeight: 950, fontFamily: "'Sora', sans-serif" }}>
          Company Dashboard
        </div>
        <div className="helper" style={{ marginTop: 8 }}>
          You are logged in as <b>{auth.fullName || auth.email}</b> ({auth.role}).
        </div>

        <hr className="divider" />

        <div style={{ display: "grid", gap: 12 }}>
          <div className="card" style={{ padding: 16 }}>
            <div style={{ fontWeight: 800 }}>📌 Post a Job / Internship</div>
            <div className="helper" style={{ marginTop: 6 }}>
              Coming soon — will be enabled when job posting endpoints are added.
            </div>
          </div>

          <div className="card" style={{ padding: 16 }}>
            <div style={{ fontWeight: 800 }}>👥 View Applicants</div>
            <div className="helper" style={{ marginTop: 6 }}>
              Coming soon — will be enabled when applicant endpoints are added.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}