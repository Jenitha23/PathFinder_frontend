import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { jobsApi } from "../../services/jobs";
import { formatDate, formatSalary } from "../../utils/jobFormatters";

export default function StudentJobDetails() {
  const { id } = useParams();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const getErrorMessage = (err, fallback) => {
    const data = err?.response?.data;
    if (typeof data === "string") return data;
    return data?.message || data?.error || fallback;
  };

  useEffect(() => {
    let ignore = false;

    const loadJob = async () => {
      try {
        setLoading(true);
        setError("");

        const { data } = await jobsApi.getJobById(id);
        if (!ignore) setJob(data);
      } catch (err) {
        if (!ignore) setError(getErrorMessage(err, "Failed to load job details."));
      } finally {
        if (!ignore) setLoading(false);
      }
    };

    loadJob();

    return () => {
      ignore = true;
    };
  }, [id]);

  return (
    <div style={{ minHeight: "calc(100vh - 65px)", background: "var(--bg)", padding: "40px 0 70px" }}>
      <div className="container">
        <Link to="/student/jobs" className="btn btn-ghost" style={{ marginBottom: 18 }}>
          ← Back to jobs
        </Link>

        {loading ? (
          <div className="card" style={{ padding: 26, textAlign: "center", color: "var(--muted)" }}>
            Loading job details...
          </div>
        ) : error ? (
          <div className="alert error">{error}</div>
        ) : !job ? (
          <div className="card" style={{ padding: 26, textAlign: "center" }}>
            Job not found.
          </div>
        ) : (
          <>
            <div
              className="card"
              style={{
                padding: "28px 28px 24px",
                borderRadius: 24,
                marginBottom: 22,
                boxShadow: "var(--shadow-lg)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 18,
                  alignItems: "flex-start",
                  flexWrap: "wrap",
                  marginBottom: 18,
                }}
              >
                <div>
                  <div className="badge badge-primary" style={{ marginBottom: 12 }}>
                    💼 Job Details
                  </div>
                  <h1 style={{ fontSize: "clamp(1.8rem, 4vw, 2.7rem)", marginBottom: 10, color: "var(--primary)" }}>
                    {job.title}
                  </h1>
                  <div style={{ fontSize: 18, fontWeight: 600, color: "var(--text)" }}>
                    {job.companyName}
                  </div>
                </div>

                <span className="badge badge-teal">{job.type || "Open"}</span>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                  gap: 14,
                }}
              >
                <div className="card" style={{ padding: 16, borderRadius: 16, boxShadow: "none" }}>
                  <div className="helper">Location</div>
                  <div style={{ fontWeight: 700, marginTop: 4 }}>{job.location || "Not specified"}</div>
                </div>

                <div className="card" style={{ padding: 16, borderRadius: 16, boxShadow: "none" }}>
                  <div className="helper">Category</div>
                  <div style={{ fontWeight: 700, marginTop: 4 }}>{job.category || "General"}</div>
                </div>

                <div className="card" style={{ padding: 16, borderRadius: 16, boxShadow: "none" }}>
                  <div className="helper">Salary</div>
                  <div style={{ fontWeight: 700, marginTop: 4 }}>{formatSalary(job.salary)}</div>
                </div>

                <div className="card" style={{ padding: 16, borderRadius: 16, boxShadow: "none" }}>
                  <div className="helper">Deadline</div>
                  <div style={{ fontWeight: 700, marginTop: 4 }}>{formatDate(job.deadline)}</div>
                </div>
              </div>
            </div>

            <div className="card" style={{ padding: 26, borderRadius: 22 }}>
              <h2 style={{ marginBottom: 14 }}>Full description</h2>
              <div
                style={{
                  color: "var(--text)",
                  lineHeight: 1.8,
                  whiteSpace: "pre-wrap",
                  fontSize: 15,
                }}
              >
                {job.description || "No description available."}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}