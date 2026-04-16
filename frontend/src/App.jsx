import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import DashboardLayout from "./components/layout/DashboardLayout";
import Dashboard from "./pages/Dashboard";
import AppointmentDetail from "./pages/appointment/appointmentDetail";
import BookAppointment from "./pages/appointment/bookAppointment";
import MyAppointments from "./pages/appointment/myAppointments";
import DoctorDashboard from "./pages/doctor/DoctorDashboard";
import DoctorProfile from "./pages/doctor/DoctorProfile";
import ManageAvailability from "./pages/doctor/ManageAvailability";
import MyPrescriptions from "./pages/doctor/MyPrescriptions";
import Login from "./pages/Login";
import Register from "./pages/Register";
import MyReports from "./pages/patient/MyReports";
import PatientProfile from "./pages/patient/PatientProfile";
import ProtectedRoute from "./routes/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route path="/profile" element={<Navigate to="/patient/profile" replace />} />
        <Route path="/reports" element={<Navigate to="/patient/reports" replace />} />
        <Route path="/appointments" element={<Navigate to="/appointment/my" replace />} />
        <Route path="/patient/appointments" element={<Navigate to="/appointment/my" replace />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardLayout userRole="patient">
                <Dashboard />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/patient/profile"
          element={
            <ProtectedRoute roles={["patient"]}>
              <DashboardLayout userRole="patient">
                <PatientProfile />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/patient/reports"
          element={
            <ProtectedRoute roles={["patient"]}>
              <DashboardLayout userRole="patient">
                <MyReports />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/appointment/book"
          element={
            <ProtectedRoute roles={["patient"]}>
              <DashboardLayout userRole="patient">
                <BookAppointment />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/appointment/my"
          element={
            <ProtectedRoute roles={["patient"]}>
              <DashboardLayout userRole="patient">
                <MyAppointments />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/appointment/:id"
          element={
            <ProtectedRoute roles={["patient"]}>
              <DashboardLayout userRole="patient">
                <AppointmentDetail />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

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

        <Route
          path="/admin"
          element={
            <ProtectedRoute roles={["admin"]}>
              <DashboardLayout userRole="admin">
                <h1 className="text-2xl font-bold text-slate-900">Admin Dashboard</h1>
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
