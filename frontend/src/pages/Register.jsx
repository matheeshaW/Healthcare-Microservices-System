import { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { getSpecializations, registerDoctor } from "../api/doctor.api";

function Register() {
  const [role, setRole] = useState("patient");
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    specialization: "",
    experience: "",
    hospital: "",
    licenseNumber: "",
    phoneNumber: "",
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleRoleChange = (e) => {
    setRole(e.target.value);
    setMessage("");
    setError("");
  };

  const handleRegister = async () => {
    try {
      setError("");
      setMessage("");

      const registrationData = {
        name: form.name,
        email: form.email,
        password: form.password,
        role: role,
      };

      // Include doctor fields if registering as doctor
      if (role === "doctor") {
        registrationData.specialization = form.specialization;
        registrationData.experience = form.experience
          ? parseInt(form.experience)
          : null;
        registrationData.hospital = form.hospital;
        registrationData.licenseNumber = form.licenseNumber;
        registrationData.phoneNumber = form.phoneNumber;

        // Validate doctor fields
        if (
          !form.specialization ||
          !form.experience ||
          !form.hospital ||
          !form.licenseNumber ||
          !form.phoneNumber
        ) {
          alert("Please fill all doctor fields");
          return;
        }
      }

      // Register user in patient service
      const response = await register(registrationData);

      if (role === "doctor") {
        // Register doctor profile in doctor service
        try {
          await registerDoctor({
            userId: response.user._id,
            email: form.email,
            name: form.name,
            specialization: form.specialization,
            experience: parseInt(form.experience),
            hospital: form.hospital,
            licenseNumber: form.licenseNumber,
            phoneNumber: form.phoneNumber,
          });

          setMessage(
            "✓ Registration successful! Your profile has been sent to admin for verification. You'll be able to login once verified.",
          );
          setForm({
            name: "",
            email: "",
            password: "",
            specialization: "",
            experience: "",
            hospital: "",
            licenseNumber: "",
            phoneNumber: "",
          });
          setTimeout(() => {
            navigate("/");
          }, 3000);
        } catch (doctorError) {
          console.error("Doctor profile creation failed:", doctorError);
          setMessage(
            "User created but doctor profile creation failed. Please contact admin.",
          );
        }
      } else {
        alert("Registered successfully!");
        navigate("/");
      }
    } catch (err) {
      setMessage("");
      const errorMessage =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        "Registration failed";
      // Check if error is related to email being already registered
      if (
        errorMessage.toLowerCase().includes("email") ||
        errorMessage.toLowerCase().includes("duplicate") ||
        errorMessage.toLowerCase().includes("already")
      ) {
        setError("Email already exists");
      } else {
        setError(errorMessage);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-100 via-white to-cyan-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white/90 p-8 shadow-2xl backdrop-blur-sm">
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.22em] text-emerald-700">
          {role === "doctor" ? "Healthcare Provider" : "New Patient"}
        </p>
        <h2 className="mb-1 text-3xl font-bold text-slate-900">
          Create Account
        </h2>
        <p className="mb-6 text-sm text-slate-600">
          {role === "doctor"
            ? "Register as a healthcare provider."
            : "Start managing your healthcare profile."}
        </p>

        {/* Role Selector */}
        <div className="mb-6 flex gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="role"
              value="patient"
              checked={role === "patient"}
              onChange={handleRoleChange}
              className="w-4 h-4 accent-emerald-600"
            />
            <span className="text-sm text-slate-700">Patient</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="role"
              value="doctor"
              checked={role === "doctor"}
              onChange={handleRoleChange}
              className="w-4 h-4 accent-emerald-600"
            />
            <span className="text-sm text-slate-700">Doctor</span>
          </label>
        </div>

        {/* Basic Fields */}
        <input
          name="name"
          placeholder="Name"
          value={form.name}
          onChange={handleChange}
          className="mb-3 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
        />
        <input
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          className="mb-3 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
        />
        <input
          name="password"
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          className="mb-5 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
        />

        {/* Doctor Fields - Conditional */}
        {role === "doctor" && (
          <div className="grid grid-cols-2 gap-3 mb-5">
            <select
              name="specialization"
              value={form.specialization}
              onChange={handleChange}
              className="col-span-1 rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
            >
              <option value="">Select Specialization</option>
              {getSpecializations().map((spec) => (
                <option key={spec} value={spec}>
                  {spec}
                </option>
              ))}
            </select>
            <input
              name="experience"
              placeholder="Years of Experience"
              type="number"
              value={form.experience}
              onChange={handleChange}
              className="col-span-1 rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
            />
            <input
              name="hospital"
              placeholder="Hospital / Clinic Name"
              value={form.hospital}
              onChange={handleChange}
              className="col-span-1 rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
            />
            <input
              name="licenseNumber"
              placeholder="License Number"
              value={form.licenseNumber}
              onChange={handleChange}
              className="col-span-1 rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
            />
            <input
              name="phoneNumber"
              placeholder="Phone Number"
              value={form.phoneNumber}
              onChange={handleChange}
              className="col-span-2 rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
            />
          </div>
        )}

        {/* Success Message for Doctors */}
        {message && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm">
            {message}
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-800 text-sm">
            ✕ {error}
          </div>
        )}

        <button
          onClick={handleRegister}
          className="w-full rounded-xl bg-emerald-600 px-4 py-2.5 font-semibold text-white transition hover:bg-emerald-700"
        >
          Register
        </button>

        <p className="mt-5 text-center text-sm text-slate-600">
          Already have an account?{" "}
          <Link
            to="/"
            className="font-semibold text-emerald-700 hover:text-emerald-800"
          >
            Back to login
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Register;