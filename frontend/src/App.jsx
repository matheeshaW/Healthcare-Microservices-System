import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import ProtectedRoute from "./routes/ProtectedRoute";
import DashboardLayout from "./components/layout/DashboardLayout";
import PatientProfile from "./pages/patient/PatientProfile";
import MyReports from "./pages/patient/MyReports";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />

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
      </Routes>


    </BrowserRouter>
  );
}

export default App;