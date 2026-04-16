import { createContext, useState, useEffect } from "react";
import API from "../api/axios";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  // Load user from localStorage
  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const login = async ({ email, password }) => {
    const res = await API.post("/auth/login", { email, password });

    // Check if user is a doctor and verify their profile is approved
    if (res.data.user.role === "doctor") {
      try {
        // Set token temporarily to make authenticated request
        const tempToken = res.data.token;
        API.defaults.headers.common["Authorization"] = `Bearer ${tempToken}`;

        // Fetch doctor profile to check verification status
        const doctorRes = await API.get("/doctors/me");

        // If doctor profile is not verified, reject login
        if (!doctorRes.data.data.verified) {
          // Clear the temporary token
          delete API.defaults.headers.common["Authorization"];

          const error = new Error(
            "Your doctor profile is pending admin verification. Please wait until an admin verifies your credentials.",
          );
          error.response = {
            data: {
              message:
                "Login failed: Your doctor profile is pending admin verification. Please wait for approval.",
            },
          };
          throw error;
        }
      } catch (err) {
        // Clear any stored data
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        delete API.defaults.headers.common["Authorization"];
        throw err;
      }
    }

    localStorage.setItem("token", res.data.token);
    localStorage.setItem("user", JSON.stringify(res.data.user));

    setUser(res.data.user);

    return res.data;
  };

  const register = async (data) => {
    const res = await API.post("/auth/register", data);
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
