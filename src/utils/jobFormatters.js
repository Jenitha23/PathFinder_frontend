export function formatDate(dateValue) {
  if (!dateValue) return "Not specified";
  return new Date(dateValue).toLocaleDateString();
}

export function formatSalary(salary) {
  if (!salary) return "Not specified";
  return salary;
}