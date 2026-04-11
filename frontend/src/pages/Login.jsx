import { useState, useContext } from "react";
import API from "../api/axios";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogin = async () => {
    const res = await API.post("/auth/login", {
      email,
      password
    });

    login(res.data);
    navigate("/dashboard");
  };

  return (
    <div className="h-screen flex items-center justify-center">
      <div className="p-6 bg-white shadow-lg rounded-lg w-80">
        <h2 className="text-xl font-bold mb-4">Login</h2>

        <input
          className="w-full mb-2 p-2 border"
          placeholder="Email"
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          className="w-full mb-4 p-2 border"
          placeholder="Password"
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          className="w-full bg-blue-500 text-white p-2 rounded"
          onClick={handleLogin}
        >
          Login
        </button>
      </div>
    </div>
  );
}

export default Login;