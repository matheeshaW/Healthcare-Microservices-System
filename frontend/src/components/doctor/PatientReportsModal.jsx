import { useState, useEffect } from "react";
import { getPatientReports } from "../../api/patient.api";
import { Card, Button, Spinner } from "../../components/ui";

export const PatientReportsModal = ({ patientId, onClose }) => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadReports();
  }, [patientId]);

  const loadReports = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await getPatientReports(patientId);
      // Backend returns { success: true, data: reports }
      const reportsData = response.data?.data || response.data || [];
      setReports(Array.isArray(reportsData) ? reportsData : []);
    } catch (err) {
      setError(
        typeof err === "string"
          ? err
          : err?.message || "Failed to load reports",
      );
    } finally {
      setLoading(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return "N/A";
    const sizes = ["B", "KB", "MB", "GB"];
    if (bytes === 0) return "0 B";
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + " " + sizes[i];
  };

  const formatDate = (value) => {
    if (!value) return "N/A";
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime())
      ? value
      : parsed.toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card padding="lg" className="w-full max-w-2xl max-h-96 overflow-y-auto">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-200 pb-4">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">
                Patient Medical Reports
              </h2>
              <p className="text-sm text-slate-600 mt-1">
                Patient ID: {String(patientId).slice(-6)}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-2xl text-slate-400 hover:text-slate-600 transition"
            >
              ✕
            </button>
          </div>

          {/* Content */}
          {loading ? (
            <div className="text-center py-8">
              <Spinner size="lg" variant="primary" label="Loading reports..." />
            </div>
          ) : error ? (
            <Card padding="md" className="bg-red-50 border border-red-200">
              <p className="text-red-700 font-semibold">{error}</p>
              <Button
                variant="danger"
                size="sm"
                onClick={loadReports}
                className="mt-3"
              >
                Retry
              </Button>
            </Card>
          ) : reports.length === 0 ? (
            <Card padding="md" className="text-center bg-slate-50">
              <p className="text-slate-600 font-medium">
                No medical reports uploaded yet
              </p>
            </Card>
          ) : (
            <div className="space-y-3">
              {reports.map((report) => (
                <Card
                  key={report._id}
                  padding="md"
                  className="border border-slate-200 hover:border-cyan-300 transition"
                >
                  <div className="space-y-3">
                    {/* Report Header */}
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <p className="font-semibold text-slate-900 text-lg break-all">
                          {report.name}
                        </p>
                        <p className="text-sm text-slate-600 mt-1">
                          {report.originalName}
                        </p>
                      </div>
                      {report.category && (
                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-cyan-100 text-cyan-700 whitespace-nowrap">
                          {report.category}
                        </span>
                      )}
                    </div>

                    {/* Report Details */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                      <div>
                        <p className="text-slate-600 font-medium uppercase text-xs">
                          Uploaded
                        </p>
                        <p className="text-slate-900 font-semibold mt-1">
                          {formatDate(report.createdAt)}
                        </p>
                      </div>
                      <div>
                        <p className="text-slate-600 font-medium uppercase text-xs">
                          File Type
                        </p>
                        <p className="text-slate-900 font-semibold mt-1">
                          {report.fileType?.split("/")[1]?.toUpperCase() ||
                            "Unknown"}
                        </p>
                      </div>
                      <div>
                        <p className="text-slate-600 font-medium uppercase text-xs">
                          File Size
                        </p>
                        <p className="text-slate-900 font-semibold mt-1">
                          {formatFileSize(report.sizeBytes)}
                        </p>
                      </div>
                      <div>
                        <p className="text-slate-600 font-medium uppercase text-xs">
                          Status
                        </p>
                        <p className="text-emerald-600 font-semibold mt-1">
                          Uploaded
                        </p>
                      </div>
                    </div>

                    {/* Notes */}
                    {report.notes && (
                      <div className="pt-2 border-t border-slate-200">
                        <p className="text-sm text-slate-600 font-medium mb-1">
                          Notes:
                        </p>
                        <p className="text-slate-700 text-sm whitespace-pre-wrap">
                          {report.notes}
                        </p>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-2 pt-3 border-t border-slate-200">
                      {report.fileUrl && (
                        <a
                          href={report.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-2 text-sm bg-cyan-600 text-white font-medium rounded-lg hover:bg-cyan-700 transition"
                        >
                          Download
                        </a>
                      )}
                      {report.fileUrl && (
                        <a
                          href={report.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-2 text-sm bg-slate-200 text-slate-700 font-medium rounded-lg hover:bg-slate-300 transition"
                        >
                          View
                        </a>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {/* Close button */}
          <div className="flex justify-end gap-3 border-t border-slate-200 pt-4">
            <Button variant="secondary" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default PatientReportsModal;
