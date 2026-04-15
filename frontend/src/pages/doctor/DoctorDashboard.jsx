/**
 * DoctorDashboard Page
 */

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDoctors } from "../../hooks/useDoctors";
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

  useEffect(() => {
    fetchMyProfile();
  }, [fetchMyProfile]);

  const mockAppointments = [
    {
      id: 1,
      patientName: "John Doe",
      date: "2024-05-20",
      time: "10:00 AM",
      status: "completed",
      reason: "Cardiac Checkup",
    },
    {
      id: 2,
      patientName: "Jane Smith",
      date: "2024-05-21",
      time: "02:30 PM",
      status: "scheduled",
      reason: "Follow-up",
    },
    {
      id: 3,
      patientName: "Bob Wilson",
      date: "2024-05-22",
      time: "11:00 AM",
      status: "cancelled",
      reason: "Regular Checkup",
    },
  ];

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

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
                    Rating
                  </p>
                  <p className="text-2xl font-bold text-amber-600">
                    {myProfile.rating.toFixed(1)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-600 uppercase tracking-wide">
                    Reviews
                  </p>
                  <p className="text-2xl font-bold text-slate-600">
                    {myProfile.totalReviews}
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
    return (
      <Card padding="md">
        <h3 className="text-lg font-bold text-slate-900 mb-4">
          Recent Appointments
        </h3>

        <div className="space-y-3">
          {mockAppointments.map((appt) => (
            <div
              key={appt.id}
              className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition"
            >
              <div className="flex-1">
                <p className="font-semibold text-slate-900">
                  {appt.patientName}
                </p>
                <p className="text-sm text-slate-600">
                  {appt.date} at {appt.time}
                </p>
                <p className="text-xs text-slate-500 mt-1">{appt.reason}</p>
              </div>

              <div className="flex items-center gap-3">
                <StatusChip status={appt.status} size="sm" />
                <button className="px-3 py-1.5 text-sm font-semibold text-cyan-600 hover:bg-cyan-50 rounded-lg transition">
                  View
                </button>
              </div>
            </div>
          ))}
        </div>

        <Button
          variant="secondary"
          fullWidth
          className="mt-4"
          onClick={() => setActiveTab("appointments")}
        >
          View All Appointments
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
          Welcome! Manage your profile, appointments, and prescriptions
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