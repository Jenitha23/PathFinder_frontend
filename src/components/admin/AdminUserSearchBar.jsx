/**
 * File: src/components/admin/AdminUserSearchBar.jsx
 * Purpose: Search and filter bar for admin user management
 */
import { useState } from "react";

const STATUS_OPTIONS = [
  { value: "ALL", label: "All Status" },
  { value: "ACTIVE", label: "Active" },
  { value: "SUSPENDED", label: "Suspended" },
];

export default function AdminUserSearchBar({ 
  filters, 
  onFilterChange, 
  onReset, 
  loading,
  userType 
}) {
  const [localFilters, setLocalFilters] = useState(filters);

  const handleChange = (key, value) => {
    const newFilters = { ...localFilters, [key]: value };
    setLocalFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleReset = () => {
    const resetFilters = {
      searchTerm: "",
      status: "ALL",
    };
    setLocalFilters(resetFilters);
    onReset();
  };

  return (
    <div className="card" style={{ padding: 16, marginBottom: 20 }}>
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "flex-end" }}>
        <div style={{ flex: 2, minWidth: 250 }}>
          <label className="label" style={{ fontSize: 12, marginBottom: 4 }}>
            Search
          </label>
          <input
            type="text"
            className="input"
            placeholder={`Search by ${userType === "STUDENT" ? "name or email" : "company name or email"}...`}
            value={localFilters.searchTerm}
            onChange={(e) => handleChange("searchTerm", e.target.value)}
            disabled={loading}
          />
        </div>

        <div style={{ minWidth: 150 }}>
          <label className="label" style={{ fontSize: 12, marginBottom: 4 }}>
            Status
          </label>
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

        <button
          className="btn btn-outline"
          onClick={handleReset}
          disabled={loading}
          style={{ height: 42 }}
        >
          Reset
        </button>
      </div>
    </div>
  );
}