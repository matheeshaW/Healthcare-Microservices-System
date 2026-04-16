import { createContext, useState, useEffect } from "react";
import API from "../api/axios";

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  // Load user from localStorage
  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      const parsed = JSON.parse(savedUser);
      console.log("[AuthContext] Loaded user from localStorage:", parsed);
      setUser(parsed);
    } else {
      console.log("[AuthContext] No user in localStorage");
    }
  }, []);

  const login = async ({ email, password }) => {
    const res = await API.post("/auth/login", { email, password });

    console.log("[AuthContext] Login response user:", res.data.user);

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