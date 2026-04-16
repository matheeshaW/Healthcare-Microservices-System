import { useCallback, useEffect, useState } from "react";
import {
  cancelAppointment,
  createAppointment,
  getApiErrorMessage,
  getMyAppointmentById,
  getMyAppointments,
  rescheduleAppointment,
  subscribeMyAppointmentUpdates,
} from "../api/appointment.api";

function useAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [cancellingId, setCancellingId] = useState("");
  const [reschedulingId, setReschedulingId] = useState("");
  const [realtimeConnected, setRealtimeConnected] = useState(false);

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

  useEffect(() => {
    const unsubscribe = subscribeMyAppointmentUpdates({
      onSnapshot: (snapshot) => {
        setAppointments(snapshot);
        setRealtimeConnected(true);
      },
      onUpdated: (nextAppointment) => {
        if (!nextAppointment?._id) {
          return;
        }

        setAppointments((current) => {
          const index = current.findIndex((item) => item._id === nextAppointment._id);

          if (index === -1) {
            return [nextAppointment, ...current];
          }

          const updated = [...current];
          updated[index] = {
            ...updated[index],
            ...nextAppointment,
          };
          return updated;
        });
      },
      onError: () => {
        setRealtimeConnected(false);
      },
    });

    return () => {
      unsubscribe();
      setRealtimeConnected(false);
    };
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

  const rescheduleMine = useCallback(async (appointmentId, payload) => {
    setReschedulingId(appointmentId);
    setError("");

    try {
      const updated = await rescheduleAppointment(appointmentId, payload);

      setAppointments((current) =>
        current.map((item) =>
          item._id === appointmentId
            ? {
                ...item,
                ...(updated || {}),
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
      setReschedulingId("");
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

  return {
    appointments,
    loading,
    error,
    submitting,
    cancellingId,
    reschedulingId,
    realtimeConnected,
    clearError,
    fetchMine,
    createForPatient,
    cancelMine,
    rescheduleMine,
    fetchAppointmentById,
  };
}

export default useAppointments;
