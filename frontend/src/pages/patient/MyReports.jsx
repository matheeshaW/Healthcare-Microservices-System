import { useEffect } from "react";
import { usePatient } from "../../hooks/usePatient";
import ReportUploader from "../../components/patient/ReportUploader";
import ReportList from "../../components/patient/ReportList";
import { Card, Spinner } from "../../components/ui";

function MyReports() {
  const {
    reports,
    fetchReports,
    addReport,
    deletePatientReport,
    loading,
    error
  } = usePatient();

  useEffect(() => {
    fetchReports();
  }, []);

  if (loading) return <Spinner label="Loading reports..." />;

  return (
    <div className="space-y-4">
      <Card border shadow="sm">
        <h2 className="text-xl font-bold text-slate-900">My Medical Reports</h2>
        <p className="mt-1 text-sm text-slate-600">
          Upload and manage your medical reports in one place.
        </p>
      </Card>

      {error && (
        <Card border shadow="sm">
          <p className="text-sm text-red-600">
            {error?.response?.data?.message || error?.message || "Something went wrong"}
          </p>
        </Card>
      )}

      <ReportUploader onUpload={addReport} />

      <ReportList
        reports={reports}
        onDelete={deletePatientReport}
      />
    </div>
  );
}

export default MyReports;