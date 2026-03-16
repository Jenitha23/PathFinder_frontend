export default function JobFilters({
  searchInput,
  setSearchInput,
  location,
  setLocation,
  type,
  setType,
  category,
  setCategory,
  onSearch,
  onClear,
}) {
  return (
    <div
      className="card"
      style={{
        padding: 20,
        borderRadius: 22,
        boxShadow: "var(--shadow-lg)",
        marginBottom: 28,
      }}
    >
      <form onSubmit={onSearch}>
        <div
          style={{
            display: "grid",
            gap: 14,
            gridTemplateColumns: "2fr 1fr 1fr 1fr auto",
            alignItems: "end",
          }}
        >
          <div>
            <label className="label">Search by keyword or title</label>
            <input
              className="input"
              type="text"
              placeholder="Try: Java, React, internship..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
          </div>

          <div>
            <label className="label">Location</label>
            <input
              className="input"
              type="text"
              placeholder="Colombo / Remote"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>

          <div>
            <label className="label">Job Type</label>
            <select className="input" value={type} onChange={(e) => setType(e.target.value)}>
              <option value="">All types</option>
              <option value="Internship">Internship</option>
              <option value="Full-time">Full-time</option>
              <option value="Part-time">Part-time</option>
              <option value="Contract">Contract</option>
            </select>
          </div>

          <div>
            <label className="label">Category</label>
            <input
              className="input"
              type="text"
              placeholder="Software Engineering"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            />
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            <button type="submit" className="btn btn-primary">
              Search
            </button>
            <button type="button" className="btn btn-outline" onClick={onClear}>
              Clear
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}