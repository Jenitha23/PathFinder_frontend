/**
 * File: src/components/company/CompanyDateRangeFilter.jsx
 * Purpose: Filter bar with year dropdown and custom date range for company reports
 */
import { useState, useEffect } from "react";

const YEAR_OPTIONS = () => {
  const currentYear = new Date().getFullYear();
  const years = ["", ...Array.from({ length: 5 }, (_, i) => currentYear - i)];
  return years;
};

export default function CompanyDateRangeFilter({ filters, onFilterChange, loading }) {
  const [filterType, setFilterType] = useState("year"); // "year" or "custom"
  const [year, setYear] = useState(filters.year || "");
  const [startDate, setStartDate] = useState(filters.startDate || "");
  const [endDate, setEndDate] = useState(filters.endDate || "");

  // Sync external filter changes (e.g., reset)
  useEffect(() => {
    if (filters.year && filters.year !== "") {
      setFilterType("year");
      setYear(filters.year);
    } else if (filters.startDate || filters.endDate) {
      setFilterType("custom");
      setStartDate(filters.startDate || "");
      setEndDate(filters.endDate || "");
    }
  }, [filters]);

  const handleApply = () => {
    if (filterType === "year") {
      onFilterChange({ year, startDate: "", endDate: "" });
    } else {
      onFilterChange({ year: "", startDate, endDate });
    }
  };

  const handleReset = () => {
    setFilterType("year");
    setYear("");
    setStartDate("");
    setEndDate("");
    onFilterChange({ year: "", startDate: "", endDate: "" });
  };

  return (
    <div className="card" style={{ padding: 16, marginBottom: 20 }}>
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap", alignItems: "flex-end" }}>
        <div>
          <label className="label" style={{ fontSize: 12, marginBottom: 4 }}>
            Filter Type
          </label>
          <select
            className="input"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            disabled={loading}
            style={{ minWidth: 140 }}
          >
            <option value="year">By Year</option>
            <option value="custom">Custom Date Range</option>
          </select>
        </div>

        {filterType === "year" ? (
          <div>
            <label className="label" style={{ fontSize: 12, marginBottom: 4 }}>
              Select Year
            </label>
            <select
              className="input"
              value={year}
              onChange={(e) => setYear(e.target.value)}
              disabled={loading}
              style={{ minWidth: 120 }}
            >
              <option value="">All Years</option>
              {YEAR_OPTIONS().map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>
        ) : (
          <>
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
          </>
        )}

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