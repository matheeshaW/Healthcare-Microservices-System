import { useEffect } from "react";
import { usePatient } from "../../hooks/usePatient";
import PatientProfileCard from "../../components/patient/PatientProfileCard";
import { Card, Spinner, Button, StatusChip, Badge } from "../../components/ui";
import { useNavigate } from "react-router-dom";

function PatientDashboard() {
  const { profile, reports, fetchProfile, fetchReports, loading } = usePatient();
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
        <h3 className="text-lg font-bold mb-3">Recent Reports</h3>

        {reports.length === 0 ? (
          <p className="text-slate-500">No reports uploaded yet</p>
        ) : (
          reports.slice(0, 3).map((r) => (
            <div key={r._id} className="flex flex-col gap-2 border-b py-3 last:border-b-0 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="font-semibold text-slate-900">{r.originalName}</p>
                <div className="mt-1 flex flex-wrap gap-2">
                  <Badge variant="default">{new Date(r.createdAt).toLocaleDateString()}</Badge>
                  {r.category && <Badge variant="primary">{r.category}</Badge>}
                </div>
              </div>
              <a href={r.fileUrl} target="_blank" rel="noreferrer" className="text-cyan-600 hover:text-cyan-700">
                View
              </a>
            </div>
          ))
        )}
      </Card>

    </div>
  );
}

export default PatientDashboard;