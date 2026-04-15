import { useEffect, useState } from "react";
import { getReports } from "../../api/patient.api";
import ReportUploader from "../../components/patient/ReportUploader";
import ReportList from "../../components/patient/ReportList";

function MyReports() {
  const [reports, setReports] = useState([]);

  const fetchReports = async () => {
    const res = await getReports();
    setReports(res.data.data);
  };

  useEffect(() => {
    fetchReports();
  }, []);

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">My Reports</h2>

      <ReportUploader onUpload={fetchReports} />

      <ReportList reports={reports} />
    </div>
  );
}

export default MyReports;