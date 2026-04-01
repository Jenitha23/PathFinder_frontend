import { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import companyJobService from "../../services/companyjobService";

export default function EditJob() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [serverError, setServerError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
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
    loadJobForEdit();
  }, [id]);

  const loadJobForEdit = async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await companyJobService.getJobForEdit(id);
      setFormData({
        title: data.title || "",
        description: data.description || "",
        requirements: data.requirements || "",
        responsibilities: data.responsibilities || "",
        location: data.location || "",
        jobType: data.jobType || "",
        category: data.category || "",
        salary: data.salary || "",
        salaryRange: data.salaryRange || "",
        experienceLevel: data.experienceLevel || "",
        applicationDeadline: data.applicationDeadline ? data.applicationDeadline.split("T")[0] : "",
      });
    } catch (err) {
      const status = err?.response?.status;
      const message = err?.response?.data?.message || "Failed to load job details.";
      if (status === 404) {
        setError("Job not found or does not belong to your company.");
      } else {
        setError(message);
      }
    } finally {
      setLoading(false);
    }
  };

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
    setServerError("");
    setSuccessMessage("");
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
    setServerError("");
    setSuccessMessage("");

    try {
      const payload = {
        ...formData,
        applicationDeadline: new Date(formData.applicationDeadline).toISOString(),
      };

      const { data } = await companyJobService.updateJob(id, payload);

      setSuccessMessage(data.message || "Job updated successfully!");
      
      // Redirect after 2 seconds
      setTimeout(() => {
        navigate(`/company/jobs/${id}`);
      }, 2000);
      
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
          else setServerError(error);
        });
        setErrors(fieldErrors);
      } else if (responseData?.message) {
        setServerError(responseData.message);
      } else if (err.response?.status === 401) {
        setServerError("Your company account is not approved yet.");
      } else {
        setServerError("Failed to update job posting. Please try again.");
      }
      
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: "calc(100vh - 65px)", background: "var(--bg)", padding: "40px 0" }}>
        <div className="container" style={{ maxWidth: 900 }}>
          <div className="card" style={{ padding: 32, textAlign: "center" }}>
            Loading job details...
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ minHeight: "calc(100vh - 65px)", background: "var(--bg)", padding: "40px 0" }}>
        <div className="container" style={{ maxWidth: 900 }}>
          <div className="alert error" style={{ borderRadius: 12 }}>
            ⚠️ {error}
            <div style={{ marginTop: 12 }}>
              <Link to="/company/jobs" className="btn btn-outline btn-sm">
                ← Back to My Jobs
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "calc(100vh - 65px)", background: "var(--bg)", padding: "40px 0 60px" }}>
      <div className="container" style={{ maxWidth: 900, margin: "0 auto" }}>
        {/* Header Section */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
            <Link 
              to={`/company/jobs/${id}`} 
              className="btn btn-ghost btn-sm"
              style={{ padding: "8px 12px" }}
            >
              ← Back to Job Details
            </Link>
          </div>
          <div>
            <h1 
              style={{ 
                fontFamily: "'Sora', sans-serif", 
                fontSize: 32, 
                fontWeight: 800,
                marginBottom: 12,
                background: "linear-gradient(135deg, var(--primary) 0%, var(--teal) 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Edit Job Posting
            </h1>
            <p className="helper" style={{ fontSize: 16 }}>
              Update the details below to modify your job posting.
            </p>
          </div>
        </div>

        {/* Alert Messages */}
        {serverError && (
          <div className="alert error animate-fade-in" style={{ marginBottom: 24 }}>
            <strong>Error:</strong> {serverError}
          </div>
        )}

        {successMessage && (
          <div className="alert success animate-fade-in" style={{ marginBottom: 24 }}>
            <strong>Success!</strong> {successMessage}
            <div style={{ marginTop: 12 }}>
              <Link to={`/company/jobs/${id}`} className="btn btn-outline btn-sm">
                View Job →
              </Link>
            </div>
          </div>
        )}

        {/* Edit Form */}
        <div className="card" style={{ padding: "32px 28px" }}>
          <form onSubmit={handleSubmit}>
            <div style={{ display: "grid", gap: 24 }}>
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
                  disabled={submitting}
                />
                {errors.title && (
                  <div className="helper" style={{ color: "var(--coral)", marginTop: 6, fontSize: 13 }}>
                    {errors.title}
                  </div>
                )}
                <div className="helper" style={{ marginTop: 4 }}>
                  {formData.title.length}/200 characters
                </div>
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
                    disabled={submitting}
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
                    disabled={submitting}
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

              {/* Location and Experience Level Row */}
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
                    placeholder="e.g., Colombo, Sri Lanka (or Remote)"
                    style={{ fontSize: 15, padding: "12px 16px" }}
                    disabled={submitting}
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
                    disabled={submitting}
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
                    disabled={submitting}
                  />
                  {errors.salary && (
                    <div className="helper" style={{ color: "var(--coral)", marginTop: 6 }}>
                      {errors.salary}
                    </div>
                  )}
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
                    disabled={submitting}
                  />
                </div>
              </div>

              {/* Job Description */}
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
                  placeholder="Describe the role, responsibilities, and what makes this opportunity exciting..."
                  style={{ fontSize: 15, resize: "vertical", padding: "12px 16px" }}
                  disabled={submitting}
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
                  placeholder="• Bachelor's degree in Computer Science or related field&#10;• 3+ years of experience in software development&#10;• Strong knowledge of React and Node.js"
                  style={{ fontSize: 15, resize: "vertical", padding: "12px 16px" }}
                  disabled={submitting}
                />
                {errors.requirements && (
                  <div className="helper" style={{ color: "var(--coral)", marginTop: 6 }}>
                    {errors.requirements}
                  </div>
                )}
              </div>

              {/* Responsibilities (Optional) */}
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
                  placeholder="• Develop and maintain web applications&#10;• Collaborate with cross-functional teams&#10;• Write clean, maintainable code"
                  style={{ fontSize: 15, resize: "vertical", padding: "12px 16px" }}
                  disabled={submitting}
                />
              </div>

              {/* Application Deadline */}
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
                  disabled={submitting}
                />
                {errors.applicationDeadline && (
                  <div className="helper" style={{ color: "var(--coral)", marginTop: 6 }}>
                    {errors.applicationDeadline}
                  </div>
                )}
                <div className="helper" style={{ marginTop: 4 }}>
                  Applications will close at 11:59 PM on the selected date.
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div
              style={{
                display: "flex",
                gap: 16,
                marginTop: 36,
                paddingTop: 24,
                borderTop: "1px solid var(--border)",
              }}
            >
              <button
                type="submit"
                className="btn btn-teal"
                disabled={submitting}
                style={{
                  flex: 1,
                  justifyContent: "center",
                  padding: "14px 24px",
                  fontSize: 16,
                  fontWeight: 600,
                  opacity: submitting ? 0.7 : 1,
                }}
              >
                {submitting ? (
                  <>
                    <span className="spinner" style={{ marginRight: 8 }}></span>
                    Saving Changes...
                  </>
                ) : (
                  "Save Changes →"
                )}
              </button>
              
              <Link
                to={`/company/jobs/${id}`}
                className="btn btn-outline"
                style={{
                  flex: 1,
                  justifyContent: "center",
                  padding: "14px 24px",
                  fontSize: 16,
                }}
              >
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}