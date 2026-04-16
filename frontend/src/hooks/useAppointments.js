import { useCallback, useState } from "react";
import {
  cancelAppointment,
  createAppointment,
  deleteAppointment,
  getApiErrorMessage,
  getMyAppointmentById,
  getMyAppointments,
} from "../api/appointment.api";

function useAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [cancellingId, setCancellingId] = useState("");
  const [deletingId, setDeletingId] = useState("");

  const clearError = useCallback(() => {
    setError("");
  }, []);

  const fetchMine = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const result = await getMyAppointments();
      setAppointments(result);
      return result;
    } catch (requestError) {
      setError(getApiErrorMessage(requestError));
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const createForPatient = useCallback(async (payload) => {
    setSubmitting(true);
    setError("");

    try {
      const created = await createAppointment(payload);

      if (created) {
        setAppointments((current) => [created, ...current]);
      }

      return created;
    } catch (requestError) {
      const message = getApiErrorMessage(requestError);
      setError(message);
      throw new Error(message);
    } finally {
      setSubmitting(false);
    }
  }, []);

  const cancelMine = useCallback(async (appointmentId) => {
    setCancellingId(appointmentId);
    setError("");

    try {
      const updated = await cancelAppointment(appointmentId);

      setAppointments((current) =>
        current.map((item) =>
          item._id === appointmentId
            ? {
                ...item,
                ...(updated || {}),
                status: "cancelled",
              }
            : item,
        ),
      );

      return updated;
    } catch (requestError) {
      const message = getApiErrorMessage(requestError);
      setError(message);
      throw new Error(message);
    } finally {
      setCancellingId("");
    }
  }, []);

  const fetchAppointmentById = useCallback(async (appointmentId) => {
    setLoading(true);
    setError("");

    try {
      const appointment = await getMyAppointmentById(appointmentId);
      return appointment;
    } catch (requestError) {
      const message = getApiErrorMessage(requestError);
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteMine = useCallback(async (appointmentId) => {
    setDeletingId(appointmentId);
    setError("");

    try {
      await deleteAppointment(appointmentId);

      setAppointments((current) =>
        current.filter((item) => item._id !== appointmentId),
      );

      return true;
    } catch (requestError) {
      const message = getApiErrorMessage(requestError);
      setError(message);
      throw new Error(message);
    } finally {
      setDeletingId("");
    }
  }, []);

  return {
    appointments,
    loading,
    error,
    submitting,
    cancellingId,
    deletingId,
    clearError,
    fetchMine,
    createForPatient,
    cancelMine,
    deleteMine,
    fetchAppointmentById,
  };
}

export default useAppointments;
