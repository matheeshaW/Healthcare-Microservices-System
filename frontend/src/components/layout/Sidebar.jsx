import { NavLink } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";

function Sidebar() {
  const { user } = useContext(AuthContext);
  const links = [
    { to: "/dashboard", label: "Dashboard" },
    ...(user?.role === "patient"
      ? [
          { to: "/patient/profile", label: "Profile" },
          { to: "/patient/reports", label: "Reports" },
          { to: "/appointment/my", label: "My Appointments" },
          { to: "/appointment/book", label: "Book Appointment" },
        ]
      : []),
    ...(user?.role === "admin" ? [{ to: "/admin", label: "Admin" }] : []),
  ];

  return (
    <aside className="w-64 bg-slate-900 text-white">
      <div className="border-b border-slate-800 px-5 py-4">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-300">
          Navigation
        </p>
        <h2 className="mt-2 text-lg font-bold">Menu</h2>
        {user?.role && (
          <p className="mt-1 text-sm capitalize text-slate-300">
            Signed in as {user.role}
          </p>
        )}
      </div>

      <ul className="space-y-1 p-3">
        {links.map((link) => (
          <li key={link.to}>
            <NavLink
              to={link.to}
              className={({ isActive }) =>
                `block rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                  isActive
                    ? "bg-cyan-500/15 text-cyan-200"
                    : "text-slate-200 hover:bg-slate-800 hover:text-white"
                }`
              }
            >
              {link.label}
            </NavLink>
          </li>
        ))}
      </ul>
    </aside>
  );
}

export default Sidebar;
