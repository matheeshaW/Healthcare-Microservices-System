/**
 * Sidebar Component
 * Left navigation sidebar with role-based menu items
 * Responsive design for desktop and mobile
 */

import { useContext } from "react";
import { Link, useLocation } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";

export function Sidebar({
  userRole = "doctor",
  isMobileMenuOpen = false,
  onClose,
}) {
  const { user } = useContext(AuthContext);
  const location = useLocation();

  // ============================================
  // MENU ITEMS BY ROLE
  // ============================================

  const getMenuItems = () => {
    const doctorMenu = [
      {
        label: "Home",
        icon: "grid",
        path: "/home",
        badge: null,
      },
      {
        label: "Dashboard",
        icon: "grid",
        path: "/doctor/dashboard",
        badge: null,
      },
      {
        label: "My Profile",
        icon: "user",
        path: "/doctor/profile",
        badge: null,
      },
      {
        label: "Manage Availability",
        icon: "calendar",
        path: "/doctor/availability",
        badge: null,
      },
      {
        label: "My Prescriptions",
        icon: "document",
        path: "/doctor/prescriptions",
        badge: null,
      },
      { label: "Telemedicine", icon: "video", path: "/telemedicine", badge: "New" },
    ];

    const patientMenu = [
      { label: "Home", icon: "grid", path: "/home", badge: null },

      {
        label: "Patient Dashboard",
        icon: "grid",
        path: "/patient/dashboard",
        badge: null,
      },
      {
        label: "My Profile",
        icon: "user",
        path: "/patient/profile",
        badge: null,
      },
      {
        label: "My Appointments",
        icon: "clock",
        path: "/appointment/my",
        badge: null,
      },
      {
        label: "Book Appointment",
        icon: "calendar",
        path: "/appointment/book",
        badge: null,
      },
      {
        label: "My Reports",
        icon: "document",
        path: "/patient/reports",
        badge: null,
      },
      {
        label: "My Prescriptions",
        icon: "pill",
        path: "/patient/prescriptions",
        badge: null,
      },
      { label: "Telemedicine", icon: "video", path: "/telemedicine", badge: null }, 
    ];

    const adminMenu = [
      {
        label: "Home",
        icon: "grid",
        path: "/home",
        badge: null,
      },
      {
        label: "Dashboard",
        icon: "grid",
        path: "/admin/dashboard",
        badge: null,
      },
      { label: "Users", icon: "users", path: "/admin/users", badge: "3" },
      { label: "Doctors", icon: "user", path: "/admin/doctors", badge: null },
      {
        label: "Verify Doctors",
        icon: "check",
        path: "/admin/verify-doctors",
        badge: "7",
      },
      {
        label: "Appointments",
        icon: "clock",
        path: "/admin/appointments",
        badge: null,
      },
      { label: "Reports", icon: "chart", path: "/admin/reports", badge: null },
    ];

    if (user?.role === "doctor") return doctorMenu;
    if (user?.role === "patient") return patientMenu;
    if (user?.role === "admin") return adminMenu;
    return doctorMenu;
  };

  // ============================================
  // ICON RENDERING
  // ============================================

  const renderIcon = (iconType) => {
    const iconClass = "w-5 h-5";
    const icons = {
      grid: (
        <svg
          className={iconClass}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zM14 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z"
          />
        </svg>
      ),
      user: (
        <svg
          className={iconClass}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
          />
        </svg>
      ),
      calendar: (
        <svg
          className={iconClass}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      ),
      clock: (
        <svg
          className={iconClass}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
      document: (
        <svg
          className={iconClass}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
      ),
      users: (
        <svg
          className={iconClass}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 4.354a4 4 0 110 8.646 4 4 0 010-8.646zM12 14.354a4 4 0 110 8.646 4 4 0 010-8.646z"
          />
        </svg>
      ),
      search: (
        <svg
          className={iconClass}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      ),
      pill: (
        <svg
          className={iconClass}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
          />
        </svg>
      ),
      check: (
        <svg
          className={iconClass}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
      chart: (
        <svg
          className={iconClass}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
          />
        </svg>
      ),
      video: (
        <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      ),
    };
    return icons[iconType] || icons.grid;
  };

  // ============================================
  // GET MENU ITEMS
  // ============================================

  const menuItems = getMenuItems();

  // ============================================
  // DETERMINE ACTIVE STATE
  // ============================================

  const getIsActive = (path) => {
    if (path === "/appointment/my") {
      return (
        location.pathname === "/appointment/my" ||
        /^\/appointment\/[^/]+$/.test(location.pathname)
      );
    }

    return location.pathname === path;
  };

  // ============================================
  // RENDER
  // ============================================

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={onClose}
        ></div>
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed md:sticky top-16 left-0 h-[calc(100vh-4rem)]
          w-64 bg-white border-r border-slate-200
          overflow-y-auto transition-transform duration-300 z-40
          ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        `}
      >
        {/* Sidebar Header */}
        <div className="p-6 border-b border-slate-200">
          <h3 className="text-lg font-bold text-slate-900">
            {user?.role === "doctor" && "Doctor Portal"}
            {user?.role === "patient" && "Patient Portal"}
            {user?.role === "admin" && "Admin Portal"}
          </h3>
          <p className="text-xs text-slate-600 mt-1">{user?.name || "User"}</p>
        </div>

        {/* Menu Items */}
        <div className="p-4 space-y-2">
          {menuItems.map((item, index) => (
            <Link
              key={index}
              to={item.path}
              onClick={() => {
                onClose?.();
              }}
              className={`
                flex items-center gap-3 px-4 py-3 rounded-lg
                font-semibold transition duration-200
                ${
                  getIsActive(item.path)
                    ? "bg-cyan-600 text-white"
                    : "text-slate-700 hover:bg-slate-100"
                }
              `}
            >
              <span className="shrink-0">{renderIcon(item.icon)}</span>
              <span className="flex-1">{item.label}</span>
              {item.badge && (
                <span
                  className={`
                    inline-flex items-center justify-center
                    min-w-6 h-6 px-2 rounded-full
                    text-xs font-bold
                    ${
                      getIsActive(item.path)
                        ? "bg-white text-cyan-600"
                        : "bg-red-100 text-red-600"
                    }
                  `}
                >
                  {item.badge}
                </span>
              )}
            </Link>
          ))}
        </div>
      </aside>
    </>
  );
}