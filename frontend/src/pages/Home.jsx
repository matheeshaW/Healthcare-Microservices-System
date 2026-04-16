import { useContext } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

function Home() {
  const { user } = useContext(AuthContext);
  const role = user?.role || "patient";

  const quickActionsByRole = {
    patient: [
      { label: "Update My Profile", to: "/patient/profile" },
      { label: "View My Reports", to: "/patient/reports" },
    ],
    doctor: [
      { label: "Doctor Dashboard", to: "/doctor/dashboard" },
      { label: "Manage Availability", to: "/doctor/availability" },
    ],
    admin: [
      { label: "Admin Dashboard", to: "/admin" },
      { label: "User Management", to: "/admin/users" },
    ],
  };

  const statsByRole = {
    patient: [
      { label: "Profile Status", value: "Ready" },
      { label: "Reports", value: "Track here" },
      { label: "Appointments", value: "Coming soon" },
    ],
    doctor: [
      { label: "Consultation Queue", value: "Live" },
      { label: "Availability", value: "Manage" },
    ],
    admin: [
      { label: "Platform Health", value: "Good" },
      { label: "Users", value: "Monitor" },
      { label: "Verifications", value: "Pending" },
    ],
  };

  const quickActions = quickActionsByRole[role] || quickActionsByRole.patient;
  const stats = statsByRole[role] || statsByRole.patient;

  return (
    <section className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-700">
          Welcome
        </p>
        <h1 className="mt-2 text-3xl font-bold text-slate-900">Home</h1>
        <p className="mt-2 text-slate-600">
          Hello {user?.name || "User"}. You are logged in as
          <span className="ml-1 rounded-full bg-cyan-100 px-2 py-0.5 text-sm font-semibold text-cyan-700">
            {role}
          </span>
          .
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {stats.map((item) => (
          <article
            key={item.label}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <p className="text-sm text-slate-500">{item.label}</p>
            <p className="mt-2 text-xl font-semibold text-slate-900">
              {item.value}
            </p>
          </article>
        ))}
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-bold text-slate-900">Quick Actions</h2>
        <div className="mt-4 flex flex-wrap gap-3">
          {quickActions.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="rounded-xl bg-cyan-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-cyan-700"
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Home;
