/**
 * File: src/components/admin/AdminFilterBar.jsx
 * Purpose: Filter bar for admin company list
 */
import { useState } from "react";

const STATUS_OPTIONS = [
  { value: "ALL", label: "All Status" },
  { value: "PENDING_APPROVAL", label: "Pending Approval" },
  { value: "APPROVED", label: "Approved" },
  { value: "REJECTED", label: "Rejected" },
];

const SORT_OPTIONS = [
  { value: "created_at_desc", label: "Newest First" },
  { value: "created_at_asc", label: "Oldest First" },
  { value: "company_name", label: "Company Name (A-Z)" },
  { value: "company_name_desc", label: "Company Name (Z-A)" },
  { value: "status", label: "Status (A-Z)" },
];

export default function AdminFilterBar({ filters, onFilterChange, onReset, loading }) {
  const [localFilters, setLocalFilters] = useState(filters);

  const handleChange = (key, value) => {
    const newFilters = { ...localFilters, [key]: value };
    setLocalFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleReset = () => {
    setLocalFilters({
      status: "ALL",
      searchTerm: "",
      fromDate: "",
      toDate: "",
      sortBy: "created_at_desc",
    });
    onReset();
  };

  return (
    <div className="admin-filter-bar card" style={{ padding: 16, marginBottom: 20 }}>
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "flex-end" }}>
        <div style={{ flex: 2, minWidth: 200 }}>
          <label className="label" style={{ fontSize: 12, marginBottom: 4 }}>Search</label>
          <input
            type="text"
            className="input"
            placeholder="Company name or email..."
            value={localFilters.searchTerm}
            onChange={(e) => handleChange("searchTerm", e.target.value)}
            disabled={loading}
          />
        </div>

        <div style={{ minWidth: 150 }}>
          <label className="label" style={{ fontSize: 12, marginBottom: 4 }}>Status</label>
          <select
            className="input"
            value={localFilters.status}
            onChange={(e) => handleChange("status", e.target.value)}
            disabled={loading}
          >
            {STATUS_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        <div style={{ minWidth: 150 }}>
          <label className="label" style={{ fontSize: 12, marginBottom: 4 }}>Sort By</label>
          <select
            className="input"
            value={localFilters.sortBy}
            onChange={(e) => handleChange("sortBy", e.target.value)}
            disabled={loading}
          >
            {SORT_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        <div style={{ minWidth: 130 }}>
          <label className="label" style={{ fontSize: 12, marginBottom: 4 }}>From Date</label>
          <input
            type="date"
            className="input"
            value={localFilters.fromDate}
            onChange={(e) => handleChange("fromDate", e.target.value)}
            disabled={loading}
          />
        </div>

        <div style={{ minWidth: 130 }}>
          <label className="label" style={{ fontSize: 12, marginBottom: 4 }}>To Date</label>
          <input
            type="date"
            className="input"
            value={localFilters.toDate}
            onChange={(e) => handleChange("toDate", e.target.value)}
            disabled={loading}
          />
        </div>

        <button
          className="btn btn-outline"
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