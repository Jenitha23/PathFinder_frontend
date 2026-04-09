/**
 * File: src/pages/company/CompanyApplicationsPerJobReport.jsx
 * Purpose: Company report page for applications per job
 */
import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import CompanyApplicationsPerJobChart from "../../components/company/CompanyApplicationsPerJobChart";
import CompanyApplicationsFilterBar from "../../components/company/CompanyApplicationsFilterBar";
import { useApplicationsPerJobReport } from "../../hooks/useApplicationsPerJobReport";
import companyJobService from "../../services/companyjobService";

// Simple layout wrapper (assumes you have a CompanyLayout component)
const CompanyLayout = ({ children }) => (
  <div className="company-dashboard" style={{ padding: "24px", maxWidth: 1400, margin: "0 auto" }}>
    <div style={{ marginBottom: 24 }}>
      <h1>Applications Per Job Report</h1>
      <p className="helper">Monitor applicant activity across your job postings.</p>
    </div>
    {children}
  </div>
);

export default function CompanyApplicationsPerJobReport() {
  const auth = useAuth();
  const { data, loading, error, isEmpty, filters, updateFilters, refresh } =
    useApplicationsPerJobReport("company");
  const [jobs, setJobs] = useState([]);
  const [loadingJobs, setLoadingJobs] = useState(true);

  // Load company jobs for the job filter dropdown
  useEffect(() => {
    const loadJobs = async () => {
      try {
        const { data: jobsData } = await companyJobService.getCompanyJobs();
        setJobs(jobsData.jobs || []);
      } catch (err) {
        console.error("Failed to load jobs:", err);
      } finally {
        setLoadingJobs(false);
      }
    };
    loadJobs();
  }, []);

  // Ensure only COMPANY role can access
  if (auth.role !== "COMPANY") {
    return (
      <CompanyLayout>
        <div className="alert error">You are not authorized to view this page.</div>
      </CompanyLayout>
    );
  }

  const handleBarClick = (job) => {
    // Optional: navigate to job applicants page or show details modal
    console.log("Clicked job:", job);
    // window.open(`/company/jobs/${job.jobId}/applicants`, "_blank");
  };

  return (
    <CompanyLayout>
      {error && (
        <div className="alert error" style={{ marginBottom: 16 }}>
          {error}
        </div>
      )}

      <CompanyApplicationsFilterBar
        filters={filters}
        onFilterChange={updateFilters}
        loading={loading}
        jobs={jobs}
        showJobFilter={jobs.length > 0}
      />

      <div className="card" style={{ padding: 20, marginTop: 20 }}>
        <h3 style={{ marginBottom: 16, fontSize: 18 }}>Applications Per Job</h3>
        <CompanyApplicationsPerJobChart data={data} loading={loading} onBarClick={handleBarClick} />
      </div>

      {!loading && !isEmpty && data?.items?.length > 0 && (
        <div className="helper" style={{ textAlign: "right", marginTop: 12 }}>
          Showing {data.items.length} job(s) with total {data.totalApplications} applications
        </div>
      )}
    </CompanyLayout>
  );
}