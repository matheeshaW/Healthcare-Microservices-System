import { BrowserRouter, Routes, Route, Navigate, Link } from "react-router-dom";

// Auth pages
import Login from "./pages/Login";
import Register from "./pages/Register";

// Protected route component
import ProtectedRoute from "./routes/ProtectedRoute";

// Layout
import DashboardLayout from "./components/layout/DashboardLayout";

// Doctor Pages
import DoctorDashboard from "./pages/doctor/DoctorDashboard";
import DoctorProfile from "./pages/doctor/DoctorProfile";
import ManageAvailability from "./pages/doctor/ManageAvailability";
import MyPrescriptions from "./pages/doctor/MyPrescriptions";

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
          path="/doctor/prescriptions"
          element={
            <ProtectedRoute roles={["doctor"]}>
              <DashboardLayout userRole="doctor">
                <MyPrescriptions />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        {/* Redirect /dashboard to /doctor/dashboard */}
        <Route
          path="/dashboard"
          element={<Navigate to="/doctor/dashboard" replace />}
        />

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
