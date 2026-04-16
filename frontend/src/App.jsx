import { BrowserRouter, Routes, Route, Navigate, Link } from "react-router-dom";

// Auth pages
import Login from "./pages/Login";
import Register from "./pages/Register";

// Protected route component
import ProtectedRoute from "./routes/ProtectedRoute";

// Layout
import DashboardLayout from "./components/layout/DashboardLayout";
import Home from "./pages/Home";

// Patient Pages
import PatientProfile from "./pages/patient/PatientProfile";
import MyReports from "./pages/patient/MyReports";
import PatientDashboard from "./pages/patient/PatientDashboard";

// Doctor Pages
import DoctorDashboard from "./pages/doctor/DoctorDashboard";
import DoctorProfile from "./pages/doctor/DoctorProfile";
import ManageAvailability from "./pages/doctor/ManageAvailability";
import MyPrescriptions from "./pages/doctor/MyPrescriptions";

// Admin Pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import UserList from "./pages/admin/UserList";
import DoctorVerification from "./pages/admin/DoctorVerification";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* PUBLIC ROUTES (No Authentication Required)*/}

        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* DOCTOR ROUTES (doctor role required) */}

        <Route
          path="/doctor/dashboard"
          element={
            <ProtectedRoute roles={["doctor"]}>
              <DashboardLayout userRole="doctor">
                <DoctorDashboard />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/doctor/profile"
          element={
            <ProtectedRoute roles={["doctor"]}>
              <DashboardLayout userRole="doctor">
                <DoctorProfile />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/patient/profile"
          element={
            <ProtectedRoute roles={["patient"]}>
              <DashboardLayout>
                <PatientProfile />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/doctor/availability"
          element={
            <ProtectedRoute roles={["doctor"]}>
              <DashboardLayout userRole="doctor">
                <ManageAvailability />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/patient/dashboard"
          element={
            <ProtectedRoute roles={["patient"]}>
              <DashboardLayout>
                <PatientDashboard />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/patient/reports"
          element={
            <ProtectedRoute roles={["patient"]}>
              <DashboardLayout>
                <MyReports />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/doctor/prescriptions"
          element={
            <ProtectedRoute roles={["doctor"]}>
              <DashboardLayout userRole="doctor">
                <MyPrescriptions />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute roles={["admin"]}>
              <DashboardLayout userRole="admin">
                <AdminDashboard />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/users"
          element={
            <ProtectedRoute roles={["admin"]}>
              <DashboardLayout userRole="admin">
                <UserList />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/verify-doctors"
          element={
            <ProtectedRoute roles={["admin"]}>
              <DashboardLayout userRole="admin">
                <DoctorVerification />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin"
          element={
            <ProtectedRoute roles={["admin"]}>
              <Navigate to="/admin/dashboard" replace />
            </ProtectedRoute>
          }
        />

        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <Home />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route path="/dashboard" element={<Navigate to="/home" replace />} />

        {/* 404 Not Found */}
        <Route
          path="*"
          element={
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
              <div className="text-center space-y-4">
                <h1 className="text-6xl font-bold text-slate-900">404</h1>
                <p className="text-xl text-slate-600">Page not found</p>
                <Link
                  to="/login"
                  className="inline-block px-6 py-3 bg-cyan-600 text-white font-semibold rounded-lg hover:bg-cyan-700 transition"
                >
                  Back to Login
                </Link>
              </div>
            </div>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
