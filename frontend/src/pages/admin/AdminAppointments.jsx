/**
 * Admin Appointments Page
 */

import { useEffect, useMemo, useState } from "react";
import { Card, Spinner, Badge, Button } from "../../components/ui";
import { getAllAppointments, getApiErrorMessage } from "../../api/appointment.api";
import { getDoctorById } from "../../api/doctor.api";
import { getPatientById } from "../../api/patient.api";

const statusVariants = {
  pending: "warning",
  confirmed: "specialization",
  completed: "success",
  cancelled: "danger",
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

export const AdminAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [patientNames, setPatientNames] = useState({});
  const [doctorNames, setDoctorNames] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    loadAppointments();
  }, []);

  const loadAppointments = async () => {
    try {
      setLoading(true);
      setError(null);

      const list = await getAllAppointments();
      setAppointments(list);

      const uniquePatientIds = [...new Set(list.map((item) => item.patientId).filter(Boolean))];
      const uniqueDoctorIds = [...new Set(list.map((item) => item.doctorId).filter(Boolean))];

      const [patientEntries, doctorEntries] = await Promise.all([
        Promise.all(
          uniquePatientIds.map(async (patientId) => {
            try {
              const response = await getPatientById(patientId);
              return [patientId, response?.data?.data?.name || ""];
            } catch {
              return [patientId, ""];
            }
          }),
        ),
        Promise.all(
          uniqueDoctorIds.map(async (doctorId) => {
            try {
              const response = await getDoctorById(doctorId);
              return [doctorId, response?.data?.name || response?.data?.data?.name || ""];
            } catch {
              return [doctorId, ""];
            }
          }),
        ),
      ]);

      setPatientNames(Object.fromEntries(patientEntries.filter(([, name]) => name)));
      setDoctorNames(Object.fromEntries(doctorEntries.filter(([, name]) => name)));
    } catch (requestError) {
      setError(getApiErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  };

  const summary = useMemo(() => {
    return appointments.reduce(
      (accumulator, appointment) => {
        accumulator.total += 1;
        accumulator[appointment.status] = (accumulator[appointment.status] || 0) + 1;
        return accumulator;
      },
      { total: 0, pending: 0, confirmed: 0, completed: 0, cancelled: 0 },
    );
  }, [appointments]);

  const filteredAppointments = useMemo(() => {
    const filtered = appointments.filter((appointment) => {
      const matchesStatus = filterStatus === "all" || appointment.status === filterStatus;
      const patientLabel = patientNames[appointment.patientId] || appointment.patientId || "";
      const doctorLabel = doctorNames[appointment.doctorId] || appointment.doctorId || "";
      const matchesSearch =
        patientLabel.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doctorLabel.toLowerCase().includes(searchTerm.toLowerCase()) ||
        String(appointment._id).toLowerCase().includes(searchTerm.toLowerCase());

      return matchesStatus && matchesSearch;
    });

    return filtered.sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [appointments, doctorNames, filterStatus, patientNames, searchTerm]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-4xl font-bold text-slate-900 mb-2">
            Appointment Management
          </h1>
          <p className="text-slate-600">
            View all appointments with patient and doctor details
          </p>
        </div>

        <Button variant="secondary" onClick={loadAppointments}>
          Refresh
        </Button>
      </div>

      {error && (
        <Card padding="md" className="bg-red-50 border border-red-200">
          <p className="text-red-700 font-semibold">{error}</p>
        </Card>
      )}

      {loading && (
        <Card padding="lg" className="text-center">
          <Spinner size="lg" variant="primary" label="Loading appointments..." />
        </Card>
      )}

      {!loading && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4">
            {[
              ["Total", summary.total, "default"],
              ["Pending", summary.pending, "warning"],
              ["Confirmed", summary.confirmed, "specialization"],
              ["Completed", summary.completed, "success"],
              ["Cancelled", summary.cancelled, "danger"],
            ].map(([label, value, variant]) => (
              <Card key={label} padding="md" className="border-0 bg-white shadow-sm">
                <p className="text-sm font-semibold text-slate-600 uppercase tracking-wide">
                  {label}
                </p>
                <p className="mt-2 text-3xl font-bold text-slate-900">{value}</p>
                <Badge variant={variant}>{label}</Badge>
              </Card>
            ))}
          </div>

          <Card padding="md" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Search
                </label>
                <input
                  type="text"
                  placeholder="Search by patient, doctor, or appointment ID"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-4 py-2.5 outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Filter by Status
                </label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-4 py-2.5 outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200"
                >
                  <option value="all">All</option>
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>
          </Card>

          <Card padding="md" className="space-y-4">
            <h2 className="text-lg font-bold text-slate-900">
              Appointments ({filteredAppointments.length})
            </h2>

            {filteredAppointments.length === 0 ? (
              <div className="rounded-lg border border-dashed border-slate-300 p-8 text-center text-slate-600">
                No appointments found.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[980px]">
                  <thead>
                    <tr className="border-b border-slate-200 text-left text-sm text-slate-700">
                      <th className="py-3 px-4">Patient</th>
                      <th className="py-3 px-4">Doctor</th>
                      <th className="py-3 px-4">Date</th>
                      <th className="py-3 px-4">Time</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Payment</th>
                      <th className="py-3 px-4">Appointment ID</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAppointments.map((appointment) => (
                      <tr key={appointment._id} className="border-b border-slate-200 hover:bg-slate-50">
                        <td className="py-3 px-4 font-semibold text-slate-900">
                          {patientNames[appointment.patientId] || appointment.patientId || "N/A"}
                        </td>
                        <td className="py-3 px-4 text-slate-700">
                          {doctorNames[appointment.doctorId] || appointment.doctorId || "N/A"}
                        </td>
                        <td className="py-3 px-4 text-slate-700">
                          {formatDate(appointment.date)}
                        </td>
                        <td className="py-3 px-4 text-slate-700">
                          {appointment.time || "N/A"}
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant={statusVariants[appointment.status] || "default"}>
                            {appointment.status || "unknown"}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-slate-700 capitalize">
                          {appointment.paymentStatus || "pending"}
                        </td>
                        <td className="py-3 px-4 text-xs font-mono text-slate-500">
                          {appointment._id}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </>
      )}
    </div>
  );
};

export default AdminAppointments;