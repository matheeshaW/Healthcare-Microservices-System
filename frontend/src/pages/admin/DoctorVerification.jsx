/**
 * Doctor Verification Page
 * Review and approve/reject pending doctor registrations
 */

import { useEffect, useState } from "react";
import { Card, Spinner, Button, Modal, StatusChip } from "../../components/ui";
import API from "../../api/axios";

export const DoctorVerification = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [verifyingId, setVerifyingId] = useState(null);
  const [filterStatus, setFilterStatus] = useState("pending");

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      const res = await API.get("/doctors/all?verified=all");
      setDoctors(res.data.data);
    } catch (err) {
      console.error("Failed to fetch doctors:", err);
      setError("Failed to load doctors");
    } finally {
      setLoading(false);
    }
  };

  const filteredDoctors = doctors.filter((doctor) => {
    if (filterStatus === "pending") return !doctor.verified;
    if (filterStatus === "verified") return doctor.verified;
    return true;
  });

  const handleVerifyDoctor = async (doctorId) => {
    try {
      setVerifyingId(doctorId);
      await API.put(`/doctors/${doctorId}/verify`);
      // Refresh doctors list
      await fetchDoctors();
      setShowModal(false);
    } catch (err) {
      console.error("Failed to verify doctor:", err);
      setError("Failed to verify doctor");
    } finally {
      setVerifyingId(null);
    }
  };

  const handleViewDoctor = (doctor) => {
    setSelectedDoctor(doctor);
    setShowModal(true);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const pendingCount = doctors.filter((d) => !d.verified).length;
  const verifiedCount = doctors.filter((d) => d.verified).length;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-4xl font-bold text-slate-900 mb-2">
          Doctor Verification
        </h1>
        <p className="text-slate-600">
          Review and approve pending doctor registrations
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <Card padding="md" className="bg-red-50 border border-red-200">
          <p className="text-red-700 font-semibold">{error}</p>
        </Card>
      )}

      {/* Statistics */}
      {!loading && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card
            padding="md"
            className="bg-gradient-to-br from-amber-50 to-amber-100 border-0"
          >
            <div>
              <p className="text-sm font-semibold text-slate-600 uppercase tracking-wide">
                Pending Review
              </p>
              <p className="text-3xl font-bold text-amber-600 mt-2">
                {pendingCount}
              </p>
              <p className="text-xs text-slate-600 mt-2">
                Awaiting verification
              </p>
            </div>
          </Card>

          <Card
            padding="md"
            className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-0"
          >
            <div>
              <p className="text-sm font-semibold text-slate-600 uppercase tracking-wide">
                Verified
              </p>
              <p className="text-3xl font-bold text-emerald-600 mt-2">
                {verifiedCount}
              </p>
              <p className="text-xs text-slate-600 mt-2">Approved doctors</p>
            </div>
          </Card>

          <Card
            padding="md"
            className="bg-gradient-to-br from-slate-50 to-slate-100 border-0"
          >
            <div>
              <p className="text-sm font-semibold text-slate-600 uppercase tracking-wide">
                Total Doctors
              </p>
              <p className="text-3xl font-bold text-slate-600 mt-2">
                {doctors.length}
              </p>
              <p className="text-xs text-slate-600 mt-2">All registrations</p>
            </div>
          </Card>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <Card padding="lg" className="text-center">
          <Spinner size="lg" variant="primary" label="Loading doctors..." />
        </Card>
      )}

      {/* Filter Tabs */}
      {!loading && (
        <Card padding="md">
          <div className="flex gap-3">
            <button
              onClick={() => setFilterStatus("pending")}
              className={`px-4 py-2 rounded-lg font-semibold transition ${
                filterStatus === "pending"
                  ? "bg-amber-500 text-white"
                  : "bg-slate-100 text-slate-900 hover:bg-slate-200"
              }`}
            >
              Pending ({pendingCount})
            </button>
            <button
              onClick={() => setFilterStatus("verified")}
              className={`px-4 py-2 rounded-lg font-semibold transition ${
                filterStatus === "verified"
                  ? "bg-emerald-500 text-white"
                  : "bg-slate-100 text-slate-900 hover:bg-slate-200"
              }`}
            >
              Verified ({verifiedCount})
            </button>
            <button
              onClick={() => setFilterStatus("all")}
              className={`px-4 py-2 rounded-lg font-semibold transition ${
                filterStatus === "all"
                  ? "bg-slate-500 text-white"
                  : "bg-slate-100 text-slate-900 hover:bg-slate-200"
              }`}
            >
              All Doctors ({doctors.length})
            </button>
          </div>
        </Card>
      )}

      {/* Doctors List */}
      {!loading && (
        <Card padding="md" className="space-y-4">
          {filteredDoctors.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-slate-600">No doctors found</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredDoctors.map((doctor) => (
                <div
                  key={doctor._id}
                  className="flex items-start justify-between p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-bold text-slate-900">
                        Dr. {doctor.name}
                      </h3>
                      <StatusChip
                        status={doctor.verified ? "verified" : "pending"}
                        size="sm"
                      />
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-2 text-sm">
                      <div>
                        <p className="text-xs text-slate-600 font-semibold uppercase">
                          Specialization
                        </p>
                        <p className="text-slate-900">
                          {doctor.specialization}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-600 font-semibold uppercase">
                          Experience
                        </p>
                        <p className="text-slate-900">
                          {doctor.experience} years
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-600 font-semibold uppercase">
                          Hospital
                        </p>
                        <p className="text-slate-900">{doctor.hospital}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-600 font-semibold uppercase">
                          Applied
                        </p>
                        <p className="text-slate-900">
                          {formatDate(doctor.createdAt)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => handleViewDoctor(doctor)}
                      className="px-3 py-1.5 text-sm font-semibold text-cyan-600 hover:bg-cyan-50 rounded-lg transition"
                    >
                      View Details
                    </button>
                    {!doctor.verified && (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleVerifyDoctor(doctor._id)}
                        disabled={verifyingId === doctor._id}
                      >
                        {verifyingId === doctor._id ? "Verifying..." : "Verify"}
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* Doctor Detail Modal */}
      {showModal && selectedDoctor && (
        <Modal size="md" onClose={() => setShowModal(false)}>
          <div className="space-y-4">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-1">
                Dr. {selectedDoctor.name}
              </h2>
              <StatusChip
                status={selectedDoctor.verified ? "verified" : "pending"}
                size="sm"
              />
            </div>

            <div className="space-y-3 py-4 border-t border-b border-slate-200">
              <div>
                <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1">
                  Specialization
                </p>
                <p className="text-slate-900 font-semibold">
                  {selectedDoctor.specialization}
                </p>
              </div>

              <div>
                <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1">
                  Experience
                </p>
                <p className="text-slate-900">
                  {selectedDoctor.experience} years
                </p>
              </div>

              <div>
                <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1">
                  Hospital / Clinic
                </p>
                <p className="text-slate-900">{selectedDoctor.hospital}</p>
              </div>

              <div>
                <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1">
                  License Number
                </p>
                <p className="text-slate-900 font-mono text-sm">
                  {selectedDoctor.licenseNumber}
                </p>
              </div>

              <div>
                <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1">
                  Phone Number
                </p>
                <p className="text-slate-900">{selectedDoctor.phoneNumber}</p>
              </div>

              <div>
                <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1">
                  Application Date
                </p>
                <p className="text-slate-900">
                  {formatDate(selectedDoctor.createdAt)}
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              {!selectedDoctor.verified ? (
                <>
                  <button
                    onClick={() => handleVerifyDoctor(selectedDoctor._id)}
                    disabled={verifyingId === selectedDoctor._id}
                    className="flex-1 px-4 py-2.5 rounded-lg bg-emerald-500 text-white font-semibold hover:bg-emerald-600 transition disabled:bg-slate-300"
                  >
                    {verifyingId === selectedDoctor._id
                      ? "Verifying..."
                      : "Approve"}
                  </button>
                  <button
                    onClick={() => setShowModal(false)}
                    className="flex-1 px-4 py-2.5 rounded-lg bg-slate-200 text-slate-900 font-semibold hover:bg-slate-300 transition"
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setShowModal(false)}
                  className="w-full px-4 py-2.5 rounded-lg bg-slate-200 text-slate-900 font-semibold hover:bg-slate-300 transition"
                >
                  Close
                </button>
              )}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default DoctorVerification;
