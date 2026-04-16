/**
 * MyPrescriptions Page
 */

import { useState, useEffect } from "react";
import { Card, Badge, Button } from "../../components/ui";
import { usePrescriptions } from "../../hooks/usePrescriptions";

export const MyPrescriptions = () => {
  const {
    filteredPrescriptions,
    allPrescriptions,
    loading,
    error,
    filterStatus,
    fetchMyPrescriptions,
    setFilterStatus,
    clearError,
    counts,
  } = usePrescriptions();

  const [selectedPrescription, setSelectedPrescription] = useState(null);
  const [isDownloading, setIsDownloading] = useState(false);

  // Fetch prescriptions on mount
  useEffect(() => {
    fetchMyPrescriptions();
  }, [fetchMyPrescriptions]);

  const handleDownloadPrescription = async (prescriptionId) => {
    setIsDownloading(true);
    try {
      // TODO: Implement actual PDF download from backend
      // For now, simulate delay
      await new Promise((resolve) => setTimeout(resolve, 1000));
    } finally {
      setIsDownloading(false);
    }
  };

  const renderPrescriptionDetails = () => {
    if (!selectedPrescription) return null;

    const prescription = allPrescriptions.find(
      (p) => p.id === selectedPrescription,
    );

    if (!prescription) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <Card
          padding="lg"
          className="max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-200">
            <h3 className="text-2xl font-bold text-slate-900">
              Prescription Details
            </h3>
            <button
              onClick={() => setSelectedPrescription(null)}
              className="text-slate-500 hover:text-slate-700 text-2xl"
            >
              ×
            </button>
          </div>

          {/* Patient Info */}
          <div className="space-y-4 mb-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-slate-600 uppercase tracking-wide">
                  Patient ID
                </p>
                <p className="text-lg font-bold text-slate-900">
                  {prescription.patientId}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-600 uppercase tracking-wide">
                  Date Issued
                </p>
                <p className="text-lg font-bold text-slate-900">
                  {new Date(prescription.date).toLocaleDateString()}
                </p>
              </div>
            </div>

            <div>
              <p className="text-xs text-slate-600 uppercase tracking-wide">
                Diagnosis
              </p>
              <p className="text-slate-900 mt-1">{prescription.diagnosis}</p>
            </div>
          </div>

          {/* Medicines */}
          <div className="mb-6 pb-6 border-b border-slate-200">
            <h4 className="font-bold text-slate-900 mb-3">Medicines</h4>
            <div className="space-y-3">
              {prescription.medicines && prescription.medicines.length > 0 ? (
                prescription.medicines.map((medicine, idx) => (
                  <Card key={idx} padding="md" className="bg-slate-50">
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <p className="text-xs text-slate-600 uppercase tracking-wide">
                          Medicine
                        </p>
                        <p className="font-semibold text-slate-900">
                          {medicine.name}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-600 uppercase tracking-wide">
                          Dosage
                        </p>
                        <p className="font-semibold text-slate-900">
                          {medicine.dosage}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-600 uppercase tracking-wide">
                          Frequency
                        </p>
                        <p className="font-semibold text-slate-900">
                          {medicine.frequency}
                        </p>
                      </div>
                    </div>
                  </Card>
                ))
              ) : (
                <p className="text-slate-600">No medicines recorded</p>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              variant="primary"
              fullWidth
              onClick={() => handleDownloadPrescription(prescription.id)}
              loading={isDownloading}
              disabled={isDownloading}
            >
              Download PDF
            </Button>
            <Button
              variant="secondary"
              fullWidth
              onClick={() => setSelectedPrescription(null)}
            >
              Close
            </Button>
          </div>
        </Card>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-4xl font-bold text-slate-900 mb-2">
          My Prescriptions
        </h1>
        <p className="text-slate-600">
          View and manage prescriptions you have issued
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <Card padding="md" className="bg-red-50 border border-red-200">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <h4 className="font-semibold text-red-900 mb-1">
                Failed to Load Prescriptions
              </h4>
              <p className="text-sm text-red-700">{error}</p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={fetchMyPrescriptions}
              >
                Retry
              </Button>
              <button
                onClick={clearError}
                className="text-red-500 hover:text-red-700"
              >
                ×
              </button>
            </div>
          </div>
        </Card>
      )}

      {/* Loading State */}
      {loading && (
        <Card padding="lg" className="text-center">
          <div className="inline-block">
            <div className="w-8 h-8 border-4 border-slate-200 border-t-cyan-600 rounded-full animate-spin"></div>
          </div>
          <p className="text-slate-600 mt-3">Loading prescriptions...</p>
        </Card>
      )}

      {/* Content (only show when not loading) */}
      {!loading && (
        <>
          {/* Filter Buttons */}
          <div className="flex gap-2 flex-wrap">
            <Button
              variant={filterStatus === "all" ? "primary" : "secondary"}
              size="sm"
              onClick={() => setFilterStatus("all")}
            >
              All ({counts.all})
            </Button>
            <Button
              variant={filterStatus === "active" ? "primary" : "secondary"}
              size="sm"
              onClick={() => setFilterStatus("active")}
            >
              Active ({counts.active})
            </Button>
            <Button
              variant={filterStatus === "completed" ? "primary" : "secondary"}
              size="sm"
              onClick={() => setFilterStatus("completed")}
            >
              Completed ({counts.completed})
            </Button>
          </div>

          {/* Prescriptions List */}
          {filteredPrescriptions.length === 0 ? (
            <Card padding="lg" className="text-center">
              <p className="text-slate-600">
                {allPrescriptions.length === 0
                  ? "No prescriptions found"
                  : "No prescriptions match the selected filter"}
              </p>
            </Card>
          ) : (
            <div className="space-y-3">
              {filteredPrescriptions.map((prescription) => (
                <Card
                  key={prescription.id}
                  padding="md"
                  hoverEffect={true}
                  className="cursor-pointer"
                >
                  <div className="flex items-start justify-between gap-4">
                    {/* Left Section */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-bold text-slate-900">
                          {prescription.patientId}
                        </h3>
                        <Badge variant="info" size="sm">
                          Patient
                        </Badge>
                      </div>

                      <p className="text-sm text-slate-700 mb-2">
                        <span className="font-semibold">Diagnosis:</span>{" "}
                        {prescription.diagnosis}
                      </p>

                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-600">
                          {new Date(prescription.date).toLocaleDateString()}
                        </span>
                        <span className="text-xs text-slate-600">•</span>
                        <span className="text-xs text-slate-600">
                          {prescription.medicines.length} medicines
                        </span>
                      </div>
                    </div>

                    {/* Right Section */}
                    <div className="flex items-center gap-3">
                      <Badge
                        variant={
                          prescription.status === "active"
                            ? "success"
                            : "default"
                        }
                        size="sm"
                      >
                        {prescription.status.charAt(0).toUpperCase() +
                          prescription.status.slice(1)}
                      </Badge>

                      <button
                        onClick={() => setSelectedPrescription(prescription.id)}
                        className="px-3 py-1.5 text-sm font-semibold text-cyan-600 hover:bg-cyan-50 rounded-lg transition"
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </>
      )}

      {/* Modal */}
      {selectedPrescription && renderPrescriptionDetails()}
    </div>
  );
};

export default MyPrescriptions;
