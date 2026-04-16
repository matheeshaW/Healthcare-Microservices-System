import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import AppointmentStatusBadge from "../../components/appointment/AppointmentStatusBadge";
import useAppointments from "../../hooks/useAppointments";
import { getDoctorAvailabilities, getDoctorById } from "../../api/appointment.api";

const formatDate = (value) => {
  if (!value) {
    return "N/A";
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? value : parsed.toLocaleDateString();
};

function AppointmentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    loading,
    error,
    cancellingId,
    reschedulingId,
    realtimeConnected,
    fetchAppointmentById,
    cancelMine,
    rescheduleMine,
  } = useAppointments();
  const [appointment, setAppointment] = useState(null);
  const [doctorName, setDoctorName] = useState("");
  const [notice, setNotice] = useState("");
  const [nextDate, setNextDate] = useState("");
  const [nextTime, setNextTime] = useState("");
  const [timeOptions, setTimeOptions] = useState([]);
  const [slotLoading, setSlotLoading] = useState(false);

  const dateInputValue = nextDate || (appointment?.date ? new Date(appointment.date).toISOString().slice(0, 10) : "");

  useEffect(() => {
    let isMounted = true;

    const loadAppointment = async () => {
      const result = await fetchAppointmentById(id);

      if (!isMounted) {
        return;
      }

      setAppointment(result);
      setNextDate(result?.date ? new Date(result.date).toISOString().slice(0, 10) : "");
      setNextTime(result?.time || "");

      if (result?.doctorId) {
        try {
          const doctor = await getDoctorById(result.doctorId);
          if (isMounted) {
            setDoctorName(doctor?.name || "");
          }
        } catch {
          if (isMounted) {
            setDoctorName("");
          }
        }
      }
    };

    loadAppointment();

    return () => {
      isMounted = false;
    };
  }, [id, fetchAppointmentById]);

  useEffect(() => {
    if (!appointment?.doctorId || !dateInputValue) {
      setTimeOptions([]);
      return;
    }

    let isMounted = true;

    const loadSlots = async () => {
      setSlotLoading(true);

      try {
        const availabilities = await getDoctorAvailabilities(appointment.doctorId, dateInputValue);
        const availableSlots = availabilities
          .flatMap((entry) => entry.slots || [])
          .filter((slot) => !slot.isBooked && slot.available !== false)
          .map((slot) => slot.time)
          .filter(Boolean)
          .sort((a, b) => a.localeCompare(b));

        if (isMounted) {
          const uniqueSlots = [...new Set([appointment.time, ...availableSlots])].filter(Boolean);
          setTimeOptions(uniqueSlots);

          if (!uniqueSlots.includes(nextTime)) {
            setNextTime(uniqueSlots[0] || "");
          }
        }
      } catch {
        if (isMounted) {
          setTimeOptions(appointment?.time ? [appointment.time] : []);
        }
      } finally {
        if (isMounted) {
          setSlotLoading(false);
        }
      }
    };

    loadSlots();

    return () => {
      isMounted = false;
    };
  }, [appointment?.doctorId, appointment?.time, dateInputValue, nextTime]);

  const handleCancel = async () => {
    const shouldCancel = window.confirm("Cancel this appointment?");

    if (!shouldCancel) {
      return;
    }

    try {
      const updated = await cancelMine(id);
      setAppointment((current) => ({
        ...current,
        ...(updated || {}),
        status: "cancelled",
      }));
      setNotice("Appointment cancelled. The doctor's slot can now be released back to availability.");
    } catch {
      // Hook already exposes error state.
    }
  };

  const handleReschedule = async () => {
    if (!appointment) {
      return;
    }

    if (!dateInputValue || !nextTime) {
      setNotice("Please choose a new date and time to reschedule.");
      return;
    }

    try {
      const updated = await rescheduleMine(appointment._id, {
        date: dateInputValue,
        time: nextTime,
      });

      if (updated) {
        setAppointment((current) => ({
          ...current,
          ...updated,
        }));
      }

      setNotice("Appointment rescheduled successfully. Status was reset to pending.");
    } catch {
      // Hook error is rendered via shared error state.
    }
  };

  if (loading) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-6 text-center text-slate-700">
        Loading appointment details...
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
        {error}
      </div>
    );
  }

  if (!appointment) {
    return (
      <div className="space-y-3 rounded-xl border border-slate-200 bg-white p-6 text-center text-slate-700">
        <p>Appointment not found.</p>
        <Link to="/appointment/my" className="font-semibold text-cyan-700 hover:text-cyan-800">
          Back to My Appointments
        </Link>
      </div>
    );
  }

  return (
    <section className="mx-auto max-w-3xl space-y-4">
      {notice && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
          {notice}
        </div>
      )}

      {!realtimeConnected && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-700">
          Real-time updates are reconnecting...
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-[1.7fr_1fr]">
        <article className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <header className="mb-4 flex items-center justify-between gap-2">
            <h1 className="text-2xl font-bold text-slate-900">Appointment Detail</h1>
            <AppointmentStatusBadge status={appointment.status} />
          </header>

          <dl className="grid gap-4 text-sm text-slate-700 md:grid-cols-2">
            <div>
              <dt className="font-medium text-slate-900">Appointment ID</dt>
              <dd className="break-all">{appointment._id}</dd>
            </div>
            <div>
              <dt className="font-medium text-slate-900">Doctor</dt>
              <dd>{doctorName || appointment.doctorId}</dd>
            </div>
            <div>
              <dt className="font-medium text-slate-900">Date</dt>
              <dd>{formatDate(appointment.date)}</dd>
            </div>
            <div>
              <dt className="font-medium text-slate-900">Time</dt>
              <dd>{appointment.time}</dd>
            </div>
            <div>
              <dt className="font-medium text-slate-900">Payment Status</dt>
              <dd className="capitalize">{appointment.paymentStatus || "pending"}</dd>
            </div>
            <div>
              <dt className="font-medium text-slate-900">Current Status</dt>
              <dd className="capitalize">{appointment.status}</dd>
            </div>
          </dl>

          <div className="mt-6 flex flex-wrap gap-2">
            <Link
              to="/appointment/my"
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
            >
              Back to My Appointments
            </Link>

            <button
              type="button"
              onClick={handleCancel}
              disabled={appointment.status === "cancelled" || cancellingId === id}
              className="rounded-lg bg-rose-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:bg-rose-300"
            >
              {cancellingId === id ? "Cancelling..." : "Cancel Appointment"}
            </button>

            <button
              type="button"
              onClick={handleReschedule}
              disabled={
                appointment.status === "cancelled" ||
                appointment.status === "completed" ||
                reschedulingId === id ||
                slotLoading
              }
              className="rounded-lg bg-amber-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-amber-700 disabled:cursor-not-allowed disabled:bg-amber-300"
            >
              {reschedulingId === id ? "Rescheduling..." : "Reschedule"}
            </button>

            <button
              type="button"
              onClick={() => navigate("/appointment/book")}
              className="rounded-lg bg-cyan-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-cyan-700"
            >
              Book Another
            </button>
          </div>
        </article>

        <aside className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Workflow impact</h2>
          <p className="mt-2 text-sm text-slate-600">
            This booking is linked to doctor availability. When the appointment is active,
            the selected doctor slot is occupied. If you cancel it, that slot can be freed
            again for future bookings.
          </p>

          <div className="mt-4 space-y-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-800" htmlFor="reschedule-date">
                New Date
              </label>
              <input
                id="reschedule-date"
                type="date"
                value={dateInputValue}
                min={new Date().toISOString().slice(0, 10)}
                onChange={(event) => setNextDate(event.target.value)}
                disabled={appointment.status === "cancelled" || appointment.status === "completed"}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 disabled:cursor-not-allowed disabled:bg-slate-100"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-800" htmlFor="reschedule-time">
                New Time
              </label>
              <select
                id="reschedule-time"
                value={nextTime}
                onChange={(event) => setNextTime(event.target.value)}
                disabled={slotLoading || appointment.status === "cancelled" || appointment.status === "completed"}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 disabled:cursor-not-allowed disabled:bg-slate-100"
              >
                <option value="">{slotLoading ? "Loading slots..." : "Select new time"}</option>
                {timeOptions.map((time) => (
                  <option key={time} value={time}>
                    {time}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}

export default AppointmentDetail;
