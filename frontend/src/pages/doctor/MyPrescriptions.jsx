/**
 * MyPrescriptions Page
 */

import { useState } from "react";
import { Card, Badge, Button, Spinner } from "../../components/ui";

export const MyPrescriptions = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPrescription, setSelectedPrescription] = useState(null);

  // Mock prescription data
  const [prescriptions] = useState([
    {
      id: 1,
      patientName: "John Doe",
      patientId: "P001",
      date: "2024-05-18",
      diagnosis: "Hypertension with elevated blood pressure levels",
      medicines: [
        { name: "Lisinopril", dosage: "10mg", frequency: "Once a day" },
        { name: "Amlodipine", dosage: "5mg", frequency: "Once a day" },
      ],
      status: "active",
    },
    {
      id: 2,
      patientName: "Jane Smith",
      patientId: "P002",
      date: "2024-05-15",
      diagnosis: "Type 2 Diabetes Mellitus",
      medicines: [
        { name: "Metformin", dosage: "500mg", frequency: "Twice a day" },
        { name: "Glipizide", dosage: "5mg", frequency: "Once a day" },
      ],
      status: "active",
    },
    {
      id: 3,
      patientName: "Bob Wilson",
      patientId: "P003",
      date: "2024-05-10",
      diagnosis: "Allergic Rhinitis",
      medicines: [
        { name: "Cetirizine", dosage: "10mg", frequency: "Once a day" },
      ],
      status: "completed",
    },
  ]);

  const handleDownloadPrescription = async (prescriptionId) => {
    setIsLoading(true);
    try {
      // Simulate download
      await new Promise((resolve) => setTimeout(resolve, 1000));
      console.log("Downloaded prescription:", prescriptionId);
    } finally {
      setIsLoading(false);
    }
  };

  const renderPrescriptionDetails = () => {
    if (!selectedPrescription) return null;

    const prescription = prescriptions.find(
      (p) => p.id === selectedPrescription,
    );

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
                  Patient Name
                </p>
                <p className="text-lg font-bold text-slate-900">
                  {prescription.patientName}
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
              {prescription.medicines.map((medicine, idx) => (
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
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              variant="primary"
              fullWidth
              onClick={() => handleDownloadPrescription(prescription.id)}
              loading={isLoading}
              disabled={isLoading}
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

      {/* Filter Buttons */}
      <div className="flex gap-2 flex-wrap">
        <Button variant="primary" size="sm">
          All ({prescriptions.length})
        </Button>
        <Button variant="secondary" size="sm">
          Active ({prescriptions.filter((p) => p.status === "active").length})
        </Button>
        <Button variant="secondary" size="sm">
          Completed (
          {prescriptions.filter((p) => p.status === "completed").length})
        </Button>
      </div>

      {/* Prescriptions List */}
      {prescriptions.length === 0 ? (
        <Card padding="lg" className="text-center">
          <p className="text-slate-600">No prescriptions found</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {prescriptions.map((prescription) => (
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
                      {prescription.patientName}
                    </h3>
                    <Badge variant="info" size="sm">
                      {prescription.patientId}
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
                      prescription.status === "active" ? "success" : "default"
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

      {/* Modal */}
      {selectedPrescription && renderPrescriptionDetails()}
    </div>
  );
};

export default MyPrescriptions;
