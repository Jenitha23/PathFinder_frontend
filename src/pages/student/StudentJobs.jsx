import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { jobsApi } from "../../services/jobs";
import JobCard from "../../components/student/jobs/JobCard";
import JobFilters from "../../components/student/jobs/JobFilters";
import Pagination from "../../components/student/jobs/Pagination";

const PAGE_SIZE = 6;

export default function StudentJobs() {
  const [jobs, setJobs] = useState([]);
  const [page, setPage] = useState(1);
  const [pageData, setPageData] = useState({
    totalPages: 0,
    totalItems: 0,
    hasNextPage: false,
    hasPreviousPage: false,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [searchInput, setSearchInput] = useState("");
  const [keyword, setKeyword] = useState("");
  const [location, setLocation] = useState("");
  const [type, setType] = useState("");
  const [category, setCategory] = useState("");

  const params = useMemo(
    () => ({
      page,
      pageSize: PAGE_SIZE,
      keyword: keyword || undefined,
      location: location || undefined,
      type: type || undefined,
      category: category || undefined,
    }),
    [page, keyword, location, type, category]
  );

  const getErrorMessage = (err, fallback) => {
    const data = err?.response?.data;
    if (typeof data === "string") return data;
    return data?.message || data?.error || fallback;
  };

  useEffect(() => {
    let ignore = false;

    const loadJobs = async () => {
      try {
        setLoading(true);
        setError("");

        const { data } = await jobsApi.getJobs(params);
        if (ignore) return;

        setJobs(data?.items || []);
        setPageData({
          totalPages: data?.totalPages || 0,
          totalItems: data?.totalItems || 0,
          hasNextPage: data?.hasNextPage || false,
          hasPreviousPage: data?.hasPreviousPage || false,
        });
      } catch (err) {
        if (!ignore) {
          setError(getErrorMessage(err, "Failed to load jobs."));
        }
      } finally {
        if (!ignore) setLoading(false);
      }
    };

    loadJobs();

    return () => {
      ignore = true;
    };
  }, [params]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    setKeyword(searchInput.trim());
  };

  const clearFilters = () => {
    setSearchInput("");
    setKeyword("");
    setLocation("");
    setType("");
    setCategory("");
    setPage(1);
  };

  return (
    <div style={{ minHeight: "calc(100vh - 65px)", background: "var(--bg)", paddingBottom: 70 }}>
      <div
        style={{
          background: "linear-gradient(135deg, #0A2472 0%, #1a3a8f 100%)",
          padding: "54px 0 86px",
        }}
      >
        <div className="container">
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
              Search, filter, and open job listings using real backend data.
            </p>
          </div>
        </div>
      </div>

      <div className="container" style={{ marginTop: -44 }}>
        <JobFilters
          searchInput={searchInput}
          setSearchInput={setSearchInput}
          location={location}
          setLocation={setLocation}
          type={type}
          setType={setType}
          category={category}
          setCategory={setCategory}
          onSearch={handleSearch}
          onClear={clearFilters}
        />

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
              {loading ? "Loading jobs..." : `${pageData.totalItems} total job(s) found`}
            </div>
          </div>

          <Link to="/student/home" className="btn btn-ghost">
            ← Back to dashboard
          </Link>
        </div>

        {error ? <div className="alert error">{error}</div> : null}

        {loading ? (
          <div className="card" style={{ padding: 26, textAlign: "center", color: "var(--muted)" }}>
            Loading job listings...
          </div>
        ) : jobs.length === 0 ? (
          <div className="card" style={{ padding: 30, textAlign: "center" }}>
            <div style={{ fontSize: 46, marginBottom: 10 }}>📭</div>
            <h3 style={{ marginBottom: 8 }}>No jobs found</h3>
            <p className="helper">
              Try a different keyword or adjust the filters.
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
              {jobs.map((job) => (
                <JobCard key={job.id} job={job} />
              ))}
            </div>

            <Pagination
              page={page}
              totalPages={pageData.totalPages}
              onPageChange={setPage}
            />
          </>
        )}
      </div>
    </div>
  );
}