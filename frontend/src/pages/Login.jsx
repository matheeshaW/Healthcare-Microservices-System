import { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      await login({ email, password });
      navigate("/dashboard");
    } catch (err) {
      alert(err?.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-cyan-100 via-white to-emerald-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white/90 p-8 shadow-2xl backdrop-blur-sm">
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.22em] text-cyan-700">
          Healthcare System
        </p>
        <h2 className="mb-1 text-3xl font-bold text-slate-900">Welcome Back</h2>
        <p className="mb-6 text-sm text-slate-600">
          Sign in to access your dashboard.
        </p>

        <input
          className="mb-3 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-slate-900 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200"
          placeholder="Email"
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          className="mb-5 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-slate-900 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200"
          placeholder="Password"
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          className="w-full rounded-xl bg-cyan-600 px-4 py-2.5 font-semibold text-white transition hover:bg-cyan-700"
          onClick={handleLogin}
        >
          Login
        </button>

        <p className="mt-5 text-center text-sm text-slate-600">
          No account yet?{" "}
          <Link
            to="/register"
            className="font-semibold text-cyan-700 hover:text-cyan-800"
          >
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
