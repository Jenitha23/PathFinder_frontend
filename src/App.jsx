/**
 * File: src/App.jsx
 * Purpose: Frontend module for PathFinder.
 */
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";

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

import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminProfile from "./pages/admin/AdminProfile";
import AdminStudents from "./pages/admin/AdminStudents";
import AdminCompanies from "./pages/admin/AdminCompanies";
// NEW: Import admin company review and details pages
import AdminCompanyReview from "./pages/admin/AdminCompanyReview";
import AdminCompanyDetails from "./pages/admin/AdminCompanyDetails";

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
              <StudentHome />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/profile"
          element={
            <ProtectedRoute allowRole="STUDENT">
              <StudentProfile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/jobs"
          element={
            <ProtectedRoute allowRole="STUDENT">
              <StudentJobs />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/jobs/:id"
          element={
            <ProtectedRoute allowRole="STUDENT">
              <StudentJobDetails />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/applications"
          element={
            <ProtectedRoute allowRole="STUDENT">
              <StudentApplications />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/saved-jobs"
          element={
            <ProtectedRoute allowRole="STUDENT">
              <StudentSavedJobs />
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
              <CompanyDashboard />
            </ProtectedRoute>
          }
        />
        <Route 
          path="/company/post-job" 
          element={
            <ProtectedRoute allowRole="COMPANY">
              <PostJob />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/company/jobs" 
          element={
            <ProtectedRoute allowRole="COMPANY">
              <CompanyJobs />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/company/jobs/:id" 
          element={
            <ProtectedRoute allowRole="COMPANY">
              <CompanyJobDetails />
            </ProtectedRoute>
          }
        />
        <Route 
          path="/company/jobs/:id/edit" 
          element={
            <ProtectedRoute allowRole="COMPANY">
              <EditJob />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/company/applicants" 
          element={
            <ProtectedRoute allowRole="COMPANY">
              <CompanyApplicants />
            </ProtectedRoute>
          } 
        />

        {/* Admin Routes - Existing */}
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

        {/* NEW: Admin Company Approval Routes */}
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

        {/* Redirects */}
        <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}