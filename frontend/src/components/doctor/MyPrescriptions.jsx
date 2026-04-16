import { useState, useEffect } from "react";
import {
  getMyPrescriptions,
  updatePrescription,
  updatePrescriptionStatus,
  removePrescription,
} from "../../api/prescription.api";
import { getPatientById } from "../../api/patient.api";
import { Card, Button, Spinner } from "../../components/ui";

export const MyPrescriptions = () => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [patientNames, setPatientNames] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedId, setExpandedId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [formErrors, setFormErrors] = useState({});

  // Edit form state
  const [editNotes, setEditNotes] = useState("");
  const [editMedicines, setEditMedicines] = useState([]);

  useEffect(() => {
    loadPrescriptions();
  }, []);

  const loadPrescriptions = async () => {
    setLoading(true);
    setError("");

    try {
      const data = await getMyPrescriptions();
      setPrescriptions(data || []);

      // Fetch patient names for all unique patients
      const uniquePatientIds = [
        ...new Set((data || []).map((p) => p.patientId).filter(Boolean)),
      ];

      const patientNameMap = {};
      await Promise.all(
        uniquePatientIds.map(async (patientId) => {
          try {
            const response = await getPatientById(patientId);
            patientNameMap[patientId] =
              response?.data?.data?.name || "Unknown Patient";
          } catch {
            patientNameMap[patientId] = "Unknown Patient";
          }
        }),
      );

      setPatientNames(patientNameMap);
    } catch (err) {
      setError(
        typeof err === "string"
          ? err
          : err?.message || "Failed to load prescriptions",
      );
    } finally {
      setLoading(false);
    }
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
        });
  };

  const validateEditForm = () => {
    const newErrors = {};

    if (!editNotes.trim()) {
      newErrors.notes = "Diagnosis & Notes are required";
    }

    editMedicines.forEach((m, index) => {
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

    setFormErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleEdit = (prescription) => {
    setEditingId(prescription._id);
    setEditNotes(prescription.notes);
    setEditMedicines(
      prescription.medicines && prescription.medicines.length > 0
        ? [...prescription.medicines]
        : [
            {
              name: "",
              dosage: "",
              frequency: "",
              duration: "",
              instructions: "",
            },
          ],
    );
    setFormErrors({});
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditNotes("");
    setEditMedicines([]);
    setFormErrors({});
  };

  const handleAddMedicine = () => {
    setEditMedicines([
      ...editMedicines,
      { name: "", dosage: "", frequency: "", duration: "", instructions: "" },
    ]);
  };

  const handleRemoveMedicine = (index) => {
    setEditMedicines(editMedicines.filter((_, i) => i !== index));
  };

  const handleMedicineChange = (index, field, value) => {
    const updated = [...editMedicines];
    updated[index][field] = value;
    setEditMedicines(updated);
    if (formErrors[`medicine-${index}-${field}`]) {
      setFormErrors((prev) => ({
        ...prev,
        [`medicine-${index}-${field}`]: undefined,
      }));
    }
  };

  const handleSaveEdit = async (prescriptionId) => {
    if (!validateEditForm()) {
      return;
    }

    try {
      const updateData = {
        notes: editNotes,
        medicines: editMedicines.map((m) => ({
          name: m.name.trim(),
          dosage: m.dosage.trim(),
          frequency: m.frequency.trim(),
          duration: m.duration.trim(),
          instructions: m.instructions.trim() || "",
        })),
      };

      await updatePrescription(prescriptionId, updateData);

      setPrescriptions((prev) =>
        prev.map((p) =>
          p._id === prescriptionId
            ? { ...p, notes: editNotes, medicines: updateData.medicines }
            : p,
        ),
      );

      setSuccessMessage("Prescription updated successfully!");
      setEditingId(null);
      setFormErrors({});
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      setError(
        typeof err === "string"
          ? err
          : err?.message || "Failed to update prescription",
      );
    }
  };

  const handleDelete = async (prescriptionId) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this prescription? This action cannot be undone.",
      )
    ) {
      return;
    }

    try {
      setDeletingId(prescriptionId);
      await updatePrescriptionStatus(prescriptionId, "cancelled");

      setPrescriptions((prev) =>
        prev.map((p) =>
          p._id === prescriptionId ? { ...p, status: "cancelled" } : p,
        ),
      );

      setSuccessMessage("Prescription deleted successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      setError(
        typeof err === "string"
          ? err
          : err?.message || "Failed to delete prescription",
      );
    } finally {
      setDeletingId(null);
    }
  };

  const handleRemove = async (prescriptionId) => {
    if (
      !window.confirm(
        "Are you sure you want to permanently remove this prescription? This action cannot be undone and will remove it from both doctor and patient views.",
      )
    ) {
      return;
    }

    try {
      setDeletingId(prescriptionId);
      await removePrescription(prescriptionId);

      setPrescriptions((prev) => prev.filter((p) => p._id !== prescriptionId));

      setSuccessMessage("Prescription removed permanently!");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      setError(
        typeof err === "string"
          ? err
          : err?.message || "Failed to remove prescription",
      );
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <Card padding="md" className="text-center">
        <Spinner size="lg" variant="primary" label="Loading prescriptions..." />
      </Card>
    );
  }

  if (error) {
    return (
      <Card padding="md" className="border border-red-200 bg-red-50">
        <div className="space-y-3">
          <p className="font-semibold text-red-700">{error}</p>
          <Button variant="danger" size="sm" onClick={loadPrescriptions}>
            Retry
          </Button>
        </div>
      </Card>
    );
  }

  if (prescriptions.length === 0) {
    return (
      <Card padding="lg" className="text-center">
        <p className="text-slate-600">No prescriptions issued yet.</p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {successMessage && (
        <Card padding="md" className="bg-emerald-50 border border-emerald-200">
          <p className="text-emerald-700 font-semibold text-sm">
            {successMessage}
          </p>
        </Card>
      )}

      <div className="space-y-3">
        {prescriptions.map((prescription) => (
          <div key={prescription._id}>
            {/* Prescription Card */}
            <Card
              padding="md"
              className={`border-b-0 cursor-pointer hover:bg-slate-50 transition ${
                expandedId === prescription._id ? "border-b-0" : ""
              }`}
            >
              <div
                onClick={() =>
                  setExpandedId(
                    expandedId === prescription._id ? null : prescription._id,
                  )
                }
                className="space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="font-semibold text-slate-900">
                      {patientNames[prescription.patientId] ||
                        "Unknown Patient"}
                    </p>
                    <p className="text-sm text-slate-600">
                      {formatDate(prescription.createdAt)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${
                        prescription.status === "cancelled"
                          ? "bg-red-100 text-red-700"
                          : "bg-emerald-100 text-emerald-700"
                      }`}
                    >
                      {prescription.status || "issued"}
                    </span>
                    <span className="text-slate-500">
                      {expandedId === prescription._id ? "▼" : ""}
                    </span>
                  </div>
                </div>

                {/* Quick Medicines Preview */}
                {prescription.medicines &&
                  prescription.medicines.length > 0 && (
                    <div className="text-sm text-slate-600">
                      <p className="font-medium">
                        {prescription.medicines.length} medicine(s):{" "}
                        {prescription.medicines.map((m) => m.name).join(", ")}
                      </p>
                    </div>
                  )}
              </div>
            </Card>

            {/* Expanded Content */}
            {expandedId === prescription._id && (
              <Card
                padding="lg"
                className="border-t-0 rounded-t-none bg-slate-50"
              >
                {editingId === prescription._id ? (
                  // Edit Mode
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-lg font-bold text-slate-900 mb-1">
                        Edit Prescription
                      </h4>
                      <p className="text-sm text-slate-600">
                        Update prescription details for{" "}
                        {patientNames[prescription.patientId] ||
                          "Unknown Patient"}
                      </p>
                    </div>

                    {/* Error Alert */}
                    {error && (
                      <Card
                        padding="md"
                        className="bg-red-50 border border-red-200"
                      >
                        <p className="text-red-700 font-semibold text-sm">
                          {error}
                        </p>
                      </Card>
                    )}

                    <form
                      onSubmit={(e) => e.preventDefault()}
                      className="space-y-6"
                    >
                      {/* Diagnosis & Notes */}
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                          Diagnosis & Notes{" "}
                          <span className="text-red-600">*</span>
                        </label>
                        <textarea
                          value={editNotes}
                          onChange={(e) => setEditNotes(e.target.value)}
                          placeholder="Enter diagnosis, clinical observations, and treatment recommendations..."
                          className={`
                            w-full px-4 py-3 rounded-lg border
                            text-slate-900 font-medium
                            placeholder-slate-400
                            focus:outline-none focus:ring-2 focus:ring-cyan-500
                            resize-none
                            transition
                            ${
                              formErrors.notes
                                ? "border-red-500 bg-red-50"
                                : "border-slate-300 bg-white"
                            }
                          `}
                          rows="4"
                        />
                        {formErrors.notes && (
                          <p className="text-red-600 text-sm mt-1">
                            {formErrors.notes}
                          </p>
                        )}
                      </div>

                      {/* Medications Section */}
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <label className="block text-sm font-semibold text-slate-700">
                            Medications <span className="text-red-600">*</span>
                          </label>
                          <button
                            type="button"
                            onClick={handleAddMedicine}
                            className="px-4 py-2 text-sm bg-emerald-100 text-emerald-700 font-semibold rounded-lg hover:bg-emerald-200 transition"
                          >
                            + Add Medicine
                          </button>
                        </div>

                        <div className="space-y-4">
                          {editMedicines.map((medicine, index) => (
                            <Card
                              key={index}
                              padding="md"
                              className="bg-white border border-slate-200"
                            >
                              <div className="space-y-3">
                                {/* Medicine Header */}
                                <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                                  <p className="text-sm font-semibold text-slate-900">
                                    Medicine #{index + 1}
                                  </p>
                                  {editMedicines.length > 1 && (
                                    <button
                                      type="button"
                                      onClick={() =>
                                        handleRemoveMedicine(index)
                                      }
                                      className="text-sm text-red-600 hover:text-red-700 font-semibold"
                                    >
                                      Remove
                                    </button>
                                  )}
                                </div>

                                {/* Medicine Name */}
                                <div>
                                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                                    Medicine Name{" "}
                                    <span className="text-red-600">*</span>
                                  </label>
                                  <input
                                    type="text"
                                    value={medicine.name}
                                    onChange={(e) =>
                                      handleMedicineChange(
                                        index,
                                        "name",
                                        e.target.value,
                                      )
                                    }
                                    placeholder="e.g., Paracetamol"
                                    className={`
                                      w-full px-4 py-2.5 rounded-lg border
                                      text-slate-900 font-medium
                                      focus:outline-none focus:ring-2 focus:ring-cyan-500
                                      transition
                                      ${
                                        formErrors[`medicine-${index}-name`]
                                          ? "border-red-500 bg-red-50"
                                          : "border-slate-300 bg-white"
                                      }
                                    `}
                                  />
                                  {formErrors[`medicine-${index}-name`] && (
                                    <p className="text-red-600 text-sm mt-1">
                                      {formErrors[`medicine-${index}-name`]}
                                    </p>
                                  )}
                                </div>

                                {/* Dosage & Frequency */}
                                <div className="grid grid-cols-2 gap-3">
                                  <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                                      Dosage{" "}
                                      <span className="text-red-600">*</span>
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
                                          formErrors[`medicine-${index}-dosage`]
                                            ? "border-red-500 bg-red-50"
                                            : "border-slate-300 bg-white"
                                        }
                                      `}
                                    />
                                    {formErrors[`medicine-${index}-dosage`] && (
                                      <p className="text-red-600 text-sm mt-1">
                                        {formErrors[`medicine-${index}-dosage`]}
                                      </p>
                                    )}
                                  </div>

                                  <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                                      Frequency{" "}
                                      <span className="text-red-600">*</span>
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
                                          formErrors[
                                            `medicine-${index}-frequency`
                                          ]
                                            ? "border-red-500 bg-red-50"
                                            : "border-slate-300 bg-white"
                                        }
                                      `}
                                    />
                                    {formErrors[
                                      `medicine-${index}-frequency`
                                    ] && (
                                      <p className="text-red-600 text-sm mt-1">
                                        {
                                          formErrors[
                                            `medicine-${index}-frequency`
                                          ]
                                        }
                                      </p>
                                    )}
                                  </div>
                                </div>

                                {/* Duration & Instructions */}
                                <div className="grid grid-cols-2 gap-3">
                                  <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                                      Duration{" "}
                                      <span className="text-red-600">*</span>
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
                                          formErrors[
                                            `medicine-${index}-duration`
                                          ]
                                            ? "border-red-500 bg-red-50"
                                            : "border-slate-300 bg-white"
                                        }
                                      `}
                                    />
                                    {formErrors[
                                      `medicine-${index}-duration`
                                    ] && (
                                      <p className="text-red-600 text-sm mt-1">
                                        {
                                          formErrors[
                                            `medicine-${index}-duration`
                                          ]
                                        }
                                      </p>
                                    )}
                                  </div>

                                  <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                                      Instructions (optional)
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
                                      placeholder="e.g., Take with food"
                                      className="w-full px-4 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-cyan-500 transition"
                                    />
                                  </div>
                                </div>
                              </div>
                            </Card>
                          ))}
                        </div>
                      </div>

                      {/* Submit Buttons */}
                      <div className="flex gap-3 pt-4 border-t border-slate-200">
                        <Button variant="secondary" onClick={handleCancelEdit}>
                          Cancel
                        </Button>
                        <Button
                          variant="primary"
                          onClick={() => handleSaveEdit(prescription._id)}
                        >
                          Save Changes
                        </Button>
                      </div>
                    </form>
                  </div>
                ) : (
                  // View Mode
                  <div className="space-y-6">
                    {/* Diagnosis */}
                    <div>
                      <h4 className="font-semibold text-slate-900 mb-2">
                        Diagnosis & Clinical Notes
                      </h4>
                      <p className="text-slate-700 whitespace-pre-wrap">
                        {prescription.notes}
                      </p>
                    </div>

                    {/* Medicines */}
                    {prescription.medicines &&
                      prescription.medicines.length > 0 && (
                        <div>
                          <h4 className="font-semibold text-slate-900 mb-3">
                            Prescribed Medications
                          </h4>
                          <div className="space-y-3">
                            {prescription.medicines.map((medicine, index) => (
                              <Card
                                key={index}
                                padding="md"
                                className="bg-white border border-slate-200"
                              >
                                <div className="space-y-2">
                                  <p className="font-semibold text-slate-900 text-base">
                                    {medicine.name}
                                  </p>
                                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                                    <div>
                                      <p className="text-slate-600 font-medium uppercase text-xs">
                                        Dosage
                                      </p>
                                      <p className="text-slate-900 font-semibold mt-1">
                                        {medicine.dosage}
                                      </p>
                                    </div>
                                    <div>
                                      <p className="text-slate-600 font-medium uppercase text-xs">
                                        Frequency
                                      </p>
                                      <p className="text-slate-900 font-semibold mt-1">
                                        {medicine.frequency}
                                      </p>
                                    </div>
                                    <div>
                                      <p className="text-slate-600 font-medium uppercase text-xs">
                                        Duration
                                      </p>
                                      <p className="text-slate-900 font-semibold mt-1">
                                        {medicine.duration}
                                      </p>
                                    </div>
                                    <div>
                                      <p className="text-slate-600 font-medium uppercase text-xs">
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
                        </div>
                      )}

                    {/* View Action Buttons */}
                    <div className="flex gap-3 pt-4 border-t border-slate-200">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleEdit(prescription)}
                        disabled={prescription.status === "cancelled"}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleDelete(prescription._id)}
                        loading={deletingId === prescription._id}
                        disabled={
                          prescription.status === "cancelled" ||
                          deletingId === prescription._id
                        }
                      >
                        Delete
                      </Button>
                      {prescription.status === "cancelled" && (
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleRemove(prescription._id)}
                          loading={deletingId === prescription._id}
                          disabled={deletingId === prescription._id}
                          className="bg-red-700 hover:bg-red-800"
                        >
                          Remove
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              </Card>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default MyPrescriptions;
