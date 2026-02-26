import { useEffect, useState } from "react";
import AdminLayout from "../../components/admin/AdminLayout";
import AdminStatusBadge from "../../components/admin/AdminStatusBadge";
import AdminTable from "../../components/admin/AdminTable";
import { api } from "../../services/api";

const ALLOWED_STATUS = ["PENDING_APPROVAL", "APPROVED", "REJECTED"];

function listFromResponse(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.data)) return data.data;
  return [];
}

function getCompanyId(company) {
  return company.id ?? company.companyId;
}

export default function AdminCompanies() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [savingId, setSavingId] = useState(null);

  const loadCompanies = async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.get("/api/admin/companies");
      setCompanies(listFromResponse(data));
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load companies.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCompanies();
  }, []);

  const updateStatus = async (company, status) => {
    const companyId = getCompanyId(company);
    if (!companyId) {
      setError("Company ID is missing for this record.");
      return;
    }

    if (!ALLOWED_STATUS.includes(status)) {
      setError("Invalid status selected.");
      return;
    }

    setSavingId(companyId);
    setError("");
    setMessage("");

    try {
      await api.patch(`/api/admin/companies/${companyId}/status`, { status });

      setCompanies((prev) =>
        prev.map((item) => {
          const id = getCompanyId(item);
          if (id !== companyId) return item;
          return { ...item, status };
        }),
      );

      setMessage(`Company #${companyId} updated to ${status}.`);
    } catch (err) {
      const data = err?.response?.data;
      const msg = typeof data === "string" ? data : data?.message || "Failed to update company status.";
      setError(msg);
    } finally {
      setSavingId(null);
    }
  };

  const columns = [
    { key: "id", label: "ID", render: (row) => getCompanyId(row) || "-" },
    { key: "fullName", label: "Company", render: (row) => row.fullName || row.companyName || row.name || "-" },
    { key: "email", label: "Email", render: (row) => row.email || "-" },
    {
      key: "status",
      label: "Current Status",
      render: (row) => <AdminStatusBadge status={row.status || row.companyStatus || "UNKNOWN"} />,
    },
    {
      key: "action",
      label: "Update Status",
      render: (row) => {
        const companyId = getCompanyId(row);
        const currentStatus = row.status || row.companyStatus || "PENDING_APPROVAL";

        return (
          <select
            className="input"
            style={{ minWidth: 180, padding: "8px 10px" }}
            value={currentStatus}
            disabled={savingId === companyId}
            onChange={(e) => updateStatus(row, e.target.value)}
          >
            {ALLOWED_STATUS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        );
      },
    },
  ];

  return (
    <AdminLayout title="Companies" subtitle="Review and update company approval status">
      {error ? <div className="alert error" style={{ marginBottom: 14 }}>{error}</div> : null}
      {message ? <div className="alert success" style={{ marginBottom: 14 }}>{message}</div> : null}
      {loading ? <div className="alert info" style={{ marginBottom: 14 }}>Loading companies...</div> : null}

      <AdminTable
        columns={columns}
        rows={companies}
        emptyText={loading ? "Loading..." : "No companies found."}
      />
    </AdminLayout>
  );
}
