import { BrowserRouter, Navigate, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import ProtectedRoute from "./routes/ProtectedRoute";
import DashboardLayout from "./components/layout/DashboardLayout";
import PatientProfile from "./pages/patient/PatientProfile";
import MyReports from "./pages/patient/MyReports";
import BookAppointment from "./pages/appointment/bookAppointment";
import MyAppointments from "./pages/appointment/myAppointments";
import AppointmentDetail from "./pages/appointment/appointmentDetail";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
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
          path="/admin"
          element={
            <ProtectedRoute roles={["admin"]}>
              <DashboardLayout>
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
