import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { jobsApi } from "../../services/jobs";

const PAGE_SIZE = 6;

export default function StudentJobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");

  const [keyword, setKeyword] = useState("");
  const [searchInput, setSearchInput] = useState("");

  const [location, setLocation] = useState("");
  const [type, setType] = useState("");
  const [category, setCategory] = useState("");
  const [company, setCompany] = useState("");

  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);

  const getErrorMessage = (err, fallback) => {
    const data = err?.response?.data;
    if (typeof data === "string") return data;
    return data?.message || data?.error || fallback;
  };

  const params = useMemo(
    () => ({
      page,
      pageSize: PAGE_SIZE,
      keyword: keyword || undefined,
      location: location || undefined,
      type: type || undefined,
      category: category || undefined,
      company: company || undefined,
    }),
    [page, keyword, location, type, category, company],
  );

  useEffect(() => {
    let ignore = false;

    const loadJobs = async () => {
      try {
        setError("");
        if (page === 1) setLoading(true);
        else setLoadingMore(true);

        const { data } = await jobsApi.getJobs(params);
        if (ignore) return;

        const nextJobs = Array.isArray(data.items) ? data.items : [];
        setHasNextPage(data.hasNextPage || false);

        setJobs((prev) => (page === 1 ? nextJobs : [...prev, ...nextJobs]));
      } catch (err) {
        if (!ignore) {
          setError(getErrorMessage(err, "Failed to load jobs."));
        }
      } finally {
        if (!ignore) {
          setLoading(false);
          setLoadingMore(false);
        }
      }
    };

    loadJobs();
    return () => {
      ignore = true;
    };
  }, [params, page]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    setKeyword(searchInput.trim());
  };

  const handleFilterChange = (setter) => (e) => {
    setter(e.target.value);
    setPage(1);
  };

  const clearFilters = () => {
    setSearchInput("");
    setKeyword("");
    setLocation("");
    setType("");
    setCategory("");
    setCompany("");
    setPage(1);
  };

  return (
    <div style={{ minHeight: "calc(100vh - 65px)", background: "var(--bg)", paddingBottom: 70 }}>
      <div
        style={{
          background: "linear-gradient(135deg, #0A2472 0%, #1a3a8f 100%)",
          padding: "54px 0 86px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: -80,
            right: -90,
            width: 320,
            height: 320,
            borderRadius: "50%",
            background: "rgba(46,196,182,0.10)",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            opacity: 0.04,
            backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />

        <div className="container" style={{ position: "relative" }}>
          <div style={{ maxWidth: 760 }}>
            <div
              className="badge"
              style={{
                background: "rgba(255,255,255,0.12)",
                color: "white",
                marginBottom: 18,
                border: "1px solid rgba(255,255,255,0.18)",
              }}
            >
              🔍 Student Job Portal
            </div>

            <h1 style={{ color: "white", fontSize: "clamp(2rem, 4vw, 3.2rem)", marginBottom: 14 }}>
              Browse jobs and internships that fit your future.
            </h1>

            <p style={{ color: "rgba(255,255,255,0.82)", fontSize: 16, maxWidth: 650, lineHeight: 1.8 }}>
              Search by title or company, filter by category, location, and job type, then open each
              listing to see full details before applying.
            </p>
          </div>
        </div>
      </div>

      <div className="container" style={{ marginTop: -44 }}>
        <div
          className="card"
          style={{
            padding: 20,
            borderRadius: 22,
            boxShadow: "var(--shadow-lg)",
            marginBottom: 28,
          }}
        >
          <form onSubmit={handleSearch}>
            <div
              style={{
                display: "grid",
                gap: 14,
                gridTemplateColumns: "2fr 1fr 1fr 1fr auto",
                alignItems: "end",
              }}
            >
              <div>
                <label className="label">Search by title, keyword, or company</label>
                <input
                  className="input"
                  type="text"
                  placeholder="Try: Java, React, WSO2, internship..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                />
              </div>

              <div>
                <label className="label">Location</label>
                <select className="input" value={location} onChange={handleFilterChange(setLocation)}>
                  <option value="">All locations</option>
                  <option value="Colombo">Colombo</option>
                  <option value="Negombo">Negombo</option>
                  <option value="Kandy">Kandy</option>
                  <option value="Galle">Galle</option>
                  <option value="Remote">Remote</option>
                </select>
              </div>

              <div>
                <label className="label">Job type</label>
                <select className="input" value={type} onChange={handleFilterChange(setType)}>
                  <option value="">All types</option>
                  <option value="Internship">Internship</option>
                  <option value="Full-time">Full-time</option>
                  <option value="Part-time">Part-time</option>
                  <option value="Contract">Contract</option>
                </select>
              </div>

              <div>
                <label className="label">Category</label>
                <select className="input" value={category} onChange={handleFilterChange(setCategory)}>
                  <option value="">All categories</option>
                  <option value="Software Engineering">Software Engineering</option>
                  <option value="Backend Development">Backend Development</option>
                  <option value="Frontend Development">Frontend Development</option>
                  <option value="Full Stack Development">Full Stack Development</option>
                  <option value="QA Engineering">QA Engineering</option>
                  <option value="DevOps">DevOps</option>
                  <option value="Data Science">Data Science</option>
                  <option value="UI/UX">UI/UX</option>
                </select>
              </div>

              <div style={{ display: "flex", gap: 10 }}>
                <button type="submit" className="btn btn-primary">
                  Search
                </button>
                <button type="button" className="btn btn-outline" onClick={clearFilters}>
                  Clear
                </button>
              </div>
            </div>
          </form>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: 16,
            alignItems: "center",
            marginBottom: 18,
            flexWrap: "wrap",
          }}
        >
          <div>
            <h2 style={{ fontSize: 24, marginBottom: 6 }}>Available opportunities</h2>
            <div className="helper">
              {loading ? "Loading jobs..." : `${jobs.length} job listing(s) loaded`}
            </div>
          </div>

          <Link to="/student/home" className="btn btn-ghost">
            ← Back to dashboard
          </Link>
        </div>

        {error ? (
          <div className="alert error" style={{ marginBottom: 18 }}>
            {error}
          </div>
        ) : null}

        {loading ? (
          <div
            className="card"
            style={{
              padding: 26,
              textAlign: "center",
              color: "var(--muted)",
            }}
          >
            Loading job listings...
          </div>
        ) : jobs.length === 0 ? (
          <div
            className="card"
            style={{
              padding: 30,
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: 46, marginBottom: 10 }}>📭</div>
            <h3 style={{ marginBottom: 8 }}>No jobs found</h3>
            <p className="helper">
              Try a different keyword or adjust the filters to see more opportunities.
            </p>
          </div>
        ) : (
          <>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                gap: 18,
              }}
            >
              {jobs.map((job, index) => (
                <Link
                  key={`${job.id}-${index}`}
                  to={`/student/jobs/${job.id}`}
                  className="card"
                  style={{
                    padding: 22,
                    borderRadius: 20,
                    transition: "transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease",
                    display: "block",
                    background: "var(--card)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-3px)";
                    e.currentTarget.style.boxShadow = "var(--shadow-lg)";
                    e.currentTarget.style.borderColor = "rgba(46,196,182,0.35)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "var(--shadow)";
                    e.currentTarget.style.borderColor = "var(--border)";
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
                      <div style={{ color: "var(--text)", fontWeight: 600 }}>{job.companyName}</div>
                    </div>
                    <span className="badge badge-teal">{job.type || "Open"}</span>
                  </div>

                  <div style={{ display: "grid", gap: 10, marginBottom: 18 }}>
                    <div className="helper">📍 {job.location || "Not specified"}</div>
                    <div className="helper">🗂 {job.category || "General"}</div>
                    <div className="helper">
                      ⏳ Deadline:{" "}
                      {job.deadline
                        ? new Date(job.deadline).toLocaleDateString()
                        : "Not specified"}
                    </div>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginTop: 6,
                    }}
                  >
                    <span className="helper">Open details</span>
                    <span style={{ color: "var(--primary)", fontWeight: 700 }}>View →</span>
                  </div>
                </Link>
              ))}
            </div>

            <div style={{ display: "flex", justifyContent: "center", marginTop: 28 }}>
              {hasNextPage ? (
                <button
                  className="btn btn-primary"
                  onClick={() => setPage((prev) => prev + 1)}
                  disabled={loadingMore}
                >
                  {loadingMore ? "Loading..." : "Load More"}
                </button>
              ) : (
                <div className="helper">No more jobs to load.</div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}