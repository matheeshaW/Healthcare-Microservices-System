import API from "./axios";

// Profile
export const getProfile = () => API.get("/patient/profile");
export const updateProfile = (data) => API.post("/patient/profile", data);

// Reports
export const uploadReport = (formData) =>
  API.post("/reports/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" }
  });

export const getReports = () => API.get("/reports");