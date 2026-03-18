import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { studentProfileApi } from "../../services/profile";

const initialForm = {
  headline: "",
  aboutMe: "",
  phone: "",
  address: "",
  city: "",
  country: "",
  education: "",
  university: "",
  degree: "",
  academicYear: "",
  gpa: "",
  skills: "",
  technicalSkills: "",
  softSkills: "",
  languages: "",
  experience: "",
  careerInterests: "",
  preferredJobType: "",
  workMode: "",
  availableFrom: "",
  githubUrl: "",
  linkedinUrl: "",
  portfolioUrl: "",
  projectsSummary: "",
  internshipExperience: "",
  certifications: "",
};

export default function StudentProfile() {
  const [form, setForm] = useState(initialForm);
  const [existingCvUrl, setExistingCvUrl] = useState("");
  const [cvFile, setCvFile] = useState(null);
  const [removeCv, setRemoveCv] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const getErrorMessage = (err, fallback) => {
    const data = err?.response?.data;
    if (typeof data === "string") return data;
    return data?.message || data?.error || fallback;
  };

  useEffect(() => {
    let ignore = false;

    const loadProfile = async () => {
      try {
        setLoading(true);
        setError("");
        const { data } = await studentProfileApi.getStudentProfile();
        if (ignore) return;

        setForm({
          headline: data?.headline || "",
          aboutMe: data?.aboutMe || "",
          phone: data?.phone || "",
          address: data?.address || "",
          city: data?.city || "",
          country: data?.country || "",
          education: data?.education || "",
          university: data?.university || "",
          degree: data?.degree || "",
          academicYear: data?.academicYear || "",
          gpa: data?.gpa || "",
          skills: data?.skills || "",
          technicalSkills: data?.technicalSkills || "",
          softSkills: data?.softSkills || "",
          languages: data?.languages || "",
          experience: data?.experience || "",
          careerInterests: data?.careerInterests || "",
          preferredJobType: data?.preferredJobType || "",
          workMode: data?.workMode || "",
          availableFrom: data?.availableFrom ? data.availableFrom.slice(0, 10) : "",
          githubUrl: data?.githubUrl || "",
          linkedinUrl: data?.linkedinUrl || "",
          portfolioUrl: data?.portfolioUrl || "",
          projectsSummary: data?.projectsSummary || "",
          internshipExperience: data?.internshipExperience || "",
          certifications: data?.certifications || "",
        });

        setExistingCvUrl(data?.cvUrl || "");
      } catch (err) {
        if (!ignore) setError(getErrorMessage(err, "Failed to load student profile."));
      } finally {
        if (!ignore) setLoading(false);
      }
    };

    loadProfile();
    return () => {
      ignore = true;
    };
  }, []);

  const handleChange = (e) => {
    setMessage("");
    setError("");
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleCvChange = (e) => {
    setMessage("");
    setError("");
    setCvFile(e.target.files?.[0] || null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setMessage("");
      setError("");

      const data = new FormData();

      Object.entries(form).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== "") {
          data.append(key, value);
        }
      });

      if (cvFile) {
        data.append("cvFile", cvFile);
      }
      if (removeCv) {
        data.append("removeCv", "true");
      }

      const response = await studentProfileApi.updateStudentProfile(data);

      setMessage(response?.data?.message || "Profile updated successfully.");
      if (response?.data?.cvUrl) {
        setExistingCvUrl(response.data.cvUrl);
      }
      if (removeCv && !cvFile) {
        setExistingCvUrl("");
      }
      setRemoveCv(false);
    } catch (err) {
      setError(getErrorMessage(err, "Failed to update profile."));
    } finally {
      setSaving(false);
    }
  };

  const field = (label, name, placeholder = "", type = "text") => (
    <div>
      <label className="label">{label}</label>
      <input
        className="input"
        type={type}
        name={name}
        value={form[name]}
        onChange={handleChange}
        placeholder={placeholder}
      />
    </div>
  );

  const area = (label, name, placeholder = "", rows = 4) => (
    <div>
      <label className="label">{label}</label>
      <textarea
        className="input"
        name={name}
        value={form[name]}
        onChange={handleChange}
        placeholder={placeholder}
        rows={rows}
        style={{ resize: "vertical", minHeight: 110 }}
      />
    </div>
  );

  return (
    <div style={{ minHeight: "calc(100vh - 65px)", background: "var(--bg)", paddingBottom: 70 }}>
      <div
        style={{
          background: "linear-gradient(135deg, #0A2472 0%, #1a3a8f 100%)",
          padding: "54px 0 86px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: -80,
            right: -90,
            width: 320,
            height: 320,
            borderRadius: "50%",
            background: "rgba(46,196,182,0.10)",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            opacity: 0.04,
            backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />

        <div className="container" style={{ position: "relative" }}>
          <div style={{ maxWidth: 760 }}>
            <div
              className="badge"
              style={{
                background: "rgba(255,255,255,0.12)",
                color: "white",
                marginBottom: 18,
                border: "1px solid rgba(255,255,255,0.18)",
              }}
            >
              👤 Student Profile
            </div>

            <h1 style={{ color: "white", fontSize: "clamp(2rem, 4vw, 3rem)", marginBottom: 14 }}>
              Build a profile that companies actually want to read.
            </h1>

            <p style={{ color: "rgba(255,255,255,0.82)", fontSize: 16, maxWidth: 650, lineHeight: 1.8 }}>
              Add your skills, education, links, career interests, and CV so recruiters can quickly
              understand your background and match you with better opportunities.
            </p>
          </div>
        </div>
      </div>

      <div className="container" style={{ marginTop: -44 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18, flexWrap: "wrap", gap: 10 }}>
          <h2 style={{ fontSize: 24 }}>Edit student profile</h2>
          <Link to="/student/home" className="btn btn-ghost">
            ← Back to dashboard
          </Link>
        </div>

        {loading ? (
          <div className="card" style={{ padding: 26, textAlign: "center", color: "var(--muted)" }}>
            Loading profile...
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {message ? <div className="alert success" style={{ marginBottom: 16 }}>{message}</div> : null}
            {error ? <div className="alert error" style={{ marginBottom: 16 }}>{error}</div> : null}

            <div className="card" style={{ padding: 24, borderRadius: 22, marginBottom: 18 }}>
              <h3 style={{ marginBottom: 16 }}>Basic details</h3>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 16 }}>
                {field("Headline", "headline", "Java Backend Developer | Spring Boot | AWS")}
                {field("Phone", "phone", "+94712345678")}
                {field("City", "city", "Negombo")}
                {field("Country", "country", "Sri Lanka")}
              </div>
              <div style={{ marginTop: 16 }}>
                {field("Address", "address", "No. 10, Main Street")}
              </div>
              <div style={{ marginTop: 16 }}>
                {area("About Me", "aboutMe", "Write a short summary about yourself, your strengths, and your goals.")}
              </div>
            </div>

            <div className="card" style={{ padding: 24, borderRadius: 22, marginBottom: 18 }}>
              <h3 style={{ marginBottom: 16 }}>Education</h3>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 16 }}>
                {field("Education", "education", "BSc (Hons) Computer Science")}
                {field("University", "university", "SLIIT")}
                {field("Degree", "degree", "Computer Science")}
                {field("Academic Year", "academicYear", "Year 3 - Semester 2")}
                {field("GPA", "gpa", "3.45")}
              </div>
            </div>

            <div className="card" style={{ padding: 24, borderRadius: 22, marginBottom: 18 }}>
              <h3 style={{ marginBottom: 16 }}>Skills and experience</h3>
              <div style={{ display: "grid", gap: 16 }}>
                {area("Skills", "skills", "Java, React, SQL, teamwork")}
                {area("Technical Skills", "technicalSkills", "Spring Boot, Docker, AWS, REST APIs")}
                {area("Soft Skills", "softSkills", "Communication, teamwork, leadership")}
                {area("Languages", "languages", "English, Sinhala")}
                {area("Experience", "experience", "Internships, freelance work, volunteer experience")}
                {area("Projects Summary", "projectsSummary", "PathFinder internship platform, Smart Campus Management System")}
                {area("Internship Experience", "internshipExperience", "Worked on backend APIs, testing, deployment")}
                {area("Certifications", "certifications", "AWS Educate, IBM Java Developer")}
              </div>
            </div>

            <div className="card" style={{ padding: 24, borderRadius: 22, marginBottom: 18 }}>
              <h3 style={{ marginBottom: 16 }}>Career preferences</h3>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 16 }}>
                {area("Career Interests", "careerInterests", "Backend Development, DevOps, Cloud", 3)}
                {field("Preferred Job Type", "preferredJobType", "Internship")}
                {field("Work Mode", "workMode", "Hybrid")}
                {field("Available From", "availableFrom", "", "date")}
              </div>
            </div>

            <div className="card" style={{ padding: 24, borderRadius: 22, marginBottom: 18 }}>
              <h3 style={{ marginBottom: 16 }}>Portfolio links</h3>
              <div style={{ display: "grid", gap: 16 }}>
                {field("GitHub URL", "githubUrl", "https://github.com/your-username")}
                {field("LinkedIn URL", "linkedinUrl", "https://linkedin.com/in/your-profile")}
                {field("Portfolio URL", "portfolioUrl", "https://yourportfolio.com")}
              </div>
            </div>

            <div className="card" style={{ padding: 24, borderRadius: 22, marginBottom: 18 }}>
              <h3 style={{ marginBottom: 16 }}>CV upload</h3>
              {existingCvUrl && !removeCv ? (
                <div className="alert info" style={{ marginBottom: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    Current CV saved: <span style={{ wordBreak: "break-all" }}>{existingCvUrl}</span>
                  </div>
                  <button type="button" className="btn btn-outline btn-sm" style={{ background: "white", color: "var(--text)" }} onClick={() => setRemoveCv(true)}>Remove</button>
                </div>
              ) : removeCv && existingCvUrl ? (
                <div className="alert warning" style={{ marginBottom: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span>CV will be removed upon saving.</span>
                  <button type="button" className="btn btn-outline btn-sm" style={{ background: "white", color: "var(--text)" }} onClick={() => setRemoveCv(false)}>Undo</button>
                </div>
              ) : null}

              <label className="label">Upload CV (PDF, DOC, DOCX)</label>
              <input className="input" type="file" accept=".pdf,.doc,.docx" onChange={handleCvChange} id="cvFileInput" />

              {cvFile ? (
                <div className="helper" style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 10 }}>
                  Selected file: {cvFile.name}
                  <button type="button" className="btn btn-outline btn-sm" onClick={() => { setCvFile(null); document.getElementById('cvFileInput').value = ''; }}>Remove File</button>
                </div>
              ) : null}
            </div>

            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <button className="btn btn-primary" type="submit" disabled={saving}>
                {saving ? "Saving..." : "Save Profile"}
              </button>
              <Link to="/student/home" className="btn btn-outline">
                Cancel
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}