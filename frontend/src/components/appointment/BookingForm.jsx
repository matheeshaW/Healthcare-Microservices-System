import { useEffect, useMemo, useState } from "react";
import {
  getApiErrorMessage,
  getDoctorAvailabilities,
  searchDoctors,
} from "../../api/appointment.api";

const formatDateInput = (date) => date.toISOString().split("T")[0];
const MAX_BOOKING_WINDOW_DAYS = 30;
const todayDate = new Date();
todayDate.setHours(0, 0, 0, 0);
const today = formatDateInput(todayDate);
const maxBookDateValue = (() => {
  const maxDate = new Date(todayDate);
  maxDate.setDate(maxDate.getDate() + MAX_BOOKING_WINDOW_DAYS);
  return formatDateInput(maxDate);
})();

function BookingForm({ onSubmit, submitting }) {
  const [doctors, setDoctors] = useState([]);
  const [form, setForm] = useState({
    doctorId: "",
    date: today,
    time: "",
  });
  const [slots, setSlots] = useState([]);
  const [doctorLoading, setDoctorLoading] = useState(false);
  const [slotLoading, setSlotLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let isMounted = true;

    const loadDoctors = async () => {
      setDoctorLoading(true);

      try {
        const result = await searchDoctors();

        if (isMounted) {
          setDoctors(result);
          if (result.length > 0) {
            setForm((current) => ({
              ...current,
              doctorId: current.doctorId || result[0]._id,
            }));
          }
        }
      } catch (requestError) {
        if (isMounted) {
          setError(getApiErrorMessage(requestError));
        }
      } finally {
        if (isMounted) {
          setDoctorLoading(false);
        }
      }
    };

    loadDoctors();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!form.doctorId || !form.date) {
      setSlots([]);
      return;
    }

    let isMounted = true;

    const loadSlots = async () => {
      setSlotLoading(true);
      setError("");
      setSuccess("");

      try {
        const availabilities = await getDoctorAvailabilities(form.doctorId, form.date);

        const availableSlots = availabilities
          .flatMap((entry) => entry.slots || [])
          .filter((slot) => !slot.isBooked && slot.available !== false)
          .map((slot) => slot.time)
          .filter(Boolean)
          .sort((a, b) => a.localeCompare(b));

        if (isMounted) {
          setSlots(availableSlots);
          setForm((current) => ({
            ...current,
            time: availableSlots.includes(current.time) ? current.time : "",
          }));
        }
      } catch (requestError) {
        if (isMounted) {
          setError(getApiErrorMessage(requestError));
          setSlots([]);
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
  }, [form.doctorId, form.date, refreshKey]);

  const doctorOptions = useMemo(() => {
    return doctors.map((doctor) => ({
      value: doctor._id,
      label: `${doctor.name} - ${doctor.specialization}`,
    }));
  }, [doctors]);

  const selectedDoctor = useMemo(
    () => doctors.find((doctor) => doctor._id === form.doctorId) || null,
    [doctors, form.doctorId],
  );

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!form.doctorId || !form.date || !form.time) {
      setError("Please select doctor, date, and time.");
      return;
    }

    try {
      await onSubmit(form);
      setSuccess("Appointment booked successfully.");
      setForm((current) => ({ ...current, time: "" }));
      setRefreshKey((current) => current + 1);
    } catch (requestError) {
      setError(requestError.message || "Failed to create appointment");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Book Appointment</h2>
          <p className="mt-1 text-sm text-slate-600">
            Booking here immediately affects the doctor's visible availability.
          </p>
        </div>

        <div className="rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-700">
          <p className="font-medium text-slate-900">Available slots</p>
          <p>{slotLoading ? "Checking..." : `${slots.length} open for this day`}</p>
        </div>
      </div>

      {error && (
        <p className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {error}
        </p>
      )}

      {success && (
        <p className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
          {success}
        </p>
      )}

      {selectedDoctor && (
        <div className="grid gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700 md:grid-cols-3">
          <div>
            <p className="font-medium text-slate-900">Doctor</p>
            <p>{selectedDoctor.name}</p>
          </div>
          <div>
            <p className="font-medium text-slate-900">Specialization</p>
            <p>{selectedDoctor.specialization}</p>
          </div>
          <div>
            <p className="font-medium text-slate-900">Hospital</p>
            <p>{selectedDoctor.hospital || "Not provided"}</p>
          </div>
        </div>
      )}

      <div className="space-y-1">
        <label className="text-sm font-medium text-slate-700" htmlFor="doctorId">
          Doctor
        </label>
        <select
          id="doctorId"
          name="doctorId"
          value={form.doctorId}
          onChange={handleChange}
          disabled={doctorLoading || doctors.length === 0}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 disabled:cursor-not-allowed disabled:bg-slate-100"
        >
          <option value="">
            {doctorLoading ? "Loading doctors..." : "Select a doctor"}
          </option>
          {doctorOptions.map((doctor) => (
            <option key={doctor.value} value={doctor.value}>
              {doctor.label}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-1">
        <label className="text-sm font-medium text-slate-700" htmlFor="date">
          Date
        </label>
        <input
          id="date"
          name="date"
          type="date"
          min={today}
          max={maxBookDateValue}
          value={form.date}
          onChange={handleChange}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200"
        />
      </div>

      <div className="space-y-1">
        <label className="text-sm font-medium text-slate-700" htmlFor="time">
          Time Slot
        </label>
        <select
          id="time"
          name="time"
          value={form.time}
          onChange={handleChange}
          disabled={slotLoading || slots.length === 0}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 disabled:cursor-not-allowed disabled:bg-slate-100"
        >
          <option value="">
            {slotLoading ? "Loading slots..." : "Select a slot"}
          </option>
          {slots.map((slot) => (
            <option key={slot} value={slot}>
              {slot}
            </option>
          ))}
        </select>
        {!slotLoading && form.doctorId && slots.length === 0 && (
          <p className="text-sm text-amber-700">
            No free slots are available for this doctor on the selected date.
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={submitting || doctorOptions.length === 0 || !form.time}
        className="w-full rounded-lg bg-cyan-600 px-4 py-2 font-semibold text-white transition hover:bg-cyan-700 disabled:cursor-not-allowed disabled:bg-cyan-300"
      >
        {submitting ? "Booking..." : "Create Appointment"}
      </button>
    </form>
  );
}

export default BookingForm;
