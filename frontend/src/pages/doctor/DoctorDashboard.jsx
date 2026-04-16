/**
 * DoctorDashboard Page
 */

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDoctors } from "../../hooks/useDoctors";
import {
  getDoctorAppointments,
  updateDoctorAppointmentStatus,
} from "../../api/doctor.api";
import { issuePrescription } from "../../api/prescription.api";
import { Card, StatusChip, Spinner, Button } from "../../components/ui";
import MyPrescriptions from "../../components/doctor/MyPrescriptions";
import PatientReportsModal from "../../components/doctor/PatientReportsModal";

export const DoctorDashboard = () => {
  const navigate = useNavigate();
  const {
    myProfile,
    fetchMyProfile,
    profileLoading,
    profileError,
    profileNotFound,
    clearErrors,
  } = useDoctors();

  const [activeTab, setActiveTab] = useState("overview");
  const [appointments, setAppointments] = useState([]);
  const [appointmentsLoading, setAppointmentsLoading] = useState(false);
  const [appointmentsError, setAppointmentsError] = useState("");
  const [appointmentsRefreshKey, setAppointmentsRefreshKey] = useState(0);
  const [updatingAppointmentId, setUpdatingAppointmentId] = useState("");
  const [selectedPatientId, setSelectedPatientId] = useState(null);

  // Prescription form state
  const [expandedAppointmentId, setExpandedAppointmentId] = useState(null);
  const [prescriptionNotes, setPrescriptionNotes] = useState("");
  const [medicines, setMedicines] = useState([
    { name: "", dosage: "", frequency: "", duration: "", instructions: "" },
  ]);
  const [prescriptionSubmitting, setPrescriptionSubmitting] = useState(false);
  const [prescriptionError, setPrescriptionError] = useState("");
  const [prescriptionSuccess, setPrescriptionSuccess] = useState("");
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    fetchMyProfile();
  }, [fetchMyProfile]);

  useEffect(() => {
    if (activeTab !== "appointments") {
      return;
    }

    let isMounted = true;

    const loadAppointments = async () => {
      setAppointmentsLoading(true);
      setAppointmentsError("");

      try {
        const response = await getDoctorAppointments();
        const fetchedAppointments = response?.data || [];

        if (isMounted) {
          setAppointments(fetchedAppointments);
        }
      } catch (error) {
        if (isMounted) {
          setAppointmentsError(error.message || "Failed to fetch appointments");
        }
      } finally {
        if (isMounted) {
          setAppointmentsLoading(false);
        }
      }
    };

    loadAppointments();

    return () => {
      isMounted = false;
    };
  }, [activeTab, appointmentsRefreshKey]);

  const formatDate = (value) => {
    if (!value) {
      return "N/A";
    }

    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? value : parsed.toLocaleDateString();
  };

  const formatPatientLabel = (patientId) => {
    if (!patientId) {
      return "Unknown patient";
    }

    return `Patient ${String(patientId).slice(-6)}`;
  };

  const handleAppointmentStatusUpdate = async (appointmentId, status) => {
    setUpdatingAppointmentId(appointmentId);
    setAppointmentsError("");

    try {
      const response = await updateDoctorAppointmentStatus(
        appointmentId,
        status,
      );
      const updatedAppointment = response?.data;

      setAppointments((current) =>
        current.map((appointment) =>
          appointment._id === appointmentId
            ? { ...appointment, ...(updatedAppointment || {}), status }
            : appointment,
        ),
      );
    } catch (error) {
      setAppointmentsError(
        error.message || "Failed to update appointment status",
      );
    } finally {
      setUpdatingAppointmentId("");
    }
  };

  // Prescription form handlers
  const handleTogglePrescriptionForm = (appointmentId) => {
    if (expandedAppointmentId === appointmentId) {
      setExpandedAppointmentId(null);
      resetPrescriptionForm();
    } else {
      setExpandedAppointmentId(appointmentId);
      resetPrescriptionForm();
    }
  };

  const resetPrescriptionForm = () => {
    setPrescriptionNotes("");
    setMedicines([
      { name: "", dosage: "", frequency: "", duration: "", instructions: "" },
    ]);
    setPrescriptionError("");
    setPrescriptionSuccess("");
    setFormErrors({});
  };

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
    if (formErrors[`medicine-${index}-${field}`]) {
      setFormErrors((prev) => ({
        ...prev,
        [`medicine-${index}-${field}`]: undefined,
      }));
    }
  };

  const validatePrescriptionForm = () => {
    const newErrors = {};

    if (!prescriptionNotes.trim()) {
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

    setFormErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmitPrescription = async (appointment) => {
    setPrescriptionError("");
    setPrescriptionSuccess("");

    if (!validatePrescriptionForm()) {
      return;
    }

    try {
      setPrescriptionSubmitting(true);

      const prescriptionData = {
        appointmentId: appointment._id,
        patientId: appointment.patientId,
        notes: prescriptionNotes,
        medicines: medicines.map((m) => ({
          name: m.name.trim(),
          dosage: m.dosage.trim(),
          frequency: m.frequency.trim(),
          duration: m.duration.trim(),
          instructions: m.instructions.trim() || "",
        })),
      };

      await issuePrescription(prescriptionData);

      setPrescriptionSuccess("Prescription issued successfully!");
      resetPrescriptionForm();
      setExpandedAppointmentId(null);

      // Refresh appointments list
      setTimeout(() => {
        setAppointmentsRefreshKey((prev) => prev + 1);
      }, 1500);
    } catch (error) {
      setPrescriptionError(
        typeof error === "string"
          ? error
          : error?.message || "Failed to issue prescription",
      );
    } finally {
      setPrescriptionSubmitting(false);
    }
  };

  const renderProfileSection = () => {
    if (profileLoading) {
      return (
        <Card padding="lg" className="text-center">
          <Spinner
            size="lg"
            variant="primary"
            label="Loading your profile..."
          />
        </Card>
      );
    }

    if (profileError) {
      if (profileNotFound) {
        return (
          <Card padding="lg" className="text-center space-y-4">
            <p className="text-slate-600 font-medium">No profile found</p>
            <p className="text-sm text-slate-500">
              You need to create a doctor profile first
            </p>
            <Button
              variant="primary"
              onClick={() => navigate("/doctor/profile")}
            >
              Create Profile
            </Button>
          </Card>
        );
      }

      return (
        <Card padding="lg" className="bg-red-50 border border-red-200">
          <div className="space-y-3">
            <p className="text-red-700 font-semibold">{profileError}</p>
            <Button variant="danger" size="sm" onClick={fetchMyProfile}>
              Retry Loading Profile
            </Button>
          </div>
        </Card>
      );
    }

    if (!myProfile) {
      return (
        <Card padding="lg" className="text-center space-y-4">
          <p className="text-slate-600 font-medium">No profile found</p>
          <p className="text-sm text-slate-500">
            You need to create a doctor profile first
          </p>
          <Button variant="primary" onClick={() => navigate("/doctor/profile")}>
            Create Profile
          </Button>
        </Card>
      );
    }

    return (
      <div className="space-y-6">
        {/* Profile Header */}
        <Card
          padding="lg"
          className="bg-linear-to-r from-cyan-50 to-emerald-50 border-0"
        >
          <div className="flex items-start justify-between gap-6">
            <div className="flex-1">
              <h2 className="text-3xl font-bold text-slate-900 mb-2">
                Dr. {myProfile.name}
              </h2>
              <p className="text-lg text-slate-700 mb-4">
                {myProfile.specialization}
              </p>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-slate-600 uppercase tracking-wide">
                    Experience
                  </p>
                  <p className="text-2xl font-bold text-cyan-600">
                    {myProfile.experience} years
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-600 uppercase tracking-wide">
                    Status
                  </p>
                  <StatusChip
                    status={myProfile.verified ? "verified" : "unverified"}
                    size="sm"
                  />
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Contact & Hospital Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card padding="md">
            <h4 className="font-bold text-slate-900 mb-3">
              Contact Information
            </h4>
            <div className="space-y-2">
              <p className="text-sm text-slate-700">
                <span className="font-semibold">Phone:</span>{" "}
                {myProfile.phoneNumber}
              </p>
              <p className="text-sm text-slate-700">
                <span className="font-semibold">License:</span>{" "}
                {myProfile.licenseNumber}
              </p>
            </div>
          </Card>

          <Card padding="md">
            <h4 className="font-bold text-slate-900 mb-3">Hospital</h4>
            <p className="text-sm text-slate-700 font-semibold">
              {myProfile.hospital}
            </p>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button
            variant="primary"
            onClick={() => navigate("/doctor/profile")}
            fullWidth
          >
            Edit Profile
          </Button>
          <Button
            variant="secondary"
            onClick={() => navigate("/doctor/availability")}
            fullWidth
          >
            Manage Availability
          </Button>
        </div>
      </div>
    );
  };

  const renderAppointmentsTab = () => {
    if (appointmentsLoading) {
      return (
        <Card padding="md" className="text-center">
          <Spinner
            size="lg"
            variant="primary"
            label="Loading appointments..."
          />
        </Card>
      );
    }

    if (appointmentsError) {
      return (
        <Card padding="md" className="border border-red-200 bg-red-50">
          <div className="space-y-3">
            <p className="font-semibold text-red-700">{appointmentsError}</p>
            <Button
              variant="danger"
              size="sm"
              onClick={() =>
                setAppointmentsRefreshKey((current) => current + 1)
              }
            >
              Retry
            </Button>
          </div>
        </Card>
      );
    }

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-900">
            Real Patient Appointments
          </h3>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => setAppointmentsRefreshKey((current) => current + 1)}
          >
            Refresh
          </Button>
        </div>

        {appointments.length === 0 ? (
          <Card padding="lg" className="text-center">
            <p className="text-slate-600">
              No patient bookings yet for this doctor.
            </p>
          </Card>
        ) : (
          <div className="space-y-3">
            {appointments.map((appt) => (
              <div key={appt._id} className="space-y-0">
                {/* Appointment Card */}
                <Card padding="md" className="border-b-0">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex-1">
                        <p className="font-semibold text-slate-900 text-lg">
                          {formatPatientLabel(appt.patientId)}
                        </p>
                        <p className="text-sm text-slate-600 mt-1">
                          {formatDate(appt.date)} at {appt.time}
                        </p>
                        <p className="text-xs text-slate-500 mt-1">
                          ID: {appt._id}
                        </p>
                      </div>
                      <StatusChip status={appt.status} size="sm" />
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-2 pt-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => setSelectedPatientId(appt.patientId)}
                      >
                        View Reports
                      </Button>
                      {appt.status === "pending" && (
                        <Button
                          size="sm"
                          variant="primary"
                          loading={updatingAppointmentId === appt._id}
                          onClick={() =>
                            handleAppointmentStatusUpdate(appt._id, "confirmed")
                          }
                        >
                          Confirm
                        </Button>
                      )}

                      {(appt.status === "pending" ||
                        appt.status === "confirmed") && (
                        <Button
                          size="sm"
                          variant="success"
                          loading={updatingAppointmentId === appt._id}
                          onClick={() =>
                            handleAppointmentStatusUpdate(appt._id, "completed")
                          }
                        >
                          Complete
                        </Button>
                      )}

                      {(appt.status === "pending" ||
                        appt.status === "confirmed") && (
                        <Button
                          size="sm"
                          variant="danger"
                          loading={updatingAppointmentId === appt._id}
                          onClick={() =>
                            handleAppointmentStatusUpdate(appt._id, "cancelled")
                          }
                        >
                          Cancel
                        </Button>
                      )}

                      {(appt.status === "confirmed" ||
                        appt.status === "completed") && (
                        <Button
                          size="sm"
                          variant="primary"
                          onClick={() => handleTogglePrescriptionForm(appt._id)}
                        >
                          {expandedAppointmentId === appt._id
                            ? "Close Form"
                            : "Issue Prescription"}
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>

                {/* Prescription Form - Expandable */}
                {expandedAppointmentId === appt._id && (
                  <Card
                    padding="lg"
                    className="border-t-0 rounded-t-none bg-slate-50"
                  >
                    <div className="space-y-6">
                      {/* Header */}
                      <div>
                        <h4 className="text-lg font-bold text-slate-900 mb-1">
                          Issue Prescription
                        </h4>
                        <p className="text-sm text-slate-600">
                          For {formatPatientLabel(appt.patientId)} on{" "}
                          {formatDate(appt.date)}
                        </p>
                      </div>

                      {/* Error Alert */}
                      {prescriptionError && (
                        <Card
                          padding="md"
                          className="bg-red-50 border border-red-200"
                        >
                          <p className="text-red-700 font-semibold text-sm">
                            {prescriptionError}
                          </p>
                        </Card>
                      )}

                      {/* Success Alert */}
                      {prescriptionSuccess && (
                        <Card
                          padding="md"
                          className="bg-emerald-50 border border-emerald-200"
                        >
                          <p className="text-emerald-700 font-semibold text-sm">
                            {prescriptionSuccess}
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
                            value={prescriptionNotes}
                            onChange={(e) =>
                              setPrescriptionNotes(e.target.value)
                            }
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
                            disabled={prescriptionSubmitting}
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
                              Medications{" "}
                              <span className="text-red-600">*</span>
                            </label>
                            <button
                              type="button"
                              onClick={handleAddMedicine}
                              disabled={prescriptionSubmitting}
                              className="px-4 py-2 text-sm bg-emerald-100 text-emerald-700 font-semibold rounded-lg hover:bg-emerald-200 transition disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              + Add Medicine
                            </button>
                          </div>

                          <div className="space-y-4">
                            {medicines.map((medicine, index) => (
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
                                    {medicines.length > 1 && (
                                      <button
                                        type="button"
                                        onClick={() =>
                                          handleRemoveMedicine(index)
                                        }
                                        disabled={prescriptionSubmitting}
                                        className="text-sm text-red-600 hover:text-red-700 font-semibold disabled:opacity-50"
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
                                      disabled={prescriptionSubmitting}
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
                                            formErrors[
                                              `medicine-${index}-dosage`
                                            ]
                                              ? "border-red-500 bg-red-50"
                                              : "border-slate-300 bg-white"
                                          }
                                        `}
                                        disabled={prescriptionSubmitting}
                                      />
                                      {formErrors[
                                        `medicine-${index}-dosage`
                                      ] && (
                                        <p className="text-red-600 text-sm mt-1">
                                          {
                                            formErrors[
                                              `medicine-${index}-dosage`
                                            ]
                                          }
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
                                        disabled={prescriptionSubmitting}
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

                                  {/* Duration */}
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
                                      disabled={prescriptionSubmitting}
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

                                  {/* Instructions */}
                                  <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                                      Instructions{" "}
                                      <span className="text-slate-400">
                                        (Optional)
                                      </span>
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
                                      className="w-full px-4 py-2.5 rounded-lg border border-slate-300 text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-cyan-500 transition"
                                      disabled={prescriptionSubmitting}
                                    />
                                  </div>
                                </div>
                              </Card>
                            ))}
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-3 pt-4 border-t border-slate-200">
                          <Button
                            variant="secondary"
                            onClick={() =>
                              handleTogglePrescriptionForm(appt._id)
                            }
                            disabled={prescriptionSubmitting}
                          >
                            Cancel
                          </Button>
                          <Button
                            variant="primary"
                            onClick={() => handleSubmitPrescription(appt)}
                            loading={prescriptionSubmitting}
                            disabled={prescriptionSubmitting}
                          >
                            Issue Prescription
                          </Button>
                        </div>
                      </form>
                    </div>
                  </Card>
                )}
              </div>
            ))}
          </div>
        )}

        <Button
          variant="secondary"
          fullWidth
          className="mt-4"
          onClick={() => setActiveTab("overview")}
        >
          Back to Overview
        </Button>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-4xl font-bold text-slate-900 mb-2">
          Doctor Dashboard
        </h1>
        <p className="text-slate-600">
          Welcome! Manage your profile and appointments
        </p>
      </div>

      {/* Clear Error Alert */}
      {profileError && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <button
            onClick={clearErrors}
            className="text-blue-600 text-sm font-semibold hover:underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="flex gap-2">
        <button
          onClick={() => setActiveTab("overview")}
          className={`
            px-4 py-2.5 rounded-lg font-semibold transition
            ${
              activeTab === "overview"
                ? "bg-cyan-600 text-white"
                : "bg-slate-200 text-slate-900 hover:bg-slate-300"
            }
          `}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveTab("appointments")}
          className={`
            px-4 py-2.5 rounded-lg font-semibold transition
            ${
              activeTab === "appointments"
                ? "bg-cyan-600 text-white"
                : "bg-slate-200 text-slate-900 hover:bg-slate-300"
            }
          `}
        >
          Appointments
        </button>
        <button
          onClick={() => setActiveTab("prescriptions")}
          className={`
            px-4 py-2.5 rounded-lg font-semibold transition
            ${
              activeTab === "prescriptions"
                ? "bg-cyan-600 text-white"
                : "bg-slate-200 text-slate-900 hover:bg-slate-300"
            }
          `}
        >
          My Prescriptions
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === "overview" && renderProfileSection()}
      {activeTab === "appointments" && renderAppointmentsTab()}
      {activeTab === "prescriptions" && <MyPrescriptions />}

      {/* Patient Reports Modal */}
      {selectedPatientId && (
        <PatientReportsModal
          patientId={selectedPatientId}
          onClose={() => setSelectedPatientId(null)}
        />
      )}
    </div>
  );
};

export default DoctorDashboard;
