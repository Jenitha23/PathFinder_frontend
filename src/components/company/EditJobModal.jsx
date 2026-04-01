import { useState, useEffect } from "react";
import companyJobService from "../../services/companyjobService";

export default function EditJobModal({ job, isOpen, onClose, onUpdate }) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    requirements: "",
    responsibilities: "",
    location: "",
    jobType: "",
    category: "",
    salary: "",
    salaryRange: "",
    experienceLevel: "",
    applicationDeadline: "",
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Job type options
  const jobTypes = [
    "Full-time",
    "Part-time",
    "Contract",
    "Internship",
    "Remote",
    "Hybrid",
    "Freelance",
  ];

  // Category options
  const categories = [
    "Technology",
    "Marketing",
    "Sales",
    "Finance",
    "Human Resources",
    "Operations",
    "Customer Service",
    "Design",
    "Healthcare",
    "Education",
    "Engineering",
    "Consulting",
    "Legal",
    "Administrative",
  ];

  // Experience level options
  const experienceLevels = [
    "Entry Level",
    "Junior",
    "Mid-Level",
    "Senior",
    "Lead",
    "Manager",
    "Director",
    "Executive",
  ];

  useEffect(() => {
    if (job && isOpen) {
      setFormData({
        title: job.title || "",
        description: job.description || "",
        requirements: job.requirements || "",
        responsibilities: job.responsibilities || "",
        location: job.location || "",
        jobType: job.jobType || job.type || "",
        category: job.category || "",
        salary: job.salary || "",
        salaryRange: job.salaryRange || "",
        experienceLevel: job.experienceLevel || "",
        applicationDeadline: job.applicationDeadline ? job.applicationDeadline.split("T")[0] : "",
      });
    }
  }, [job, isOpen]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = "Job title is required.";
    } else if (formData.title.length > 200) {
      newErrors.title = "Job title cannot exceed 200 characters.";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Job description is required.";
    }

    if (!formData.requirements.trim()) {
      newErrors.requirements = "Requirements are required.";
    }

    if (!formData.location.trim()) {
      newErrors.location = "Location is required.";
    } else if (formData.location.length > 150) {
      newErrors.location = "Location cannot exceed 150 characters.";
    }

    if (!formData.jobType) {
      newErrors.jobType = "Job type is required.";
    }

    if (!formData.category) {
      newErrors.category = "Category is required.";
    }

    if (!formData.applicationDeadline) {
      newErrors.applicationDeadline = "Application deadline is required.";
    } else {
      const deadlineDate = new Date(formData.applicationDeadline);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (isNaN(deadlineDate.getTime())) {
        newErrors.applicationDeadline = "Please enter a valid date.";
      } else if (deadlineDate <= today) {
        newErrors.applicationDeadline = "Deadline must be a future date.";
      }
    }

    if (formData.salary && formData.salary.length > 100) {
      newErrors.salary = "Salary cannot exceed 100 characters.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      const firstErrorField = Object.keys(errors)[0];
      const element = document.getElementById(firstErrorField);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "center" });
        element.focus();
      }
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const payload = {
        ...formData,
        applicationDeadline: new Date(formData.applicationDeadline).toISOString(),
      };

      const { data } = await companyJobService.updateJob(job.id, payload);
      
      if (onUpdate) onUpdate(data.job);
      onClose();
    } catch (err) {
      const responseData = err.response?.data;
      
      if (responseData?.errors && Array.isArray(responseData.errors)) {
        const fieldErrors = {};
        responseData.errors.forEach((error) => {
          const lowerError = error.toLowerCase();
          if (lowerError.includes("title")) fieldErrors.title = error;
          else if (lowerError.includes("description")) fieldErrors.description = error;
          else if (lowerError.includes("requirement")) fieldErrors.requirements = error;
          else if (lowerError.includes("location")) fieldErrors.location = error;
          else if (lowerError.includes("type")) fieldErrors.jobType = error;
          else if (lowerError.includes("category")) fieldErrors.category = error;
          else if (lowerError.includes("deadline")) fieldErrors.applicationDeadline = error;
          else setError(error);
        });
        setErrors(fieldErrors);
      } else if (responseData?.message) {
        setError(responseData.message);
      } else {
        setError("Failed to update job posting. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        backdropFilter: "blur(4px)",
        overflowY: "auto",
        padding: "20px",
      }}
      onClick={onClose}
    >
      <div
        className="card"
        style={{
          maxWidth: 800,
          width: "100%",
          maxHeight: "90vh",
          overflowY: "auto",
          padding: "28px 24px",
          animation: "fadeUp 0.2s ease",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h2 style={{ fontSize: 24, fontWeight: 700, fontFamily: "'Sora', sans-serif" }}>
            Edit Job Posting
          </h2>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              fontSize: 24,
              cursor: "pointer",
              color: "var(--muted)",
            }}
          >
            ×
          </button>
        </div>

        {error && (
          <div className="alert error" style={{ marginBottom: 20 }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ display: "grid", gap: 20 }}>
            {/* Job Title */}
            <div>
              <label className="label" htmlFor="title" style={{ fontSize: 14, fontWeight: 600 }}>
                Job Title <span style={{ color: "var(--coral)" }}>*</span>
              </label>
              <input
                id="title"
                name="title"
                className="input"
                type="text"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g., Senior Software Engineer"
                style={{ fontSize: 15, padding: "12px 16px" }}
              />
              {errors.title && (
                <div className="helper" style={{ color: "var(--coral)", marginTop: 6 }}>
                  {errors.title}
                </div>
              )}
            </div>

            {/* Job Type and Category Row */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
              <div>
                <label className="label" htmlFor="jobType" style={{ fontSize: 14, fontWeight: 600 }}>
                  Job Type <span style={{ color: "var(--coral)" }}>*</span>
                </label>
                <select
                  id="jobType"
                  name="jobType"
                  className="input"
                  value={formData.jobType}
                  onChange={handleChange}
                  style={{ fontSize: 15, padding: "12px 16px" }}
                >
                  <option value="">Select job type</option>
                  {jobTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
                {errors.jobType && (
                  <div className="helper" style={{ color: "var(--coral)", marginTop: 6 }}>
                    {errors.jobType}
                  </div>
                )}
              </div>

              <div>
                <label className="label" htmlFor="category" style={{ fontSize: 14, fontWeight: 600 }}>
                  Category <span style={{ color: "var(--coral)" }}>*</span>
                </label>
                <select
                  id="category"
                  name="category"
                  className="input"
                  value={formData.category}
                  onChange={handleChange}
                  style={{ fontSize: 15, padding: "12px 16px" }}
                >
                  <option value="">Select category</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
                {errors.category && (
                  <div className="helper" style={{ color: "var(--coral)", marginTop: 6 }}>
                    {errors.category}
                  </div>
                )}
              </div>
            </div>

            {/* Location and Experience Level */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
              <div>
                <label className="label" htmlFor="location" style={{ fontSize: 14, fontWeight: 600 }}>
                  Location <span style={{ color: "var(--coral)" }}>*</span>
                </label>
                <input
                  id="location"
                  name="location"
                  className="input"
                  type="text"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="e.g., Colombo, Sri Lanka"
                  style={{ fontSize: 15, padding: "12px 16px" }}
                />
                {errors.location && (
                  <div className="helper" style={{ color: "var(--coral)", marginTop: 6 }}>
                    {errors.location}
                  </div>
                )}
              </div>

              <div>
                <label className="label" htmlFor="experienceLevel" style={{ fontSize: 14, fontWeight: 600 }}>
                  Experience Level
                </label>
                <select
                  id="experienceLevel"
                  name="experienceLevel"
                  className="input"
                  value={formData.experienceLevel}
                  onChange={handleChange}
                  style={{ fontSize: 15, padding: "12px 16px" }}
                >
                  <option value="">Select experience level</option>
                  {experienceLevels.map((level) => (
                    <option key={level} value={level}>
                      {level}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Salary Fields */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
              <div>
                <label className="label" htmlFor="salary" style={{ fontSize: 14, fontWeight: 600 }}>
                  Salary (optional)
                </label>
                <input
                  id="salary"
                  name="salary"
                  className="input"
                  type="text"
                  value={formData.salary}
                  onChange={handleChange}
                  placeholder="e.g., $60,000 - $80,000/year"
                  style={{ fontSize: 15, padding: "12px 16px" }}
                />
              </div>

              <div>
                <label className="label" htmlFor="salaryRange" style={{ fontSize: 14, fontWeight: 600 }}>
                  Salary Range (optional)
                </label>
                <input
                  id="salaryRange"
                  name="salaryRange"
                  className="input"
                  type="text"
                  value={formData.salaryRange}
                  onChange={handleChange}
                  placeholder="e.g., 60k-80k"
                  style={{ fontSize: 15, padding: "12px 16px" }}
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="label" htmlFor="description" style={{ fontSize: 14, fontWeight: 600 }}>
                Job Description <span style={{ color: "var(--coral)" }}>*</span>
              </label>
              <textarea
                id="description"
                name="description"
                className="input"
                rows={6}
                value={formData.description}
                onChange={handleChange}
                style={{ fontSize: 15, resize: "vertical", padding: "12px 16px" }}
              />
              {errors.description && (
                <div className="helper" style={{ color: "var(--coral)", marginTop: 6 }}>
                  {errors.description}
                </div>
              )}
            </div>

            {/* Requirements */}
            <div>
              <label className="label" htmlFor="requirements" style={{ fontSize: 14, fontWeight: 600 }}>
                Requirements <span style={{ color: "var(--coral)" }}>*</span>
              </label>
              <textarea
                id="requirements"
                name="requirements"
                className="input"
                rows={5}
                value={formData.requirements}
                onChange={handleChange}
                style={{ fontSize: 15, resize: "vertical", padding: "12px 16px" }}
              />
              {errors.requirements && (
                <div className="helper" style={{ color: "var(--coral)", marginTop: 6 }}>
                  {errors.requirements}
                </div>
              )}
            </div>

            {/* Responsibilities */}
            <div>
              <label className="label" htmlFor="responsibilities" style={{ fontSize: 14, fontWeight: 600 }}>
                Responsibilities (Optional)
              </label>
              <textarea
                id="responsibilities"
                name="responsibilities"
                className="input"
                rows={4}
                value={formData.responsibilities}
                onChange={handleChange}
                style={{ fontSize: 15, resize: "vertical", padding: "12px 16px" }}
              />
            </div>

            {/* Deadline */}
            <div>
              <label className="label" htmlFor="applicationDeadline" style={{ fontSize: 14, fontWeight: 600 }}>
                Application Deadline <span style={{ color: "var(--coral)" }}>*</span>
              </label>
              <input
                id="applicationDeadline"
                name="applicationDeadline"
                className="input"
                type="date"
                value={formData.applicationDeadline}
                onChange={handleChange}
                min={new Date().toISOString().split("T")[0]}
                style={{ fontSize: 15, padding: "12px 16px" }}
              />
              {errors.applicationDeadline && (
                <div className="helper" style={{ color: "var(--coral)", marginTop: 6 }}>
                  {errors.applicationDeadline}
                </div>
              )}
            </div>
          </div>

          {/* Form Actions */}
          <div style={{ display: "flex", gap: 16, marginTop: 32 }}>
            <button
              type="submit"
              className="btn btn-teal"
              disabled={submitting}
              style={{
                flex: 1,
                justifyContent: "center",
                padding: "12px 24px",
                fontSize: 15,
                fontWeight: 600,
              }}
            >
              {submitting ? "Saving..." : "Save Changes"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="btn btn-outline"
              style={{ flex: 1, justifyContent: "center" }}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>

      <style>{`
        @keyframes fadeUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}