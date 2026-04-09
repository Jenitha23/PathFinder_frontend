/**
 * File: src/pages/admin/AdminJobsPerMonthReport.jsx
 * Purpose: Admin report page for jobs posted per month (all companies)
 */
import { useState } from "react";
import AdminLayout from "../../components/admin/AdminLayout";
import CompanyJobsPerMonthChart from "../../components/company/CompanyJobsPerMonthChart";
import CompanyDateRangeFilter from "../../components/company/CompanyDateRangeFilter";
import { useCompanyJobsPerMonthReport } from "../../hooks/useCompanyJobsPerMonthReport";

export default function AdminJobsPerMonthReport() {
  const { data, loading, error, isEmpty, filters, updateFilters, refresh } =
    useCompanyJobsPerMonthReport("admin");

  return (
    <AdminLayout title="Jobs Per Month Report" subtitle="Track job posting trends across all companies">
      {error && <div className="alert error" style={{ marginBottom: 16 }}>{error}</div>}

      <CompanyDateRangeFilter filters={filters} onFilterChange={updateFilters} loading={loading} />

      <div className="card" style={{ padding: 20, marginTop: 20 }}>
        <h3 style={{ marginBottom: 16, fontSize: 18 }}>Jobs Posted Per Month (All Companies)</h3>
        <CompanyJobsPerMonthChart data={data} loading={loading} />
      </div>

      {!loading && !isEmpty && data?.labels?.length > 0 && (
        <div className="helper" style={{ textAlign: "right", marginTop: 12 }}>
          Showing {data.labels.length} months
        </div>
      )}
    </AdminLayout>
  );
}