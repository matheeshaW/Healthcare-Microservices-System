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
