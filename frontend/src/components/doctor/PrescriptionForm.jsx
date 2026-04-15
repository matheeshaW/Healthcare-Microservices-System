/**
 * PrescriptionForm Component
 */

import { useState } from "react";
import { Button, Card } from "../ui";

export const PrescriptionForm = ({
  patientName,
  patientId,
  onSubmit,
  isLoading = false,
  className = "",
  ...props
}) => {
  const [medicines, setMedicines] = useState([
    { name: "", dosage: "", frequency: "", duration: "", notes: "" },
  ]);

  const [diagnosis, setDiagnosis] = useState("");
  const [notes, setNotes] = useState("");
  const [followUp, setFollowUp] = useState("");
  const [errors, setErrors] = useState({});

  const handleAddMedicine = () => {
    setMedicines([
      ...medicines,
      { name: "", dosage: "", frequency: "", duration: "", notes: "" },
    ]);
  };

  const handleRemoveMedicine = (index) => {
    if (medicines.length > 1) {
      setMedicines(medicines.filter((_, i) => i !== index));
    }
  };

  const handleMedicineChange = (index, field, value) => {
    const updatedMedicines = [...medicines];
    updatedMedicines[index][field] = value;
    setMedicines(updatedMedicines);
  };

  const validateForm = () => {
    const newErrors = {};

    if (!diagnosis.trim()) {
      newErrors.diagnosis = "Diagnosis is required";
    }

    medicines.forEach((medicine, index) => {
      if (!medicine.name.trim()) {
        newErrors[`medicine_${index}_name`] = "Medicine name is required";
      }
      if (!medicine.dosage.trim()) {
        newErrors[`medicine_${index}_dosage`] = "Dosage is required";
      }
      if (!medicine.frequency.trim()) {
        newErrors[`medicine_${index}_frequency`] = "Frequency is required";
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const prescriptionData = {
      patientId,
      patientName,
      diagnosis,
      medicines,
      notes,
      followUp,
      issuedDate: new Date().toISOString(),
    };

    if (onSubmit) {
      try {
        await onSubmit(prescriptionData);
        // Reset form on success
        handleReset();
      } catch (error) {
        console.error("Error submitting prescription:", error);
      }
    }
  };

  const handleReset = () => {
    setMedicines([
      { name: "", dosage: "", frequency: "", duration: "", notes: "" },
    ]);
    setDiagnosis("");
    setNotes("");
    setFollowUp("");
    setErrors({});
  };

  return (
    <form onSubmit={handleSubmit} className={className} {...props}>
      <div className="space-y-6">
        {/* Patient Info */}
        <Card padding="md" className="bg-cyan-50 border border-cyan-200">
          <div className="space-y-1">
            <p className="text-sm text-slate-600">Patient</p>
            <p className="text-lg font-bold text-slate-900">{patientName}</p>
          </div>
        </Card>

        {/* Diagnosis */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Diagnosis <span className="text-red-500">*</span>
          </label>
          <textarea
            value={diagnosis}
            onChange={(e) => setDiagnosis(e.target.value)}
            placeholder="Enter patient diagnosis"
            className={`
              w-full px-4 py-3 rounded-lg border
              text-slate-900 font-medium
              resize-none
              focus:outline-none focus:ring-2 focus:ring-cyan-500
              transition
              ${
                errors.diagnosis
                  ? "border-red-500 focus:ring-red-500"
                  : "border-slate-300"
              }
            `}
            rows="3"
            disabled={isLoading}
          />
          {errors.diagnosis && (
            <p className="text-red-600 text-sm mt-1">{errors.diagnosis}</p>
          )}
        </div>

        {/* Medicines Section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-bold text-slate-900">Medicines</h4>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={handleAddMedicine}
              disabled={isLoading}
            >
              + Add Medicine
            </Button>
          </div>

          <div className="space-y-4">
            {medicines.map((medicine, index) => (
              <Card key={index} padding="md" className="border-slate-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Medicine Name */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Medicine Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={medicine.name}
                      onChange={(e) =>
                        handleMedicineChange(index, "name", e.target.value)
                      }
                      placeholder="e.g., Aspirin"
                      className={`
                        w-full px-4 py-2.5 rounded-lg border
                        text-slate-900 font-medium
                        focus:outline-none focus:ring-2 focus:ring-cyan-500
                        transition
                        ${
                          errors[`medicine_${index}_name`]
                            ? "border-red-500"
                            : "border-slate-300"
                        }
                      `}
                      disabled={isLoading}
                    />
                    {errors[`medicine_${index}_name`] && (
                      <p className="text-red-600 text-sm mt-1">
                        {errors[`medicine_${index}_name`]}
                      </p>
                    )}
                  </div>

                  {/* Dosage */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Dosage <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={medicine.dosage}
                      onChange={(e) =>
                        handleMedicineChange(index, "dosage", e.target.value)
                      }
                      placeholder="e.g., 500mg"
                      className={`
                        w-full px-4 py-2.5 rounded-lg border
                        text-slate-900 font-medium
                        focus:outline-none focus:ring-2 focus:ring-cyan-500
                        transition
                        ${
                          errors[`medicine_${index}_dosage`]
                            ? "border-red-500"
                            : "border-slate-300"
                        }
                      `}
                      disabled={isLoading}
                    />
                    {errors[`medicine_${index}_dosage`] && (
                      <p className="text-red-600 text-sm mt-1">
                        {errors[`medicine_${index}_dosage`]}
                      </p>
                    )}
                  </div>

                  {/* Frequency */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Frequency <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={medicine.frequency}
                      onChange={(e) =>
                        handleMedicineChange(index, "frequency", e.target.value)
                      }
                      className={`
                        w-full px-4 py-2.5 rounded-lg border
                        bg-white text-slate-900 font-medium
                        focus:outline-none focus:ring-2 focus:ring-cyan-500
                        transition
                        ${
                          errors[`medicine_${index}_frequency`]
                            ? "border-red-500"
                            : "border-slate-300"
                        }
                      `}
                      disabled={isLoading}
                    >
                      <option value="">-- Select Frequency --</option>
                      <option value="Once a day">Once a day</option>
                      <option value="Twice a day">Twice a day</option>
                      <option value="Thrice a day">Thrice a day</option>
                      <option value="Every 4 hours">Every 4 hours</option>
                      <option value="As needed">As needed</option>
                    </select>
                    {errors[`medicine_${index}_frequency`] && (
                      <p className="text-red-600 text-sm mt-1">
                        {errors[`medicine_${index}_frequency`]}
                      </p>
                    )}
                  </div>

                  {/* Duration */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Duration (Optional)
                    </label>
                    <input
                      type="text"
                      value={medicine.duration}
                      onChange={(e) =>
                        handleMedicineChange(index, "duration", e.target.value)
                      }
                      placeholder="e.g., 7 days"
                      className="
                        w-full px-4 py-2.5 rounded-lg border border-slate-300
                        text-slate-900 font-medium
                        focus:outline-none focus:ring-2 focus:ring-cyan-500
                        transition
                      "
                      disabled={isLoading}
                    />
                  </div>

                  {/* Medicine Notes */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Notes (Optional)
                    </label>
                    <input
                      type="text"
                      value={medicine.notes}
                      onChange={(e) =>
                        handleMedicineChange(index, "notes", e.target.value)
                      }
                      placeholder="e.g., Take with food"
                      className="
                        w-full px-4 py-2.5 rounded-lg border border-slate-300
                        text-slate-900 font-medium
                        focus:outline-none focus:ring-2 focus:ring-cyan-500
                        transition
                      "
                      disabled={isLoading}
                    />
                  </div>
                </div>

                {/* Remove Button */}
                {medicines.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveMedicine(index)}
                    className="mt-4 px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 rounded-lg transition"
                    disabled={isLoading}
                  >
                    Remove Medicine
                  </button>
                )}
              </Card>
            ))}
          </div>
        </div>

        {/* Follow-up */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Follow-up Instructions (Optional)
          </label>
          <select
            value={followUp}
            onChange={(e) => setFollowUp(e.target.value)}
            className="
              w-full px-4 py-2.5 rounded-lg border border-slate-300 bg-white
              text-slate-900 font-medium
              focus:outline-none focus:ring-2 focus:ring-cyan-500
              transition
            "
            disabled={isLoading}
          >
            <option value="">-- Select Follow-up --</option>
            <option value="After 3 days">After 3 days</option>
            <option value="After 1 week">After 1 week</option>
            <option value="After 2 weeks">After 2 weeks</option>
            <option value="After 1 month">After 1 month</option>
            <option value="As needed">As needed</option>
          </select>
        </div>

        {/* Additional Notes */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Additional Notes (Optional)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Any additional instructions or notes for the patient"
            className="
              w-full px-4 py-3 rounded-lg border border-slate-300
              text-slate-900 font-medium
              resize-none
              focus:outline-none focus:ring-2 focus:ring-cyan-500
              transition
            "
            rows="3"
            disabled={isLoading}
          />
        </div>

        {/* Submit Buttons */}
        <div className="flex gap-3 pt-4 border-t border-slate-200">
          <Button
            type="submit"
            variant="success"
            size="lg"
            fullWidth
            loading={isLoading}
            disabled={isLoading}
          >
            Issue Prescription
          </Button>
          <Button
            type="button"
            variant="secondary"
            size="lg"
            onClick={handleReset}
            disabled={isLoading}
          >
            Clear
          </Button>
        </div>
      </div>
    </form>
  );
};

export default PrescriptionForm;
