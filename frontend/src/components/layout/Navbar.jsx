/**
 * Navbar Component
 */

import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";

export const Navbar = ({ userRole = "doctor", onMenuToggle }) => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const notifications = [
    { id: 1, message: "New appointment request", time: "5 min ago" },
    { id: 2, message: "Prescription approved", time: "1 hour ago" },
    { id: 3, message: "Profile verification completed", time: "2 hours ago" },
  ];

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
    navigate("/login", { replace: true });
  };

  const getRoleBadgeColor = () => {
    switch (userRole) {
      case "doctor":
        return "bg-cyan-100 text-cyan-900";
      case "patient":
        return "bg-emerald-100 text-emerald-900";
      case "admin":
        return "bg-purple-100 text-purple-900";
      default:
        return "bg-slate-100 text-slate-900";
    }
  };

  const getRoleLabel = () => {
    return userRole.charAt(0).toUpperCase() + userRole.slice(1);
  };

  return (
    <nav className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-sm">
      <div className="px-6 md:px-8 py-4">
        <div className="flex items-center justify-between">
          {/* Left Section: Logo & Menu Toggle */}
          <div className="flex items-center gap-4">
            {/* Menu Toggle for Mobile */}
            <button
              onClick={onMenuToggle}
              className="md:hidden p-2 hover:bg-slate-100 rounded-lg transition"
              aria-label="Toggle menu"
            >
              <svg
                className="w-6 h-6 text-slate-700"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>

            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-linear-to-br from-cyan-600 to-emerald-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">H</span>
              </div>
              <div className="hidden sm:block">
                <h1 className="text-lg font-bold text-slate-900">Healthcare</h1>
                <p className="text-xs text-slate-600">Microservices</p>
              </div>
            </div>
          </div>

          {/* Right Section: Notifications, User Menu */}
          <div className="flex items-center gap-4">
            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 hover:bg-slate-100 rounded-lg transition"
                aria-label="Notifications"
              >
                <svg
                  className="w-6 h-6 text-slate-700"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                  />
                </svg>
                <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full"></span>
              </button>

              {/* Notifications Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-slate-200 overflow-hidden">
                  <div className="p-4 border-b border-slate-200 bg-slate-50">
                    <h3 className="font-bold text-slate-900">Notifications</h3>
                  </div>

                  {notifications.length === 0 ? (
                    <div className="p-4 text-center text-slate-600">
                      No new notifications
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-200">
                      {notifications.map((notif) => (
                        <div
                          key={notif.id}
                          className="p-4 hover:bg-slate-50 transition cursor-pointer"
                        >
                          <p className="text-sm font-semibold text-slate-900">
                            {notif.message}
                          </p>
                          <p className="text-xs text-slate-600 mt-1">
                            {notif.time}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="p-4 border-t border-slate-200 bg-slate-50 text-center">
                    <button className="text-sm font-semibold text-cyan-600 hover:text-cyan-700">
                      View All
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-3 p-2 hover:bg-slate-100 rounded-lg transition"
              >
                {/* Avatar */}
                <div className="w-8 h-8 bg-linear-to-br from-cyan-400 to-emerald-400 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm">
                    {user?.name?.charAt(0) || "U"}
                  </span>
                </div>

                {/* User Info */}
                <div className="hidden sm:block text-left">
                  <p className="text-sm font-semibold text-slate-900">
                    {user?.name || "User"}
                  </p>
                  <p className="text-xs text-slate-600">
                    {user?.email || "user@example.com"}
                  </p>
                </div>

                {/* Chevron */}
                <svg
                  className={`w-4 h-4 text-slate-700 transition ${
                    showUserMenu ? "rotate-180" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 14l-7 7m0 0l-7-7m7 7V3"
                  />
                </svg>
              </button>

              {/* User Dropdown Menu */}
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-slate-200 overflow-hidden">
                  {/* User Info Card */}
                  <div className="p-4 bg-slate-50 border-b border-slate-200">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 bg-linear-to-br from-cyan-400 to-emerald-400 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-lg">
                          {user?.name?.charAt(0) || "U"}
                        </span>
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">
                          {user?.name || "User"}
                        </p>
                        <span
                          className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${getRoleBadgeColor()}`}
                        >
                          {getRoleLabel()}
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-slate-600 wrap-break-word">
                      {user?.email || "user@example.com"}
                    </p>
                  </div>

                  {/* Menu Items */}
                  <div className="divide-y divide-slate-200">
                    <button className="w-full text-left px-4 py-3 hover:bg-slate-50 transition flex items-center gap-3">
                      <svg
                        className="w-5 h-5 text-slate-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M10 6H5a2 2 0 00-2 2v10a2 2 0 002 2h5m0 0h5a2 2 0 002-2V8a2 2 0 00-2-2h-5m0 0V5a2 2 0 10-4 0v1m4 0a2 2 0 10-4 0m0 0V8m0 0H9m4 0h4m0 0V5m0 0a2 2 0 10-4 0v1m4 0a2 2 0 10-4 0"
                        />
                      </svg>
                      <span className="text-sm font-semibold text-slate-900">
                        Account Settings
                      </span>
                    </button>

                    <button className="w-full text-left px-4 py-3 hover:bg-slate-50 transition flex items-center gap-3">
                      <svg
                        className="w-5 h-5 text-slate-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z"
                        />
                      </svg>
                      <span className="text-sm font-semibold text-slate-900">
                        Help & Support
                      </span>
                    </button>

                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-3 hover:bg-red-50 transition flex items-center gap-3 text-red-600"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                        />
                      </svg>
                      <span className="text-sm font-semibold">Logout</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
