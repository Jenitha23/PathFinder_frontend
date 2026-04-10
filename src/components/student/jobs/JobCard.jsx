import { useState } from "react";
import { Link } from "react-router-dom";
import { formatDate } from "../../../utils/jobFormatters";
import { localSavedJobs } from "../../../services/applications";
import { Bookmark, BookmarkCheck, MapPin, Folder, Clock } from "lucide-react";

export default function JobCard({ job }) {
  const [isSaved, setIsSaved] = useState(() => localSavedJobs.isSaved(job.id));

  const handleToggleSave = (e) => {
    e.preventDefault(); // Stop navigation to details page
    e.stopPropagation();
    const nowSaved = localSavedJobs.toggle(job);
    setIsSaved(nowSaved);
  };

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
        position: "relative",
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
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontWeight: 800,
              fontSize: 19,
              color: "var(--primary)",
              marginBottom: 6,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {job.title}
          </div>
          <div style={{ color: "var(--text)", fontWeight: 600 }}>
            {job.companyName}
          </div>
        </div>

        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <button
            onClick={handleToggleSave}
            title={isSaved ? "Remove from saved" : "Save this job"}
            style={{
              background: isSaved ? "rgba(46,196,182,0.12)" : "rgba(10,36,114,0.06)",
              border: "none",
              width: 38,
              height: 38,
              borderRadius: 12,
              display: "grid",
              placeItems: "center",
              fontSize: 18,
              color: isSaved ? "var(--teal)" : "var(--muted)",
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              if (!isSaved) e.currentTarget.style.background = "rgba(10,36,114,0.12)";
            }}
            onMouseLeave={(e) => {
              if (!isSaved) e.currentTarget.style.background = "rgba(10,36,114,0.06)";
            }}
          >
            {isSaved ? <BookmarkCheck size={20} /> : <Bookmark size={20} />}
          </button>
          <span className="badge badge-teal" style={{ flexShrink: 0 }}>
            {job.type || "Open"}
          </span>
        </div>
      </div>

      <div style={{ display: "grid", gap: 10, marginBottom: 18 }}>
        <div className="helper" style={{ display: 'flex', alignItems: 'center', gap: 6 }}><MapPin size={16} /> {job.location || "Not specified"}</div>
        <div className="helper" style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Folder size={16} /> {job.category || "General"}</div>
        <div className="helper" style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Clock size={16} /> Deadline: {formatDate(job.deadline)}</div>
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