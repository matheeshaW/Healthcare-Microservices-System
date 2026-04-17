import { useState } from "react";
import { Card, Button, Modal } from "../ui";
import { issuePrescription } from "../../api/prescription.api";

export const IssuePrescriptionModal = ({
  isOpen,
  onClose,
  appointment,
  onPrescriptionIssued,
}) => {
  const [notes, setNotes] = useState("");
  const [medicines, setMedicines] = useState([
    { name: "", dosage: "", frequency: "", duration: "", instructions: "" },
  ]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [errors, setErrors] = useState({});

  const handleAddMedicine = () => {
    setMedicines([
      ...medicines,
      { name: "", dosage: "", frequency: "", duration: "", instructions: "" },
    ]);
  };

  const handleRemoveMedicine = (index) => {
    setMedicines(medicines.filter((_, i) => i !== index));
  };

  const handleMedicineChange = (index, field, value) => {
    const updated = [...medicines];
    updated[index][field] = value;
    setMedicines(updated);
    
    // Clear error for this field
    if (errors[`medicine-${index}-${field}`]) {
      setErrors((prev) => ({
        ...prev,
        [`medicine-${index}-${field}`]: undefined,
      }));
    }
  };

  const handleNotesChange = (value) => {
    setNotes(value);
    if (errors.notes) {
      setErrors((prev) => ({
        ...prev,
        notes: undefined,
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!notes.trim()) {
      newErrors.notes = "Diagnosis & Notes are required";
    }

    medicines.forEach((m, index) => {
      if (!m.name.trim()) {
        newErrors[`medicine-${index}-name`] = "Medicine name is required";
      }
      if (!m.dosage.trim()) {
        newErrors[`medicine-${index}-dosage`] = "Dosage is required";
      }
      if (!m.frequency.trim()) {
        newErrors[`medicine-${index}-frequency`] = "Frequency is required";
      }
      if (!m.duration.trim()) {
        newErrors[`medicine-${index}-duration`] = "Duration is required";
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!validateForm()) {
      return;
    }

    try {
      setSubmitting(true);

      const prescriptionData = {
        appointmentId: appointment._id,
        patientId: appointment.patientId,
        notes,
        medicines: medicines.map((m) => ({
          name: m.name.trim(),
          dosage: m.dosage.trim(),
          frequency: m.frequency.trim(),
          duration: m.duration.trim(),
          instructions: m.instructions.trim() || "",
        })),
      };

      const result = await issuePrescription(prescriptionData);

      // Reset form
      setNotes("");
      setMedicines([
        { name: "", dosage: "", frequency: "", duration: "", instructions: "" },
      ]);
      setErrors({});

      if (onPrescriptionIssued) {
        onPrescriptionIssued(result);
      }

      onClose();
    } catch (err) {
      setError(
        typeof err === "string"
          ? err
          : err?.message || "Failed to issue prescription",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (value) => {
    if (!value) return "N/A";
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? value : parsed.toLocaleDateString();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Issue Prescription"
      size="xl"
      actions={
        <>
          <Button variant="secondary" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            loading={submitting}
            disabled={submitting}
          >
            Issue Prescription
          </Button>
        </>
      }
    >
      <div className="space-y-6">
        {/* Error Alert */}
        {error && (
          <Card padding="md" className="bg-red-50 border border-red-200">
            <p className="text-red-700 font-semibold text-sm">{error}</p>
          </Card>
        )}

        {/* Appointment Info Section */}
        {appointment && (
          <Card padding="md" className="bg-cyan-50 border border-cyan-200">
            <div className="space-y-3">
              <p className="text-xs text-cyan-700 uppercase tracking-widest font-semibold">
                Appointment Details
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-slate-600 uppercase tracking-wide mb-1">
                    Patient
                  </p>
                  <p className="font-semibold text-slate-900">
                    {appointment.patientId
                      ? `Patient ${String(appointment.patientId).slice(-6)}`
                      : "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-600 uppercase tracking-wide mb-1">
                    Date & Time
                  </p>
                  <p className="font-semibold text-slate-900">
                    {formatDate(appointment.date)} at {appointment.time || "N/A"}
                  </p>
                </div>
              </div>
            </div>
          </Card>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Diagnosis & Notes Section */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Diagnosis & Notes <span className="text-red-600">*</span>
            </label>
            <textarea
              value={notes}
              onChange={(e) => handleNotesChange(e.target.value)}
              placeholder="Enter diagnosis, clinical observations, and treatment recommendations..."
              className={`
                w-full px-4 py-3 rounded-lg border
                text-slate-900 font-medium
                placeholder-slate-400
                focus:outline-none focus:ring-2 focus:ring-cyan-500
                resize-none
                transition
                ${
                  errors.notes
                    ? "border-red-500 bg-red-50"
                    : "border-slate-300"
                }
              `}
              rows="4"
              disabled={submitting}
            />
            {errors.notes && (
              <p className="text-red-600 text-sm mt-1">{errors.notes}</p>
            )}
          </div>

          {/* Medicines Section */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <label className="block text-sm font-semibold text-slate-700">
                Medications <span className="text-red-600">*</span>
              </label>
              <button
                type="button"
                onClick={handleAddMedicine}
                disabled={submitting}
                className="px-4 py-2 text-sm bg-emerald-100 text-emerald-700 font-semibold rounded-lg hover:bg-emerald-200 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                + Add Medicine
              </button>
            </div>

            <div className="space-y-4">
              {medicines.map((medicine, index) => (
                <Card
                  key={index}
                  padding="lg"
                  className="bg-slate-50 border border-slate-200"
                >
                  <div className="space-y-4">
                    {/* Medicine Number Header */}
                    <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                      <p className="text-sm font-semibold text-slate-900">
                        Medicine #{index + 1}
                      </p>
                      {medicines.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveMedicine(index)}
                          disabled={submitting}
                          className="text-sm text-red-600 hover:text-red-700 font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition"
                        >
                          Remove
                        </button>
                      )}
                    </div>

                    {/* Medicine Name */}
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Medicine Name <span className="text-red-600">*</span>
                      </label>
                      <input
                        type="text"
                        value={medicine.name}
                        onChange={(e) =>
                          handleMedicineChange(index, "name", e.target.value)
                        }
                        placeholder="e.g., Paracetamol"
                        className={`
                          w-full px-4 py-2.5 rounded-lg border
                          text-slate-900 font-medium
                          focus:outline-none focus:ring-2 focus:ring-cyan-500
                          transition
                          ${
                            errors[`medicine-${index}-name`]
                              ? "border-red-500 bg-red-50"
                              : "border-slate-300"
                          }
                        `}
                        disabled={submitting}
                      />
                      {errors[`medicine-${index}-name`] && (
                        <p className="text-red-600 text-sm mt-1">
                          {errors[`medicine-${index}-name`]}
                        </p>
                      )}
                    </div>

                    {/* Dosage & Frequency - Two columns */}
                    <div className="grid grid-cols-2 gap-4">
                      {/* Dosage */}
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                          Dosage <span className="text-red-600">*</span>
                        </label>
                        <input
                          type="text"
                          value={medicine.dosage}
                          onChange={(e) =>
                            handleMedicineChange(
                              index,
                              "dosage",
                              e.target.value,
                            )
                          }
                          placeholder="e.g., 500mg"
                          className={`
                            w-full px-4 py-2.5 rounded-lg border
                            text-slate-900 font-medium
                            focus:outline-none focus:ring-2 focus:ring-cyan-500
                            transition
                            ${
                              errors[`medicine-${index}-dosage`]
                                ? "border-red-500 bg-red-50"
                                : "border-slate-300"
                            }
                          `}
                          disabled={submitting}
                        />
                        {errors[`medicine-${index}-dosage`] && (
                          <p className="text-red-600 text-sm mt-1">
                            {errors[`medicine-${index}-dosage`]}
                          </p>
                        )}
                      </div>

                      {/* Frequency */}
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                          Frequency <span className="text-red-600">*</span>
                        </label>
                        <input
                          type="text"
                          value={medicine.frequency}
                          onChange={(e) =>
                            handleMedicineChange(
                              index,
                              "frequency",
                              e.target.value,
                            )
                          }
                          placeholder="e.g., Twice daily"
                          className={`
                            w-full px-4 py-2.5 rounded-lg border
                            text-slate-900 font-medium
                            focus:outline-none focus:ring-2 focus:ring-cyan-500
                            transition
                            ${
                              errors[`medicine-${index}-frequency`]
                                ? "border-red-500 bg-red-50"
                                : "border-slate-300"
                            }
                          `}
                          disabled={submitting}
                        />
                        {errors[`medicine-${index}-frequency`] && (
                          <p className="text-red-600 text-sm mt-1">
                            {errors[`medicine-${index}-frequency`]}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Duration */}
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Duration <span className="text-red-600">*</span>
                      </label>
                      <input
                        type="text"
                        value={medicine.duration}
                        onChange={(e) =>
                          handleMedicineChange(
                            index,
                            "duration",
                            e.target.value,
                          )
                        }
                        placeholder="e.g., 7 days"
                        className={`
                          w-full px-4 py-2.5 rounded-lg border
                          text-slate-900 font-medium
                          focus:outline-none focus:ring-2 focus:ring-cyan-500
                          transition
                          ${
                            errors[`medicine-${index}-duration`]
                              ? "border-red-500 bg-red-50"
                              : "border-slate-300"
                          }
                        `}
                        disabled={submitting}
                      />
                      {errors[`medicine-${index}-duration`] && (
                        <p className="text-red-600 text-sm mt-1">
                          {errors[`medicine-${index}-duration`]}
                        </p>
                      )}
                    </div>

                    {/* Instructions */}
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Instructions <span className="text-slate-400">(Optional)</span>
                      </label>
                      <input
                        type="text"
                        value={medicine.instructions}
                        onChange={(e) =>
                          handleMedicineChange(
                            index,
                            "instructions",
                            e.target.value,
                          )
                        }
                        placeholder="e.g., Take with food, Avoid dairy products"
                        className="w-full px-4 py-2.5 rounded-lg border border-slate-300 text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-cyan-500 transition"
                        disabled={submitting}
                      />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default IssuePrescriptionModal;
