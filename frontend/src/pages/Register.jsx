import { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";

function Register() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: ""
  });

  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleRegister = async () => {
    try {
      await register(form);
      alert("Registered successfully!");
      navigate("/");
    } catch (err) {
      alert(err?.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-100 via-white to-cyan-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white/90 p-8 shadow-2xl backdrop-blur-sm">
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.22em] text-emerald-700">
          New Patient
        </p>
        <h2 className="mb-1 text-3xl font-bold text-slate-900">Create Account</h2>
        <p className="mb-6 text-sm text-slate-600">
          Start managing your healthcare profile.
        </p>

        <input
          name="name"
          placeholder="Name"
          onChange={handleChange}
          className="mb-3 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
        />
        <input
          name="email"
          placeholder="Email"
          onChange={handleChange}
          className="mb-3 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
        />
        <input
          name="password"
          type="password"
          placeholder="Password"
          onChange={handleChange}
          className="mb-5 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
        />

        <button
          onClick={handleRegister}
          className="w-full rounded-xl bg-emerald-600 px-4 py-2.5 font-semibold text-white transition hover:bg-emerald-700"
        >
          Register
        </button>

        <p className="mt-5 text-center text-sm text-slate-600">
          Already have an account?{" "}
          <Link to="/" className="font-semibold text-emerald-700 hover:text-emerald-800">
            Back to login
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Register;