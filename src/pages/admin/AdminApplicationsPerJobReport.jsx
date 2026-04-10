/**
 * File: src/pages/admin/AdminApplicationsPerJobReport.jsx
 * Purpose: Admin report page for applications per job (all companies)
 */
import { useEffect, useState } from "react";
import AdminLayout from "../../components/admin/AdminLayout";
import CompanyApplicationsPerJobChart from "../../components/company/CompanyApplicationsPerJobChart";
import CompanyApplicationsFilterBar from "../../components/company/CompanyApplicationsFilterBar";
import { useApplicationsPerJobReport } from "../../hooks/useApplicationsPerJobReport";
import { api } from "../../services/api";

export default function AdminApplicationsPerJobReport() {
  const { data, loading, error, isEmpty, filters, updateFilters, refresh } =
    useApplicationsPerJobReport("admin");
  const [allJobs, setAllJobs] = useState([]);
  const [loadingJobs, setLoadingJobs] = useState(true);

  // Load all jobs for the job filter dropdown (admin can filter by any job)
  useEffect(() => {
    const loadAllJobs = async () => {
      try {
        // Fetch all jobs (paginated, but we can get a reasonable limit)
        const { data: jobsData } = await api.get("/api/jobs?pageSize=500");
        setAllJobs(jobsData.items || []);
      } catch (err) {
        console.error("Failed to load jobs:", err);
      } finally {
        setLoadingJobs(false);
      }
    };
    loadAllJobs();
  }, []);

  const handleBarClick = (job) => {
    // Optional: navigate to company details or job applicants
    console.log("Clicked job:", job);
  };

  return (
    <AdminLayout 
      title="Applications Per Job Report" 
      subtitle="Monitor applicant activity across all companies"
    >
      {error && (
        <div className="alert error" style={{ marginBottom: 16 }}>
          {error}
        </div>
      )}

      <CompanyApplicationsFilterBar
        filters={filters}
        onFilterChange={updateFilters}
        loading={loading}
        jobs={allJobs}
        showJobFilter={allJobs.length > 0}
      />

      <div className="card" style={{ padding: 20, marginTop: 20 }}>
        <h3 style={{ marginBottom: 16, fontSize: 18 }}>Applications Per Job</h3>
        <CompanyApplicationsPerJobChart data={data} loading={loading} onBarClick={handleBarClick} />
      </div>

      {!loading && !isEmpty && data?.items?.length > 0 && (
        <div className="helper" style={{ textAlign: "right", marginTop: 12 }}>
          Showing {data.items.length} job(s) from {data.totalJobs} total with {data.totalApplications} applications
        </div>
      )}
    </AdminLayout>
  );
}