/**
 * File: src/App.jsx
 * Purpose: Frontend module for PathFinder.
 */
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import DashboardLayout from "./components/DashboardLayout";

import AuthChoose from "./pages/AuthChoose";
import Landing from "./pages/Landing";

import StudentLogin from "./pages/student/StudentLogin";
import StudentRegister from "./pages/student/StudentRegister";
import StudentHome from "./pages/student/StudentHome";
import StudentJobs from "./pages/student/StudentJobs";
import StudentProfile from "./pages/student/StudentProfile";
import StudentJobDetails from "./pages/student/StudentJobDetails";
import StudentApplications from "./pages/student/StudentApplications";
import StudentSavedJobs from "./pages/student/StudentSavedJobs";

import CompanyLogin from "./pages/company/CompanyLogin";
import CompanyRegister from "./pages/company/CompanyRegister";
import CompanyDashboard from "./pages/company/CompanyDashboard";
import PostJob from "./pages/company/PostJob";
import CompanyJobs from "./pages/company/CompanyJobs";
import CompanyJobDetails from "./pages/company/CompanyJobDetails";
import EditJob from "./pages/company/EditJob";
import CompanyApplicants from "./pages/company/CompanyApplicants";
import CompanyJobsPerMonthReport from "./pages/company/CompanyJobsPerMonthReport";
import CompanyApplicationsPerJobReport from "./pages/company/CompanyApplicationsPerJobReport";

import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminProfile from "./pages/admin/AdminProfile";
import AdminStudents from "./pages/admin/AdminStudents";
import AdminCompanies from "./pages/admin/AdminCompanies";
import AdminCompanyReview from "./pages/admin/AdminCompanyReview";
import AdminCompanyDetails from "./pages/admin/AdminCompanyDetails";
import AdminJobsPerMonthReport from "./pages/admin/AdminJobsPerMonthReport";
import AdminApplicationsPerJobReport from "./pages/admin/AdminApplicationsPerJobReport";

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/auth/choose" element={<AuthChoose />} />

        {/* Student Routes */}
        <Route path="/student/login" element={<StudentLogin />} />
        <Route path="/student/register" element={<StudentRegister />} />
        <Route
          path="/student/home"
          element={
            <ProtectedRoute allowRole="STUDENT">
              <DashboardLayout role="STUDENT">
                <StudentHome />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/profile"
          element={
            <ProtectedRoute allowRole="STUDENT">
              <DashboardLayout role="STUDENT">
                <StudentProfile />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/jobs"
          element={
            <ProtectedRoute allowRole="STUDENT">
              <DashboardLayout role="STUDENT">
                <StudentJobs />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/jobs/:id"
          element={
            <ProtectedRoute allowRole="STUDENT">
              <DashboardLayout role="STUDENT">
                <StudentJobDetails />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/applications"
          element={
            <ProtectedRoute allowRole="STUDENT">
              <DashboardLayout role="STUDENT">
                <StudentApplications />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/saved-jobs"
          element={
            <ProtectedRoute allowRole="STUDENT">
              <DashboardLayout role="STUDENT">
                <StudentSavedJobs />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        {/* Company Routes */}
        <Route path="/company/login" element={<CompanyLogin />} />
        <Route path="/company/register" element={<CompanyRegister />} />
        <Route
          path="/company/dashboard"
          element={
            <ProtectedRoute allowRole="COMPANY">
              <DashboardLayout role="COMPANY">
                <CompanyDashboard />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/company/post-job"
          element={
            <ProtectedRoute allowRole="COMPANY">
              <DashboardLayout role="COMPANY">
                <PostJob />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/company/jobs"
          element={
            <ProtectedRoute allowRole="COMPANY">
              <DashboardLayout role="COMPANY">
                <CompanyJobs />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/company/jobs/:id"
          element={
            <ProtectedRoute allowRole="COMPANY">
              <DashboardLayout role="COMPANY">
                <CompanyJobDetails />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/company/jobs/:id/edit"
          element={
            <ProtectedRoute allowRole="COMPANY">
              <DashboardLayout role="COMPANY">
                <EditJob />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/company/applicants"
          element={
            <ProtectedRoute allowRole="COMPANY">
              <DashboardLayout role="COMPANY">
                <CompanyApplicants />
              </DashboardLayout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/company/reports/jobs-per-month" 
          element={
            <ProtectedRoute allowRole="COMPANY">
              <DashboardLayout role="COMPANY">
                <CompanyJobsPerMonthReport />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/company/reports/jobs-per-month"
          element={
            <ProtectedRoute allowRole="COMPANY">
              <CompanyJobsPerMonthReport />
            </ProtectedRoute>
          }
        />
        <Route
          path="/company/reports/applications-per-job"
          element={
            <ProtectedRoute allowRole="COMPANY">
              <CompanyApplicationsPerJobReport />
            </ProtectedRoute>
          }
        />

        {/* Admin Routes */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute allowRole="ADMIN">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/profile"
          element={
            <ProtectedRoute allowRole="ADMIN">
              <AdminProfile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/students"
          element={
            <ProtectedRoute allowRole="ADMIN">
              <AdminStudents />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/companies"
          element={
            <ProtectedRoute allowRole="ADMIN">
              <AdminCompanies />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/companies/:id/review"
          element={
            <ProtectedRoute allowRole="ADMIN">
              <AdminCompanyReview />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/companies/:id/details"
          element={
            <ProtectedRoute allowRole="ADMIN">
              <AdminCompanyDetails />
            </ProtectedRoute>
          }
        />
        {/* Admin Report Routes (protected) */}
        <Route
          path="/admin/reports/jobs-per-month"
          element={
            <ProtectedRoute allowRole="ADMIN">
              <AdminJobsPerMonthReport />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/reports/applications-per-job"
          element={
            <ProtectedRoute allowRole="ADMIN">
              <AdminApplicationsPerJobReport />
            </ProtectedRoute>
          }
        />

        {/* Redirects */}
        <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}