import { useEffect } from "react";
import { usePatient } from "../../hooks/usePatient";
import PatientProfileCard from "../../components/patient/PatientProfileCard";
import ReportList from "../../components/patient/ReportList";
import { Card, Spinner, Button, StatusChip } from "../../components/ui";
import { useNavigate } from "react-router-dom";

function PatientDashboard() {
  const {
    profile,
    reports,
    fetchProfile,
    fetchReports,
    deletePatientReport,
    loading,
  } = usePatient();
  const navigate = useNavigate();

  useEffect(() => {
    fetchProfile();
    fetchReports();
  }, []);

  if (loading) return <Spinner fullScreen label="Loading dashboard..." />;

  return (
    <div className="space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Patient Dashboard</h1>
        <p className="text-slate-600">Overview of your profile and latest medical reports</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card border shadow="sm">
          <p className="text-sm text-slate-500">Profile Status</p>
          <div className="mt-2">
            <StatusChip status={profile ? "active" : "pending"} />
          </div>
        </Card>

        <Card border shadow="sm">
          <p className="text-sm text-slate-500">Reports Uploaded</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">{reports.length}</p>
        </Card>

        <Card border shadow="sm">
          <p className="text-sm text-slate-500">Last Updated</p>
          <p className="mt-2 text-sm font-semibold text-slate-900">
            {profile?.updatedAt ? new Date(profile.updatedAt).toLocaleString() : "No profile yet"}
          </p>
        </Card>
      </div>

      {/* Profile Card */}
      <PatientProfileCard profile={profile} />

      {/* Quick Actions */}
      <Card>
        <h3 className="text-lg font-bold mb-3">Quick Actions</h3>

        <div className="flex gap-3 flex-wrap">
          <Button onClick={() => navigate("/patient/profile")}>
            Edit Profile
          </Button>

          <Button variant="secondary" onClick={() => navigate("/patient/reports")}>
            View Reports
          </Button>
        </div>
      </Card>

      {/* Recent Reports */}
      <Card>
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Recent Reports</h3>
            <p className="text-sm text-slate-600">
              Your latest uploaded reports at a glance.
            </p>
          </div>

          <Button variant="secondary" onClick={() => navigate("/patient/reports")}>
            View All
          </Button>
        </div>

        <ReportList reports={reports.slice(0, 3)} onDelete={deletePatientReport} />
      </Card>

    </div>
  );
}

export default PatientDashboard;