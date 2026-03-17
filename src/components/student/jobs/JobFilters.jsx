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
            <select 
              className="input" 
              value={location} 
              onChange={(e) => {
                setLocation(e.target.value);
                setTimeout(() => onSearch(null), 0);
              }}
            >
              <option value="">All Locations</option>
              <option value="Colombo">Colombo</option>
              <option value="Kandy">Kandy</option>
              <option value="Galle">Galle</option>
              <option value="Gampaha">Gampaha</option>
              <option value="Kurunegala">Kurunegala</option>
              <option value="Negombo">Negombo</option>
              <option value="Jaffna">Jaffna</option>
              <option value="Remote">Remote</option>
            </select>
          </div>

          <div>
            <label className="label">Job Type</label>
            <select 
              className="input" 
              value={type} 
              onChange={(e) => {
                setType(e.target.value);
                setTimeout(() => onSearch(null), 0);
              }}
            >
              <option value="">All types</option>
              <option value="Internship">Internship</option>
              <option value="Full-time">Full-time</option>
              <option value="Part-time">Part-time</option>
              <option value="Contract">Contract</option>
            </select>
          </div>

          <div>
            <label className="label">Category</label>
            <select 
              className="input" 
              value={category} 
              onChange={(e) => {
                setCategory(e.target.value);
                setTimeout(() => onSearch(null), 0);
              }}
            >
              <option value="">All Categories</option>
              <option value="Software Engineering">Software Engineering</option>
              <option value="Data Science">Data Science</option>
              <option value="Quality Assurance">Quality Assurance</option>
              <option value="UI/UX Design">UI/UX Design</option>
              <option value="Project Management">Project Management</option>
              <option value="Marketing">Marketing</option>
              <option value="Finance">Finance</option>
              <option value="Human Resources">Human Resources</option>
              <option value="Product Management">Product Management</option>
              <option value="Business Analysis">Business Analysis</option>
            </select>
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