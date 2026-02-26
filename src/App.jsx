import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "../components/Navbar";
import Landing from "./pages/Landing";

import StudentLogin from "./pages/student/StudentLogin";
import StudentRegister from "./pages/student/StudentRegister";
import StudentHome from "./pages/student/StudentHome";

import CompanyLogin from "./pages/company/CompanyLogin";
import CompanyRegister from "./pages/company/CompanyRegister";

import AdminLogin from "./pages/admin/AdminLogin";

import ProtectedRoute from "../components/ProtectedRoute";

import CompanyDashboard from "./pages/company/CompanyDashboard";

import AuthChoose from "./pages/AuthChoose";

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/auth/choose" element={<AuthChoose />} />

        {/* Student */}
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

        {/* Company */}
        <Route path="/company/login" element={<CompanyLogin />} />
        <Route path="/company/register" element={<CompanyRegister />} />
        <Route path="/company/dashboard" element={<ProtectedRoute allowRole="COMPANY"><CompanyDashboard />
    </ProtectedRoute>
  }
/>

        {/* Admin */}
        <Route path="/admin/login" element={<AdminLogin />} />
      </Routes>
    </BrowserRouter>
  );
}