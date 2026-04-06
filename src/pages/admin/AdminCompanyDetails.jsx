/**
 * File: src/pages/admin/AdminCompanyDetails.jsx
 * Purpose: Quick company details view (simpler version)
 */
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AdminLayout from "../../components/admin/AdminLayout";
import AdminStatusBadge from "../../components/admin/AdminStatusBadge";
import adminCompanyService from "../../services/adminCompanyService";

export default function AdminCompanyDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadCompany = async () => {
      setLoading(true);
      try {
        const { data } = await adminCompanyService.getCompanyForReview(id);
        setCompany(data.company);
      } catch (err) {
        setError(err?.response?.data?.message || "Failed to load company.");
      } finally {
        setLoading(false);
      }
    };
    loadCompany();
  }, [id]);

  if (loading) {
    return (
      <AdminLayout title="Company Details" subtitle="Loading...">
        <div className="alert info">Loading company details...</div>
      </AdminLayout>
    );
  }

  if (error || !company) {
    return (
      <AdminLayout title="Company Details" subtitle="Error">
        <div className="alert error">{error || "Company not found."}</div>
        <button className="btn btn-outline" onClick={() => navigate("/admin/companies")}>
          Back to Companies
        </button>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Company Details" subtitle={company.companyName}>
      <div className="card" style={{ padding: 20 }}>
        <div style={{ marginBottom: 20 }}>
          <button className="btn btn-outline" onClick={() => navigate("/admin/companies")}>
            ← Back to Companies
          </button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div>
            <div className="helper" style={{ fontSize: 11 }}>Company Name</div>
            <div style={{ fontWeight: 600 }}>{company.companyName}</div>
          </div>
          <div>
            <div className="helper" style={{ fontSize: 11 }}>Email</div>
            <div>{company.email}</div>
          </div>
          <div>
            <div className="helper" style={{ fontSize: 11 }}>Status</div>
            <AdminStatusBadge status={company.status} />
          </div>
          <div>
            <div className="helper" style={{ fontSize: 11 }}>Registered On</div>
            <div>{new Date(company.createdAt).toLocaleString()}</div>
          </div>
          <div>
            <div className="helper" style={{ fontSize: 11 }}>Industry</div>
            <div>{company.industry || "-"}</div>
          </div>
          <div>
            <div className="helper" style={{ fontSize: 11 }}>Location</div>
            <div>{company.location || "-"}</div>
          </div>
          <div style={{ gridColumn: "span 2" }}>
            <div className="helper" style={{ fontSize: 11 }}>Description</div>
            <div>{company.description || "-"}</div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}