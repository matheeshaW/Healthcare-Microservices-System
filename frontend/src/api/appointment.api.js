import API from "./axios";

const unwrapData = (response) => response?.data?.data;

export const getApiErrorMessage = (error) => {
  return (
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.message ||
    "Something went wrong"
  );
};

export const createAppointment = async ({ doctorId, date, time }) => {
  const response = await API.post("/appointments", { doctorId, date, time });
  return unwrapData(response);
};

export const getMyAppointments = async () => {
  const response = await API.get("/appointments/my");
  return unwrapData(response) || [];
};

export const getMyAppointmentById = async (appointmentId) => {
  const appointments = await getMyAppointments();
  return appointments.find((item) => item._id === appointmentId) || null;
};

export const cancelAppointment = async (appointmentId) => {
  const response = await API.delete(`/appointments/${appointmentId}`);
  return unwrapData(response);
};

export const rescheduleAppointment = async (appointmentId, payload) => {
  const response = await API.put(
    `/appointments/${appointmentId}/reschedule`,
    payload,
  );
  return unwrapData(response);
};

export const deleteAppointment = async (appointmentId) => {
  const response = await API.delete(`/appointments/${appointmentId}/delete`);
  return unwrapData(response);
};

export const getAllAppointments = async () => {
  const response = await API.get("/appointments/admin/all");
  return unwrapData(response) || [];
};

export const searchDoctors = async (params = {}) => {
  const response = await API.get("/doctors/search", {
    params: {
      verified: "true",
      ...params,
    },
  });

  return unwrapData(response) || [];
};

export const getDoctorById = async (doctorId) => {
  const response = await API.get(`/doctors/${doctorId}`);
  return unwrapData(response);
};

export const getDoctorAvailabilities = async (doctorId, date) => {
  const response = await API.get(`/availability/doctor/${doctorId}`, {
    params: {
      fromDate: date,
      toDate: date,
    },
  });

  return unwrapData(response) || [];
};

export const subscribeMyAppointmentUpdates = ({
  onSnapshot,
  onUpdated,
  onError,
} = {}) => {
  const token = localStorage.getItem("token");

  if (!token) {
    return () => {};
  }

  const url = `http://localhost:5000/api/appointments/stream/my?token=${encodeURIComponent(token)}`;
  const eventSource = new EventSource(url);

  eventSource.addEventListener("snapshot", (event) => {
    try {
      const payload = JSON.parse(event.data);
      onSnapshot?.(Array.isArray(payload) ? payload : []);
    } catch (error) {
      onError?.(error);
    }
  });

  eventSource.addEventListener("appointment-updated", (event) => {
    try {
      const payload = JSON.parse(event.data);
      onUpdated?.(payload?.appointment || null);
    } catch (error) {
      onError?.(error);
    }
  });

  eventSource.addEventListener("error", (event) => {
    onError?.(event);
  });

  return () => {
    eventSource.close();
  };
};
