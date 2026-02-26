export default function AdminStatusBadge({ status }) {
  const s = status || "UNKNOWN";

  let cls = "badge badge-primary";
  if (s === "APPROVED") cls = "badge badge-teal";
  if (s === "REJECTED") cls = "badge badge-coral";

  return <span className={cls}>{s.replaceAll("_", " ")}</span>;
}
