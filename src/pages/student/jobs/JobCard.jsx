import { Link } from "react-router-dom";
import { formatDate } from "../../../utils/jobFormatters";

export default function JobCard({ job }) {
  return (
    <Link
      to={`/student/jobs/${job.id}`}
      className="card"
      style={{
        padding: 22,
        borderRadius: 20,
        display: "block",
        background: "var(--card)",
        transition: "transform 0.18s ease, box-shadow 0.18s ease",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-3px)";
        e.currentTarget.style.boxShadow = "var(--shadow-lg)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "var(--shadow)";
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: 12,
          alignItems: "flex-start",
          marginBottom: 14,
        }}
      >
        <div>
          <div style={{ fontWeight: 800, fontSize: 19, color: "var(--primary)", marginBottom: 6 }}>
            {job.title}
          </div>
          <div style={{ color: "var(--text)", fontWeight: 600 }}>
            {job.companyName}
          </div>
        </div>

        <span className="badge badge-teal">{job.type || "Open"}</span>
      </div>

      <div style={{ display: "grid", gap: 10, marginBottom: 18 }}>
        <div className="helper">📍 {job.location || "Not specified"}</div>
        <div className="helper">🗂 {job.category || "General"}</div>
        <div className="helper">⏳ Deadline: {formatDate(job.deadline)}</div>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <span className="helper">Open details</span>
        <span style={{ color: "var(--primary)", fontWeight: 700 }}>View →</span>
      </div>
    </Link>
  );
}