import { useEffect } from "react";
import { usePatient } from "../../hooks/usePatient";
import ReportUploader from "../../components/patient/ReportUploader";
import ReportList from "../../components/patient/ReportList";
import { Spinner } from "../../components/ui";

function MyReports() {
  const { reports, fetchReports, addReport, loading } = usePatient();

  useEffect(() => {
    fetchReports();
  }, []);

  if (loading) return <Spinner label="Loading reports..." />;

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">My Reports</h2>

      <ReportUploader onUpload={addReport} />
      <ReportList reports={reports} />
    </div>
  );
}

export default MyReports;