import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { getPrescriptionByAppointment } from "../../api/prescription.api";
import { Card, Spinner, Button } from "../../components/ui";

export const PrescriptionDetail = () => {
  const { appointmentId } = useParams();
  const navigate = useNavigate();
  const [prescription, setPrescription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    const loadPrescription = async () => {
      setLoading(true);
      setError("");

      try {
        const data = await getPrescriptionByAppointment(appointmentId);
        if (!data) {
          setError("No prescription found for this appointment");
        } else {
          setPrescription(data);
        }
      } catch (err) {
        setError(
          typeof err === "string"
            ? err
            : err?.message || "Failed to load prescription",
        );
      } finally {
        setLoading(false);
      }
    };

    if (appointmentId) {
      loadPrescription();
    }
  }, [appointmentId]);

  if (loading) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto">
        <Link
          to="/appointment/my"
          className="text-cyan-600 hover:text-cyan-700 font-semibold"
        >
          ← Back to My Appointments
        </Link>
        <Card padding="lg" className="text-center">
          <Spinner
            size="lg"
            variant="primary"
            label="Loading prescription..."
          />
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto">
        <Link
          to="/appointment/my"
          className="text-cyan-600 hover:text-cyan-700 font-semibold"
        >
          ← Back to My Appointments
        </Link>
        <Card padding="lg" className="bg-red-50 border border-red-200">
          <div className="space-y-4">
            <p className="text-red-700 font-semibold">{error}</p>
            <Button
              variant="danger"
              onClick={() => navigate("/appointment/my")}
            >
              Go Back
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  if (!prescription) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto">
        <Link
          to="/appointment/my"
          className="text-cyan-600 hover:text-cyan-700 font-semibold"
        >
          ← Back to My Appointments
        </Link>
        <Card padding="lg" className="text-center space-y-4">
          <p className="text-slate-600 font-medium">
            No prescription available
          </p>
          <Button
            variant="secondary"
            onClick={() => navigate("/appointment/my")}
          >
            Go Back
          </Button>
        </Card>
      </div>
    );
  }

  const formatDate = (value) => {
    if (!value) return "N/A";
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime())
      ? value
      : parsed.toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        });
  };

  // Download PDF function
  const downloadPrescriptionPDF = async () => {
    if (!prescription) return;

    try {
      setDownloading(true);

      // Dynamically import html2pdf
      const html2pdf = (await import("html2pdf.js")).default;

      // Create plain HTML with inline styles (avoids Tailwind parsing)
      const pdfContent = `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
          <h1 style="text-align: center; color: #1e293b; margin-bottom: 30px; font-size: 28px;">Prescription Details</h1>
          
          <div style="border: 1px solid #e2e8f0; padding: 15px; margin-bottom: 20px; background-color: #f0f9ff;">
            <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px;">
              <div>
                <p style="font-size: 11px; color: #64748b; text-transform: uppercase; font-weight: bold; margin-bottom: 5px;">Issued Date</p>
                <p style="font-size: 16px; font-weight: bold; color: #1e293b;">${formatDate(prescription.createdAt)}</p>
              </div>
              <div>
                <p style="font-size: 11px; color: #64748b; text-transform: uppercase; font-weight: bold; margin-bottom: 5px;">Status</p>
                <p style="font-size: 16px; font-weight: bold; color: #1e293b; text-transform: capitalize;">${prescription.status || "Issued"}</p>
              </div>
              <div>
                <p style="font-size: 11px; color: #64748b; text-transform: uppercase; font-weight: bold; margin-bottom: 5px;">Last Updated</p>
                <p style="font-size: 16px; font-weight: bold; color: #1e293b;">${formatDate(prescription.updatedAt)}</p>
              </div>
            </div>
          </div>

          <div style="border: 1px solid #e2e8f0; padding: 15px; margin-bottom: 20px;">
            <h3 style="font-size: 16px; font-weight: bold; color: #1e293b; margin-bottom: 10px;">Diagnosis & Clinical Notes</h3>
            <p style="color: #475569; line-height: 1.6; white-space: pre-wrap;">${prescription.notes || "N/A"}</p>
          </div>

          <div>
            <h3 style="font-size: 16px; font-weight: bold; color: #1e293b; margin-bottom: 15px;">Prescribed Medications</h3>
            ${
              prescription.medicines && prescription.medicines.length > 0
                ? prescription.medicines
                    .map(
                      (medicine) => `
                    <div style="border: 1px solid #e2e8f0; padding: 15px; margin-bottom: 15px; background-color: #f8fafc;">
                      <p style="font-size: 16px; font-weight: bold; color: #1e293b; margin-bottom: 10px; padding-bottom: 10px; border-bottom: 1px solid #e2e8f0;">${medicine.name}</p>
                      <div style="display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap: 15px;">
                        <div>
                          <p style="font-size: 11px; color: #64748b; text-transform: uppercase; font-weight: bold; margin-bottom: 5px;">Dosage</p>
                          <p style="color: #1e293b; font-weight: bold;">${medicine.dosage}</p>
                        </div>
                        <div>
                          <p style="font-size: 11px; color: #64748b; text-transform: uppercase; font-weight: bold; margin-bottom: 5px;">Frequency</p>
                          <p style="color: #1e293b; font-weight: bold;">${medicine.frequency}</p>
                        </div>
                        <div>
                          <p style="font-size: 11px; color: #64748b; text-transform: uppercase; font-weight: bold; margin-bottom: 5px;">Duration</p>
                          <p style="color: #1e293b; font-weight: bold;">${medicine.duration}</p>
                        </div>
                        <div>
                          <p style="font-size: 11px; color: #64748b; text-transform: uppercase; font-weight: bold; margin-bottom: 5px;">Instructions</p>
                          <p style="color: #1e293b; font-weight: bold;">${medicine.instructions || "N/A"}</p>
                        </div>
                      </div>
                    </div>
                  `,
                    )
                    .join("")
                : "<p style='color: #64748b;'>No medicines prescribed</p>"
            }
          </div>
        </div>
      `;

      const options = {
        margin: 10,
        filename: `prescription_${appointmentId}_${new Date().getTime()}.pdf`,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: {
          scale: 2,
          logging: false,
          backgroundColor: "#ffffff",
        },
        jsPDF: { orientation: "portrait", unit: "mm", format: "a4" },
      };

      // Create a temporary container and set innerHTML
      const tempContainer = document.createElement("div");
      tempContainer.innerHTML = pdfContent;

      await html2pdf().set(options).from(tempContainer).save();
    } catch (err) {
      console.error("PDF download error:", err);
      alert("Failed to download PDF: " + (err.message || "Please try again."));
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <Link
          to="/appointment/my"
          className="inline-flex items-center text-cyan-600 hover:text-cyan-700 font-semibold mb-4"
        >
          ← Back to My Appointments
        </Link>
        <h1 className="text-4xl font-bold text-slate-900 mb-2">Prescription</h1>
        <p className="text-slate-600">
          View your prescription details issued by your doctor.
        </p>
      </div>

      {/* Prescription Content - Printable Area */}
      <div id="prescription-content" className="space-y-6">
        {/* Prescription Header Card */}
        <Card
          padding="lg"
          className="bg-gradient-to-r from-cyan-50 to-blue-50 border-0"
        >
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-slate-900">
              Prescription Details
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-xs text-slate-600 uppercase tracking-widest font-semibold">
                  Issued Date
                </p>
                <p className="text-lg font-semibold text-slate-900 mt-1">
                  {formatDate(prescription.createdAt)}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-600 uppercase tracking-widest font-semibold">
                  Status
                </p>
                <p className="text-lg font-semibold text-slate-900 mt-1 capitalize">
                  {prescription.status || "Issued"}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-600 uppercase tracking-widest font-semibold">
                  Last Updated
                </p>
                <p className="text-lg font-semibold text-slate-900 mt-1">
                  {formatDate(prescription.updatedAt)}
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Diagnosis & Notes */}
        <Card padding="lg">
          <div className="space-y-3">
            <h3 className="text-lg font-bold text-slate-900">
              Diagnosis & Clinical Notes
            </h3>
            <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">
              {prescription.notes}
            </p>
          </div>
        </Card>

        {/* Medicines */}
        <div>
          <h3 className="text-lg font-bold text-slate-900 mb-4">
            Prescribed Medications
          </h3>

          {prescription.medicines && prescription.medicines.length > 0 ? (
            <div className="space-y-3">
              {prescription.medicines.map((medicine, index) => (
                <Card key={index} padding="lg" className="bg-slate-50">
                  <div className="space-y-3">
                    {/* Medicine Header */}
                    <div className="pb-3 border-b border-slate-200">
                      <p className="text-lg font-bold text-slate-900">
                        {medicine.name}
                      </p>
                    </div>

                    {/* Medicine Details Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-xs text-slate-600 uppercase tracking-widest font-semibold">
                          Dosage
                        </p>
                        <p className="text-slate-900 font-semibold mt-1">
                          {medicine.dosage}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-600 uppercase tracking-widest font-semibold">
                          Frequency
                        </p>
                        <p className="text-slate-900 font-semibold mt-1">
                          {medicine.frequency}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-600 uppercase tracking-widest font-semibold">
                          Duration
                        </p>
                        <p className="text-slate-900 font-semibold mt-1">
                          {medicine.duration}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-600 uppercase tracking-widest font-semibold">
                          Instructions
                        </p>
                        <p className="text-slate-900 font-semibold mt-1">
                          {medicine.instructions || "N/A"}
                        </p>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card padding="lg" className="text-center text-slate-600">
              <p>No medicines prescribed</p>
            </Card>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4">
        <Button
          variant="secondary"
          onClick={downloadPrescriptionPDF}
          loading={downloading}
          disabled={downloading}
        >
          Download PDF
        </Button>
        <Button variant="primary" onClick={() => navigate("/appointment/my")}>
          Back to Appointments
        </Button>
      </div>
    </div>
  );
};

export default PrescriptionDetail;
