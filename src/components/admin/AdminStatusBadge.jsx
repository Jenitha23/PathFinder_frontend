/**
 * File: src/components/admin/AdminStatusBadge.jsx
 * Purpose: Reusable admin UI component for status badges
 */
export default function AdminStatusBadge({ status }) {
  const s = status || "UNKNOWN";

  let cls = "badge badge-primary";
  if (s === "APPROVED") cls = "badge badge-teal";
  if (s === "REJECTED") cls = "badge badge-coral";
  if (s === "SUSPENDED") cls = "badge badge-warning";
  if (s === "ACTIVE") cls = "badge badge-teal";
  if (s === "PENDING_APPROVAL") cls = "badge badge-primary";

  return <span className={cls}>{s.replaceAll("_", " ")}</span>;
}