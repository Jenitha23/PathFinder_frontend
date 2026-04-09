/**
 * File: src/pages/company/CompanyJobsPerMonthReport.jsx
 * Purpose: Company report page for jobs posted per month
 */
import { useMemo } from "react";
import { useAuth } from "../../context/AuthContext";
import CompanyJobsPerMonthChart from "../../components/company/CompanyJobsPerMonthChart";
import CompanyDateRangeFilter from "../../components/company/CompanyDateRangeFilter";
import { useCompanyJobsPerMonthReport } from "../../hooks/useCompanyJobsPerMonthReport";

// Simple layout wrapper (assumes you have a CompanyLayout component, otherwise replace)
// If no company layout exists, you can use a simple div with padding.
const CompanyLayout = ({ children }) => (
  <div className="company-dashboard" style={{ padding: "24px", maxWidth: 1400, margin: "0 auto" }}>
    <div style={{ marginBottom: 24 }}>
      <h1>Jobs Per Month Report</h1>
      <p className="helper">Track your job posting trends over time.</p>
    </div>
    {children}
  </div>
);

export default function CompanyJobsPerMonthReport() {
  const auth = useAuth();
  const { data, loading, error, isEmpty, filters, updateFilters, refresh } =
    useCompanyJobsPerMonthReport();

  // Ensure only COMPANY role can access (though backend enforces)
  if (auth.role !== "COMPANY") {
    return (
      <CompanyLayout>
        <div className="alert error">You are not authorized to view this page.</div>
      </CompanyLayout>
    );
  }

  return (
    <CompanyLayout>
      {error && (
        <div className="alert error" style={{ marginBottom: 16 }}>
          {error}
        </div>
      )}

      <CompanyDateRangeFilter filters={filters} onFilterChange={updateFilters} loading={loading} />

      <div className="card" style={{ padding: 20, marginTop: 20 }}>
        <h3 style={{ marginBottom: 16, fontSize: 18 }}>Jobs Posted Per Month</h3>
        <CompanyJobsPerMonthChart data={data} loading={loading} />
      </div>

      {!loading && !isEmpty && data?.datasets?.[0]?.data?.length > 0 && (
        <div className="helper" style={{ textAlign: "right", marginTop: 12 }}>
          Showing {data.labels?.length || 0} months
        </div>
      )}
    </CompanyLayout>
  );
}