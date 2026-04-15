import { BrowserRouter, Navigate, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import ProtectedRoute from "./routes/ProtectedRoute";

// Layout
import DashboardLayout from "./components/layout/DashboardLayout";
import PatientProfile from "./pages/patient/PatientProfile";
import MyReports from "./pages/patient/MyReports";
import BookAppointment from "./pages/appointment/bookAppointment";
import MyAppointments from "./pages/appointment/myAppointments";
import AppointmentDetail from "./pages/appointment/appointmentDetail";

// Doctor Pages
import DoctorDashboard from "./pages/doctor/DoctorDashboard";
import DoctorProfile from "./pages/doctor/DoctorProfile";
import ManageAvailability from "./pages/doctor/ManageAvailability";
import MyPrescriptions from "./pages/doctor/MyPrescriptions";

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

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <Dashboard />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

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

        {/* PATIENT ROUTES */}

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

        {/* ADMIN ROUTE */}

        <Route
          path="/admin"
          element={
            <ProtectedRoute roles={["admin"]}>
              <DashboardLayout userRole="admin">
                <h1>Admin Dashboard</h1>
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/appointment/book"
          element={
            <ProtectedRoute roles={["patient"]}>
              <DashboardLayout>
                <BookAppointment />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/appointment/my"
          element={
            <ProtectedRoute roles={["patient"]}>
              <DashboardLayout>
                <MyAppointments />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/appointment/:id"
          element={
            <ProtectedRoute roles={["patient"]}>
              <DashboardLayout>
                <AppointmentDetail />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

