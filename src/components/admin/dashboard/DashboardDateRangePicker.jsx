/**
 * File: src/components/admin/dashboard/DashboardDateRangePicker.jsx
 * Purpose: Date range picker for dashboard filtering
 */
import { useState, useEffect, useRef } from "react";

const PRESET_OPTIONS = [
  { value: "last7days", label: "Last 7 Days", days: 7 },
  { value: "last30days", label: "Last 30 Days", days: 30 },
  { value: "last90days", label: "Last 90 Days", days: 90 },
  { value: "last12months", label: "Last 12 Months", days: 365 },
  { value: "custom", label: "Custom Range", days: 0 },
];

export default function DashboardDateRangePicker({ onRangeChange, loading, initialPreset = "last30days" }) {
  const [preset, setPreset] = useState(initialPreset);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [showCustom, setShowCustom] = useState(false);
  const isInitialMount = useRef(true);

  // Function to get dates from preset - defined as a regular function
  const getDatesFromPreset = (presetValue) => {
    const now = new Date();
    const end = now.toISOString().split("T")[0];
    let start = new Date();

    switch (presetValue) {
      case "last7days":
        start.setDate(now.getDate() - 7);
        break;
      case "last30days":
        start.setDate(now.getDate() - 30);
        break;
      case "last90days":
        start.setDate(now.getDate() - 90);
        break;
      case "last12months":
        start.setFullYear(now.getFullYear() - 1);
        break;
      default:
        start.setDate(now.getDate() - 30);
    }

    return {
      start: start.toISOString().split("T")[0],
      end: end,
    };
  };

  // Initialize on mount only
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      const { start, end } = getDatesFromPreset(initialPreset);
      setStartDate(start);
      setEndDate(end);
      onRangeChange(start, end, initialPreset);
    }
  }, []); // Empty dependency array - runs only once

  const handlePresetChange = (newPreset) => {
    setPreset(newPreset);
    
    if (newPreset !== "custom") {
      const { start, end } = getDatesFromPreset(newPreset);
      setStartDate(start);
      setEndDate(end);
      setShowCustom(false);
      onRangeChange(start, end, newPreset);
    } else {
      setShowCustom(true);
      // Don't call onRangeChange yet - wait for custom apply
    }
  };

  const handleCustomApply = () => {
    if (startDate && endDate) {
      onRangeChange(startDate, endDate, "custom");
    }
  };

  const handleStartDateChange = (value) => {
    setStartDate(value);
  };

  const handleEndDateChange = (value) => {
    setEndDate(value);
  };

  return (
    <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "flex-end" }}>
      <div style={{ minWidth: 150 }}>
        <label className="label" style={{ fontSize: 12, marginBottom: 4 }}>Date Range</label>
        <select
          className="input"
          value={preset}
          onChange={(e) => handlePresetChange(e.target.value)}
          disabled={loading}
        >
          {PRESET_OPTIONS.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      {showCustom && (
        <>
          <div>
            <label className="label" style={{ fontSize: 12, marginBottom: 4 }}>From</label>
            <input
              type="date"
              className="input"
              value={startDate}
              onChange={(e) => handleStartDateChange(e.target.value)}
              disabled={loading}
            />
          </div>
          <div>
            <label className="label" style={{ fontSize: 12, marginBottom: 4 }}>To</label>
            <input
              type="date"
              className="input"
              value={endDate}
              onChange={(e) => handleEndDateChange(e.target.value)}
              disabled={loading}
            />
          </div>
          <button
            className="btn btn-primary btn-sm"
            onClick={handleCustomApply}
            disabled={loading || !startDate || !endDate}
            style={{ height: 38 }}
          >
            Apply
          </button>
        </>
      )}
    </div>
  );
}