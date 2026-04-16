/**
 * DashboardLayout Component
 */

import { useState } from "react";
import { Navbar } from "./Navbar";
import { Sidebar } from "./Sidebar";

export const DashboardLayout = ({ children, userRole = "doctor" }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navbar */}
      <Navbar
        userRole={userRole}
        onMenuToggle={() => setMobileMenuOpen(!mobileMenuOpen)}
      />

      <div className="flex">
        {/* Sidebar */}
        <Sidebar
          userRole={userRole}
          isMobileMenuOpen={mobileMenuOpen}
          onClose={() => setMobileMenuOpen(false)}
        />

        {/* Main Content Area */}
        <main className="flex-1 transition-all duration-300">
          {/* Content Container */}
          <div className="p-6 md:p-8">{children}</div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
