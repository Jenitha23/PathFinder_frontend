export default function Pagination({ page, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        gap: 10,
        marginTop: 28,
        flexWrap: "wrap",
      }}
    >
      <button
        className="btn btn-outline"
        onClick={() => onPageChange(page - 1)}
        disabled={page === 1}
      >
        Previous
      </button>

      <span className="helper" style={{ alignSelf: "center" }}>
        Page {page} of {totalPages}
      </span>

      <button
        className="btn btn-primary"
        onClick={() => onPageChange(page + 1)}
        disabled={page === totalPages}
      >
        Next
      </button>
    </div>
  );
}