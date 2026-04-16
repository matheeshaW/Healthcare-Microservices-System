import API from "./axios";

// Profile
export const getProfile = () => API.get("/patient/profile");
export const updateProfile = (data) => API.post("/patient/profile", data);
export const deleteProfile = () => API.delete("/patient/profile");

// Reports
export const uploadReport = (formData) =>
  API.post("/reports/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" }
  });

export const deleteReport = (id) =>
  API.delete(`/reports/${id}`);

export const getReports = () => API.get("/reports");