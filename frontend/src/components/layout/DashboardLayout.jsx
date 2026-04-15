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

          {/* Footer */}
          <footer className="bg-white border-t border-slate-200 px-6 md:px-8 py-6 mt-12">
            <div className="max-w-7xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
                {/* About */}
                <div>
                  <h4 className="font-bold text-slate-900 mb-3">
                    Healthcare System
                  </h4>
                  <p className="text-sm text-slate-600">
                    Comprehensive healthcare solution for patients and doctors.
                  </p>
                </div>

                {/* Quick Links */}
                <div>
                  <h4 className="font-bold text-slate-900 mb-3">Quick Links</h4>
                  <ul className="space-y-2">
                    <li>
                      <a
                        href="#"
                        className="text-sm text-slate-600 hover:text-cyan-600"
                      >
                        Documentation
                      </a>
                    </li>
                    <li>
                      <a
                        href="#"
                        className="text-sm text-slate-600 hover:text-cyan-600"
                      >
                        FAQ
                      </a>
                    </li>
                    <li>
                      <a
                        href="#"
                        className="text-sm text-slate-600 hover:text-cyan-600"
                      >
                        Support
                      </a>
                    </li>
                  </ul>
                </div>

                {/* Legal */}
                <div>
                  <h4 className="font-bold text-slate-900 mb-3">Legal</h4>
                  <ul className="space-y-2">
                    <li>
                      <a
                        href="#"
                        className="text-sm text-slate-600 hover:text-cyan-600"
                      >
                        Privacy Policy
                      </a>
                    </li>
                    <li>
                      <a
                        href="#"
                        className="text-sm text-slate-600 hover:text-cyan-600"
                      >
                        Terms of Service
                      </a>
                    </li>
                    <li>
                      <a
                        href="#"
                        className="text-sm text-slate-600 hover:text-cyan-600"
                      >
                        Cookie Policy
                      </a>
                    </li>
                  </ul>
                </div>

                {/* Contact */}
                <div>
                  <h4 className="font-bold text-slate-900 mb-3">Contact</h4>
                  <p className="text-sm text-slate-600">
                    Email: support@healthcare.com
                  </p>
                  <p className="text-sm text-slate-600">
                    Phone: +94 (77) 123-4567
                  </p>
                </div>
              </div>

              {/* Copyright */}
              <div className="border-t border-slate-200 pt-6 text-center">
                <p className="text-sm text-slate-600">
                  © 2024 Healthcare Microservices System. All rights reserved.
                </p>
              </div>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
