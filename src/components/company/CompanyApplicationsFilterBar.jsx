/**
 * File: src/components/company/CompanyApplicationsFilterBar.jsx
 * Purpose: Filter bar for applications per job report (reusable for both roles)
 */
import { useState, useEffect } from "react";

export default function CompanyApplicationsFilterBar({ 
  filters, 
  onFilterChange, 
  loading,
  jobs = [],        // Optional list of jobs for job dropdown (admin can pass all jobs)
  showJobFilter = true   // Admin shows job dropdown, company may also show if multiple jobs
}) {
  const [jobId, setJobId] = useState(filters.jobId || "");
  const [startDate, setStartDate] = useState(filters.startDate || "");
  const [endDate, setEndDate] = useState(filters.endDate || "");

  // Sync external filter changes
  useEffect(() => {
    setJobId(filters.jobId || "");
    setStartDate(filters.startDate || "");
    setEndDate(filters.endDate || "");
  }, [filters]);

  const handleApply = () => {
    onFilterChange({ jobId, startDate, endDate });
  };

  const handleReset = () => {
    setJobId("");
    setStartDate("");
    setEndDate("");
    onFilterChange({ jobId: "", startDate: "", endDate: "" });
  };

  return (
    <div className="card" style={{ padding: 16, marginBottom: 20 }}>
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap", alignItems: "flex-end" }}>
        {showJobFilter && jobs.length > 0 && (
          <div style={{ minWidth: 200 }}>
            <label className="label" style={{ fontSize: 12, marginBottom: 4 }}>
              Filter by Job
            </label>
            <select
              className="input"
              value={jobId}
              onChange={(e) => setJobId(e.target.value)}
              disabled={loading}
            >
              <option value="">All Jobs</option>
              {jobs.map((job) => (
                <option key={job.id} value={job.id}>
                  {job.title} ({job.companyName})
                </option>
              ))}
            </select>
          </div>
        )}

        <div>
          <label className="label" style={{ fontSize: 12, marginBottom: 4 }}>
            From Date
          </label>
          <input
            type="date"
            className="input"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            disabled={loading}
          />
        </div>

        <div>
          <label className="label" style={{ fontSize: 12, marginBottom: 4 }}>
            To Date
          </label>
          <input
            type="date"
            className="input"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            disabled={loading}
          />
        </div>

        <button
          className="btn btn-primary btn-sm"
          onClick={handleApply}
          disabled={loading}
          style={{ height: 38 }}
        >
          Apply
        </button>

        <button
          className="btn btn-outline btn-sm"
          onClick={handleReset}
          disabled={loading}
          style={{ height: 38 }}
        >
          Reset
        </button>
      </div>
    </div>
  );
}