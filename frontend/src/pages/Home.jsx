import { useContext } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

function Home() {
  const { user } = useContext(AuthContext);
  const role = user?.role || "patient";

  const roleConfig = {
    patient: {
      eyebrow: "Patient Workspace",
      title: "Your Care Journey Starts Here",
      subtitle: "Track records, manage appointments, and keep your health profile up to date.",
      badge: "Patient",
      tips: [
        "Complete your profile to receive faster doctor recommendations.",
        "Use reports to keep all your medical history in one place.",
      ],
      stats: [
        { label: "Profile Status", value: "Ready" },
        { label: "Reports", value: "Track here" },
        { label: "Appointments", value: "Plan now" },
      ],
      quickActions: [
        { label: "Update My Profile", to: "/patient/profile" },
        { label: "View My Reports", to: "/patient/reports" },
        { label: "Book Appointment", to: "/appointment/book" },
      ],
    },
    doctor: {
      eyebrow: "Provider Workspace",
      title: "Manage Patients With Confidence",
      subtitle: "Handle your availability, consultations, and prescriptions from one dashboard.",
      badge: "Doctor",
      tips: [
        "Keep your availability current so patients can book accurate slots.",
        "Review your dashboard daily to prioritize urgent follow-ups.",
      ],
      stats: [
        { label: "Consultation Queue", value: "Live" },
        { label: "Availability", value: "Manage" },
        { label: "Prescriptions", value: "Ready" },
      ],
      quickActions: [
        { label: "Doctor Dashboard", to: "/doctor/dashboard" },
        { label: "Manage Availability", to: "/doctor/availability" },
        { label: "My Profile", to: "/doctor/profile" },
      ],
    },
    admin: {
      eyebrow: "Admin Workspace",
      title: "Monitor Platform Operations",
      subtitle: "Oversee users, appointments, and doctor verifications from your control panel.",
      badge: "Admin",
      tips: [
        "Review doctor verification queue regularly to reduce onboarding delays.",
        "Use user management tools to resolve access issues quickly.",
      ],
      stats: [
        { label: "Platform Health", value: "Good" },
        { label: "Users", value: "Monitor" },
        { label: "Verifications", value: "Pending" },
      ],
      quickActions: [
        { label: "Admin Dashboard", to: "/admin/dashboard" },
        { label: "User Management", to: "/admin/users" },
        { label: "Doctor Verification", to: "/admin/verify-doctors" },
      ],
    },
  };

  const currentRole = roleConfig[role] || roleConfig.patient;
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good Morning" : hour < 18 ? "Good Afternoon" : "Good Evening";

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700&family=DM+Mono:wght@400;500&display=swap');

        .hm-root {
          font-family: 'Plus Jakarta Sans', sans-serif;
          display: grid;
          gap: 16px;
        }

        .hm-hero {
          position: relative;
          overflow: hidden;
          border-radius: 24px;
          border: 1px solid rgba(20, 184, 166, 0.18);
          background: linear-gradient(145deg, rgba(255,255,255,0.9) 0%, rgba(240,253,250,0.92) 56%, rgba(224,242,254,0.9) 100%);
          box-shadow: 0 2px 4px rgba(0,0,0,0.03), 0 18px 40px rgba(13,148,136,0.12);
          padding: 24px;
          animation: hmFadeUp .45s ease both;
        }

        .hm-hero::before {
          content: '';
          position: absolute;
          inset: 0;
          background-image: radial-gradient(circle, rgba(20,184,166,0.12) 1px, transparent 1px);
          background-size: 24px 24px;
          opacity: 0.55;
          pointer-events: none;
        }

        .hm-hero-top,
        .hm-hero-bottom {
          position: relative;
          z-index: 1;
        }

        .hm-eyebrow {
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: #0d9488;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 10px;
        }

        .hm-eyebrow::before {
          content: '';
          width: 18px;
          height: 2px;
          border-radius: 2px;
          background: #0d9488;
        }

        .hm-title {
          color: #0f172a;
          font-size: clamp(22px, 2.8vw, 32px);
          line-height: 1.2;
          letter-spacing: -0.03em;
          margin: 0;
        }

        .hm-subtitle {
          color: #64748b;
          font-size: 14px;
          line-height: 1.6;
          margin: 10px 0 0;
          max-width: 720px;
        }

        .hm-hero-bottom {
          margin-top: 18px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 10px;
        }

        .hm-user {
          color: #334155;
          font-size: 14px;
        }

        .hm-user strong {
          color: #0f172a;
        }

        .hm-badge {
          display: inline-flex;
          align-items: center;
          padding: 6px 12px;
          border-radius: 999px;
          border: 1px solid rgba(20,184,166,0.24);
          background: rgba(255,255,255,0.8);
          color: #0d9488;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.04em;
          text-transform: uppercase;
        }

        .hm-grid {
          display: grid;
          grid-template-columns: 1.5fr 1fr;
          gap: 16px;
          animation: hmFadeUp .45s ease .06s both;
        }

        .hm-card {
          border-radius: 20px;
          border: 1px solid rgba(20,184,166,0.16);
          background: rgba(255,255,255,0.85);
          backdrop-filter: blur(10px);
          box-shadow: 0 10px 30px rgba(13,148,136,0.08), 0 0 0 1px rgba(255,255,255,0.9) inset;
          padding: 18px;
        }

        .hm-card-title {
          font-size: 12px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.09em;
          color: #0d9488;
          margin: 0 0 12px;
        }

        .hm-stats {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 10px;
        }

        .hm-stat {
          border-radius: 14px;
          border: 1px solid #e2e8f0;
          background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
          padding: 12px;
        }

        .hm-stat-label {
          color: #64748b;
          font-size: 12px;
          margin: 0;
        }

        .hm-stat-value {
          color: #0f172a;
          margin: 6px 0 0;
          font-size: 20px;
          font-weight: 700;
          letter-spacing: -0.03em;
        }

        .hm-tip-list {
          display: grid;
          gap: 10px;
        }

        .hm-tip {
          border-radius: 12px;
          border: 1px solid #dbeafe;
          background: #f0fdfa;
          color: #0f766e;
          font-size: 13px;
          line-height: 1.5;
          padding: 10px 12px;
          display: flex;
          gap: 8px;
          align-items: flex-start;
        }

        .hm-tip-dot {
          width: 8px;
          height: 8px;
          border-radius: 999px;
          background: #14b8a6;
          margin-top: 6px;
          flex-shrink: 0;
        }

        .hm-actions {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 10px;
          animation: hmFadeUp .45s ease .12s both;
        }

        .hm-action {
          border-radius: 14px;
          border: 1px solid rgba(20,184,166,0.2);
          background: linear-gradient(135deg, #0d9488 0%, #0891b2 100%);
          color: #ffffff;
          text-decoration: none;
          font-size: 13px;
          font-weight: 600;
          letter-spacing: 0.01em;
          padding: 12px 14px;
          transition: transform 0.15s ease, box-shadow 0.2s ease, filter 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
        }

        .hm-action:hover {
          transform: translateY(-1px);
          box-shadow: 0 8px 24px rgba(13,148,136,0.3);
          filter: brightness(1.03);
        }

        .hm-action-arrow {
          font-family: 'DM Mono', monospace;
          font-size: 12px;
          opacity: 0.85;
        }

        @keyframes hmFadeUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @media (max-width: 1080px) {
          .hm-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 780px) {
          .hm-hero {
            padding: 18px;
          }

          .hm-stats,
          .hm-actions {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <section className="hm-root">
        <article className="hm-hero">
          <div className="hm-hero-top">
            <p className="hm-eyebrow">{currentRole.eyebrow}</p>
            <h1 className="hm-title">{greeting}, {user?.name || "User"}</h1>
            <p className="hm-subtitle">{currentRole.subtitle}</p>
          </div>

          <div className="hm-hero-bottom">
            <p className="hm-user">
              Active role: <strong>{currentRole.badge}</strong>
            </p>
            <span className="hm-badge">Home Command Center</span>
          </div>
        </article>

        <div className="hm-grid">
          <article className="hm-card">
            <h2 className="hm-card-title">Live Overview</h2>
            <div className="hm-stats">
              {currentRole.stats.map((item) => (
                <div key={item.label} className="hm-stat">
                  <p className="hm-stat-label">{item.label}</p>
                  <p className="hm-stat-value">{item.value}</p>
                </div>
              ))}
            </div>
          </article>

          <article className="hm-card">
            <h2 className="hm-card-title">Today Tips</h2>
            <div className="hm-tip-list">
              {currentRole.tips.map((tip) => (
                <div key={tip} className="hm-tip">
                  <span className="hm-tip-dot" />
                  <span>{tip}</span>
                </div>
              ))}
            </div>
          </article>
        </div>

        <article className="hm-card">
          <h2 className="hm-card-title">Quick Actions</h2>
          <div className="hm-actions">
            {currentRole.quickActions.map((item) => (
              <Link key={item.to} to={item.to} className="hm-action">
                <span>{item.label}</span>
                <span className="hm-action-arrow">-&gt;</span>
              </Link>
            ))}
          </div>
        </article>
      </section>
    </>
  );
}

export default Home;
