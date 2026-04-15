import { useEffect } from "react";
import { usePatient } from "../../hooks/usePatient";
import PatientProfileCard from "../../components/patient/PatientProfileCard";
import { Card, Spinner, Button } from "../../components/ui";
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
        <h1 className="text-2xl font-bold">Patient Dashboard</h1>
        <p className="text-slate-600">Overview of your health data</p>
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
            <div key={r._id} className="flex justify-between border-b py-2">
              <span>{r.originalName}</span>
              <a href={r.fileUrl} target="_blank" className="text-blue-500">
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