import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api",
});

// Separate instance for unauthenticated requests (like registration)
export const APINoAuth = axios.create({
  baseURL: "http://localhost:5000/api",
});

// Attach token automatically to authenticated requests
API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");

  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }

  return req;
});

export default API;
