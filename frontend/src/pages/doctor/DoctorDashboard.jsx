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
import { getPatientById } from "../../api/patient.api";
import { Card, StatusChip, Spinner, Button } from "../../components/ui";

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
  const [patientNameById, setPatientNameById] = useState({});

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

        const uniquePatientIds = [
          ...new Set(
            fetchedAppointments
              .map((appointment) => appointment.patientId)
              .filter(Boolean),
          ),
        ];

        const patientEntries = await Promise.all(
          uniquePatientIds.map(async (patientId) => {
            try {
              const patientResponse = await getPatientById(patientId);
              return [patientId, patientResponse?.data?.data?.name || ""];
            } catch {
              return [patientId, ""];
            }
          }),
        );

        if (isMounted) {
          setPatientNameById((current) => ({
            ...current,
            ...Object.fromEntries(patientEntries.filter(([, name]) => name)),
          }));
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

    return patientNameById[patientId] || `Patient ${String(patientId).slice(-6)}`;
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
      // Check if profile doesn't exist (404 Not Found)
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

      // For other errors, show retry button
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
      <Card padding="md">
        <h3 className="text-lg font-bold text-slate-900 mb-4">
          Real Patient Appointments
        </h3>

        {appointments.length === 0 ? (
          <div className="rounded-lg border border-dashed border-slate-300 p-6 text-center text-slate-600">
            No patient bookings yet for this doctor.
          </div>
        ) : (
          <div className="space-y-3">
            {appointments.map((appt) => (
              <div
                key={appt._id}
                className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition"
              >
                <div className="flex-1">
                  <p className="font-semibold text-slate-900">
                    {formatPatientLabel(appt.patientId)}
                  </p>
                  <p className="text-sm text-slate-600">
                    {formatDate(appt.date)} at {appt.time}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    Appointment ID: {appt._id}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <StatusChip status={appt.status} size="sm" />
                  <div className="flex flex-wrap gap-2">
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
                  </div>
                </div>
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
      </Card>
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
      </div>

      {/* Tab Content */}
      {activeTab === "overview" && renderProfileSection()}
      {activeTab === "appointments" && renderAppointmentsTab()}
    </div>
  );
};

export default DoctorDashboard;
