/**
 * File: src/components/admin/AdminPagination.jsx
 * Purpose: Pagination component for admin tables
 */
export default function AdminPagination({ page, totalPages, onPageChange, loading }) {
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    let start = Math.max(1, page - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible - 1);
    
    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }
    
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  };

  if (totalPages <= 1) return null;

  return (
    <div className="admin-pagination" style={{ 
      display: "flex", 
      justifyContent: "flex-end", 
      gap: 8, 
      marginTop: 20,
      alignItems: "center"
    }}>
      <button
        className="btn btn-outline btn-sm"
        onClick={() => onPageChange(page - 1)}
        disabled={page === 1 || loading}
      >
        Previous
      </button>
      
      {getPageNumbers().map(p => (
        <button
          key={p}
          className={`btn ${p === page ? "btn-primary" : "btn-outline"} btn-sm`}
          onClick={() => onPageChange(p)}
          disabled={loading}
          style={{ minWidth: 40 }}
        >
          {p}
        </button>
      ))}
      
      <button
        className="btn btn-outline btn-sm"
        onClick={() => onPageChange(page + 1)}
        disabled={page === totalPages || loading}
      >
        Next
      </button>
      
      <span className="helper" style={{ marginLeft: 12 }}>
        Page {page} of {totalPages}
      </span>
    </div>
  );
}