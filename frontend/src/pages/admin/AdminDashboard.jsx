/**
 * Admin Dashboard Page
 * Overview of system statistics and quick actions
 */

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, Spinner, Button, Badge } from "../../components/ui";
import API from "../../api/axios";

export const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalDoctors: 0,
    pendingDoctors: 0,
    activeAppointments: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const usersRes = await API.get("/admin/users");
      const doctorsRes = await API.get("/doctors/all?verified=all");
      const appointmentsRes = await API.get("/appointments/admin/all");

      const totalUsers = usersRes.data.data.length;
      const totalDoctors = doctorsRes.data.data.length;
      const pendingDoctors = doctorsRes.data.data.filter(
        (d) => !d.verified,
      ).length;
      const todayKey = new Date().toISOString().slice(0, 10);
      const activeAppointments = appointmentsRes.data.data.filter(
        (appointment) => new Date(appointment.date).toISOString().slice(0, 10) === todayKey,
      ).length;

      setStats({
        totalUsers,
        totalDoctors,
        pendingDoctors,
        activeAppointments,
      });
    } catch (err) {
      console.error("Failed to fetch stats:", err);
      setError("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-4xl font-bold text-slate-900 mb-2">
          Admin Dashboard
        </h1>
        <p className="text-slate-600">
          Monitor and manage your healthcare system
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <Card padding="md" className="bg-red-50 border border-red-200">
          <p className="text-red-700 font-semibold">{error}</p>
        </Card>
      )}

      {/* Loading State */}
      {loading && (
        <Card padding="lg" className="text-center">
          <Spinner size="lg" variant="primary" label="Loading dashboard..." />
        </Card>
      )}

      {/* Statistics Grid */}
      {!loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Users */}
          <Card
            padding="md"
            className="bg-gradient-to-br from-cyan-50 to-cyan-100 border-0"
          >
            <div>
              <p className="text-sm font-semibold text-slate-600 uppercase tracking-wide">
                Total Users
              </p>
              <p className="text-3xl font-bold text-cyan-600 mt-2">
                {stats.totalUsers}
              </p>
              <p className="text-xs text-slate-600 mt-2">Active system users</p>
            </div>
          </Card>

          {/* Total Doctors */}
          <Card
            padding="md"
            className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-0"
          >
            <div>
              <p className="text-sm font-semibold text-slate-600 uppercase tracking-wide">
                Total Doctors
              </p>
              <p className="text-3xl font-bold text-emerald-600 mt-2">
                {stats.totalDoctors}
              </p>
              <p className="text-xs text-slate-600 mt-2">Registered doctors</p>
            </div>
          </Card>

          {/* Pending Verifications */}
          <Card
            padding="md"
            className="bg-gradient-to-br from-amber-50 to-amber-100 border-0"
          >
            <div>
              <p className="text-sm font-semibold text-slate-600 uppercase tracking-wide">
                Pending Verification
              </p>
              <p className="text-3xl font-bold text-amber-600 mt-2">
                {stats.pendingDoctors}
              </p>
              <p className="text-xs text-slate-600 mt-2">Awaiting approval</p>
            </div>
          </Card>

          {/* Active Appointments */}
          <Card
            padding="md"
            className="bg-gradient-to-br from-violet-50 to-violet-100 border-0"
          >
            <div>
              <p className="text-sm font-semibold text-slate-600 uppercase tracking-wide">
                Appointments
              </p>
              <p className="text-3xl font-bold text-violet-600 mt-2">
                {stats.activeAppointments}
              </p>
              <p className="text-xs text-slate-600 mt-2">Today's schedule</p>
            </div>
          </Card>
        </div>
      )}

      {/* Quick Actions */}
      {!loading && (
        <Card padding="lg" className="space-y-4">
          <h2 className="text-xl font-bold text-slate-900 mb-4">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Button
              variant="primary"
              fullWidth
              onClick={() => navigate("/admin/users")}
            >
              View All Users
            </Button>
            <Button
              variant="primary"
              fullWidth
              onClick={() => navigate("/admin/verify-doctors")}
            >
              Verify Doctors
            </Button>
            <Button
              variant="primary"
              fullWidth
              onClick={() => navigate("/admin/appointments")}
            >
              View Appointments
            </Button>
          </div>
        </Card>
      )}

      {/* System Overview */}
      {!loading && (
        <Card padding="lg" className="space-y-4">
          <h2 className="text-xl font-bold text-slate-900 mb-4">
            System Overview
          </h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 border border-slate-200 rounded-lg">
              <div>
                <p className="font-semibold text-slate-900">User Management</p>
                <p className="text-sm text-slate-600">
                  View and manage all system users
                </p>
              </div>
              <Badge variant="default">Active</Badge>
            </div>
            <div className="flex items-center justify-between p-3 border border-slate-200 rounded-lg">
              <div>
                <p className="font-semibold text-slate-900">
                  Doctor Verification
                </p>
                <p className="text-sm text-slate-600">
                  {stats.pendingDoctors} doctors pending verification
                </p>
              </div>
              <Badge variant="warning">{stats.pendingDoctors}</Badge>
            </div>
            <div className="flex items-center justify-between p-3 border border-slate-200 rounded-lg">
              <div>
                <p className="font-semibold text-slate-900">Doctor Directory</p>
                <p className="text-sm text-slate-600">
                  Manage all registered doctors
                </p>
              </div>
              <Badge variant="default">{stats.totalDoctors}</Badge>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default AdminDashboard;
