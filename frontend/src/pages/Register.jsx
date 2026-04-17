import { useState, useContext, useEffect, useRef } from "react";
import { AuthContext } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { getSpecializations, registerDoctor } from "../api/doctor.api";

/* ── Same background as Login ── */
function HealthBg() {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let id;
    let W, H;
    const items = [];
    const ICONS = ["✚", "○", "◯", "＋", "·"];

    function resize() {
      W = canvas.width  = window.innerWidth;
      H = canvas.height = window.innerHeight;
    }
    function init() {
      items.length = 0;
      for (let i = 0; i < 22; i++) {
        items.push({
          x: Math.random() * W, y: Math.random() * H,
          vx: (Math.random()-.5)*.22, vy: (Math.random()-.5)*.22,
          size: 10+Math.random()*14,
          alpha: .04+Math.random()*.07,
          icon: ICONS[Math.floor(Math.random()*ICONS.length)],
          spin: (Math.random()-.5)*.008,
          angle: Math.random()*Math.PI*2,
        });
      }
    }
    let t = 0;
    function draw() {
      ctx.clearRect(0,0,W,H);
      const bg = ctx.createLinearGradient(0,0,W,H);
      bg.addColorStop(0,"#edfaf8"); bg.addColorStop(.5,"#f7fffe"); bg.addColorStop(1,"#e8f8f5");
      ctx.fillStyle=bg; ctx.fillRect(0,0,W,H);
      const o1=ctx.createRadialGradient(W*.1,H*.2,0,W*.1,H*.2,320);
      o1.addColorStop(0,"rgba(20,184,166,.10)"); o1.addColorStop(1,"transparent");
      ctx.fillStyle=o1; ctx.fillRect(0,0,W,H);
      const o2=ctx.createRadialGradient(W*.9,H*.8,0,W*.9,H*.8,260);
      o2.addColorStop(0,"rgba(6,182,212,.08)"); o2.addColorStop(1,"transparent");
      ctx.fillStyle=o2; ctx.fillRect(0,0,W,H);
      items.forEach(it=>{
        it.x+=it.vx; it.y+=it.vy; it.angle+=it.spin;
        if(it.x<-30)it.x=W+20; if(it.x>W+30)it.x=-20;
        if(it.y<-30)it.y=H+20; if(it.y>H+30)it.y=-20;
        ctx.save(); ctx.translate(it.x,it.y); ctx.rotate(it.angle);
        ctx.globalAlpha=it.alpha; ctx.fillStyle="#0d9488";
        ctx.font=`${it.size}px sans-serif`; ctx.textAlign="center"; ctx.textBaseline="middle";
        ctx.fillText(it.icon,0,0); ctx.restore();
      });
      ctx.globalAlpha=1;
      const wave=Math.sin(t*.0005)*.5+.5;
      const scanY=wave*H;
      const sg=ctx.createLinearGradient(0,scanY-80,0,scanY+80);
      sg.addColorStop(0,"transparent"); sg.addColorStop(.5,"rgba(20,184,166,.025)"); sg.addColorStop(1,"transparent");
      ctx.fillStyle=sg; ctx.fillRect(0,scanY-80,W,160);
      t+=16; id=requestAnimationFrame(draw);
    }
    resize(); init(); draw();
    const onR=()=>{resize();init();};
    window.addEventListener("resize",onR);
    return ()=>{cancelAnimationFrame(id);window.removeEventListener("resize",onR);};
  },[]);
  return <canvas ref={canvasRef} style={{position:"fixed",inset:0,width:"100%",height:"100%",zIndex:0}}/>;
}

/* ── Register Form Illustration (side panel) ── */
function RegisterIllustration() {
  return (
    <svg viewBox="0 0 280 260" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width:"100%", maxWidth:260 }}>
      <circle cx="140" cy="130" r="100" fill="#ccfbf1" opacity="0.45"/>

      {/* Clipboard / medical form */}
      <rect x="80" y="55" width="120" height="150" rx="10" fill="white"/>
      <rect x="80" y="55" width="120" height="150" rx="10" fill="none" stroke="#e2e8f0" strokeWidth="1.5"/>
      <rect x="110" y="47" width="60" height="18" rx="6" fill="#14b8a6"/>
      <rect x="120" y="51" width="40" height="10" rx="4" fill="#0d9488"/>

      {/* Cross on clipboard top */}
      <rect x="133" y="53" width="14" height="4" rx="2" fill="white"/>
      <rect x="138" y="48" width="4" height="14" rx="2" fill="white"/>

      {/* Form lines */}
      <rect x="95" y="82" width="90" height="3" rx="1.5" fill="#f1f5f9"/>
      <rect x="95" y="82" width="55" height="3" rx="1.5" fill="#14b8a6"/>

      <rect x="95" y="94" width="70" height="3" rx="1.5" fill="#f1f5f9"/>
      <rect x="95" y="94" width="40" height="3" rx="1.5" fill="#14b8a6"/>

      <rect x="95" y="106" width="90" height="3" rx="1.5" fill="#f1f5f9"/>
      <rect x="95" y="106" width="70" height="3" rx="1.5" fill="#14b8a6"/>

      {/* Divider */}
      <line x1="95" y1="120" x2="185" y2="120" stroke="#e2e8f0" strokeWidth="1" strokeDasharray="4 3"/>

      {/* Doctor section label */}
      <rect x="95" y="128" width="28" height="12" rx="4" fill="#ccfbf1"/>
      <rect x="97" y="130" width="24" height="8" rx="3" fill="none" stroke="#14b8a6" strokeWidth="1"/>
      <text x="109" y="137" fontSize="6" fill="#0d9488" textAnchor="middle" fontWeight="bold">Dr</text>

      <rect x="95" y="147" width="90" height="3" rx="1.5" fill="#f1f5f9"/>
      <rect x="95" y="147" width="50" height="3" rx="1.5" fill="#5eead4"/>

      <rect x="95" y="159" width="40" height="3" rx="1.5" fill="#f1f5f9"/>
      <rect x="95" y="159" width="25" height="3" rx="1.5" fill="#5eead4"/>

      <rect x="142" y="159" width="43" height="3" rx="1.5" fill="#f1f5f9"/>
      <rect x="142" y="159" width="30" height="3" rx="1.5" fill="#5eead4"/>

      <rect x="95" y="171" width="90" height="3" rx="1.5" fill="#f1f5f9"/>
      <rect x="95" y="171" width="60" height="3" rx="1.5" fill="#5eead4"/>

      {/* Submit button */}
      <rect x="95" y="185" width="90" height="12" rx="6" fill="#0d9488"/>
      <rect x="115" y="189" width="50" height="4" rx="2" fill="rgba(255,255,255,0.4)"/>

      {/* Check circle (verified) */}
      <circle cx="195" cy="75" r="18" fill="#dcfce7"/>
      <circle cx="195" cy="75" r="18" fill="none" stroke="#22c55e" strokeWidth="1.5"/>
      <path d="M187 75 L192 81 L203 69" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>

      {/* Stethoscope icon */}
      <circle cx="82" cy="185" r="16" fill="#f0fdfa"/>
      <circle cx="82" cy="185" r="16" fill="none" stroke="#99f6e4" strokeWidth="1.5"/>
      <path d="M76 180 Q76 190 82 192 Q88 190 88 180" stroke="#0d9488" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
      <line x1="82" y1="180" x2="82" y2="176" stroke="#0d9488" strokeWidth="1.5" strokeLinecap="round"/>
      <circle cx="82" cy="174" r="3" fill="#14b8a6"/>
      <circle cx="76" cy="180" r="2" fill="#14b8a6"/>
      <circle cx="88" cy="180" r="2" fill="#14b8a6"/>

      {/* Person icon top right */}
      <circle cx="210" cy="130" r="14" fill="#e0f2fe"/>
      <circle cx="210" cy="130" r="14" fill="none" stroke="#bae6fd" strokeWidth="1.5"/>
      <circle cx="210" cy="126" r="5" fill="#0891b2"/>
      <path d="M201 140 Q205 135 210 135 Q215 135 219 140" stroke="#0891b2" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
    </svg>
  );
}

/* ── Register Component ── */
function Register() {
  const [role, setRole] = useState("patient");
  const [form, setForm] = useState({
    name:"", email:"", password:"",
    specialization:"", experience:"",
    hospital:"", licenseNumber:"", phoneNumber:"",
  });
  const [message, setMessage] = useState("");
  const [error, setError]     = useState("");
  const [showPass, setShowPass] = useState(false);

  const { register } = useContext(AuthContext);
  const navigate     = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleRoleChange = (e) => {
    setRole(e.target.value);
    setMessage(""); setError("");
  };

  const handleRegister = async () => {
    try {
      setError(""); setMessage("");
      const registrationData = { name:form.name, email:form.email, password:form.password, role };

      if (role === "doctor") {
        registrationData.specialization = form.specialization;
        registrationData.experience     = form.experience ? parseInt(form.experience) : null;
        registrationData.hospital       = form.hospital;
        registrationData.licenseNumber  = form.licenseNumber;
        registrationData.phoneNumber    = form.phoneNumber;
        if (!form.specialization||!form.experience||!form.hospital||!form.licenseNumber||!form.phoneNumber) {
          alert("Please fill all doctor fields"); return;
        }
      }

      const response = await register(registrationData);

      if (role === "doctor") {
        try {
          await registerDoctor({
            userId: response.user._id, email:form.email, name:form.name,
            specialization:form.specialization, experience:parseInt(form.experience),
            hospital:form.hospital, licenseNumber:form.licenseNumber, phoneNumber:form.phoneNumber,
          });
          setMessage("✓ Registration successful! Your profile has been sent to admin for verification. You'll be able to login once verified.");
          setForm({ name:"",email:"",password:"",specialization:"",experience:"",hospital:"",licenseNumber:"",phoneNumber:"" });
          setTimeout(() => navigate("/"), 3000);
        } catch (doctorError) {
          console.error("Doctor profile creation failed:", doctorError);
          setMessage("User created but doctor profile creation failed. Please contact admin.");
        }
      } else {
        alert("Registered successfully!");
        navigate("/");
      }
    } catch (err) {
      setMessage("");
      const errorMessage = err?.response?.data?.message || err?.response?.data?.error || "Registration failed";
      if (errorMessage.toLowerCase().includes("email")||errorMessage.toLowerCase().includes("duplicate")||errorMessage.toLowerCase().includes("already")) {
        setError("Email already exists");
      } else {
        setError(errorMessage);
      }
    }
  };

  const isDoctor = role === "doctor";

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700&family=DM+Mono:wght@400;500&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin:0; padding:0; }

        .hr-root {
          min-height: 100vh;
          display: flex; align-items: center; justify-content: center;
          padding: 24px 16px;
          font-family: 'Plus Jakarta Sans', sans-serif;
          position: relative; overflow: hidden;
        }

        .hr-card {
          position: relative; z-index:1;
          width:100%; max-width: 980px;
          display: flex;
          border-radius: 24px;
          overflow: hidden;
          background: rgba(255,255,255,0.82);
          border: 1px solid rgba(20,184,166,0.15);
          box-shadow:
            0 2px 4px rgba(0,0,0,0.04),
            0 20px 60px rgba(13,148,136,0.12),
            0 0 0 1px rgba(255,255,255,0.8) inset;
          backdrop-filter: blur(20px);
          animation: slideUp .55s cubic-bezier(0.22,1,0.36,1) both;
        }

        @keyframes slideUp {
          from { opacity:0; transform: translateY(28px) scale(0.97); }
          to   { opacity:1; transform: translateY(0)    scale(1); }
        }

        /* LEFT */
        .hr-left {
          width: 38%; flex-shrink:0;
          background: linear-gradient(155deg, #f0fdfa 0%, #ccfbf1 55%, #99f6e4 100%);
          padding: 44px 32px;
          display: none;
          flex-direction: column;
          align-items: center;
          justify-content: space-between;
          position: relative; overflow: hidden;
        }

        @media (min-width: 860px) { .hr-left { display: flex; } }

        .hr-left::before {
          content:''; position:absolute; inset:0;
          background-image: radial-gradient(circle, rgba(20,184,166,0.10) 1px, transparent 1px);
          background-size: 28px 28px;
          animation: patternDrift 20s linear infinite;
        }

        @keyframes patternDrift {
          from { background-position:0 0; } to { background-position:28px 28px; }
        }

        .hr-left-top { position:relative; z-index:1; text-align:center; }

        .hr-logo-mark {
          display: inline-flex; align-items:center; gap:8px;
          background: white; border:1px solid rgba(20,184,166,0.2);
          border-radius:40px; padding:8px 16px 8px 10px;
          box-shadow:0 2px 12px rgba(13,148,136,0.12);
          margin-bottom:12px;
          animation: popIn .45s cubic-bezier(0.34,1.56,0.64,1) .2s both;
        }

        @keyframes popIn {
          from { opacity:0; transform:scale(0.6); }
          to   { opacity:1; transform:scale(1); }
        }

        .hr-logo-icon {
          width:28px; height:28px; border-radius:50%;
          background: linear-gradient(135deg,#0d9488,#14b8a6);
          display:flex; align-items:center; justify-content:center;
          color:white; font-size:13px; font-weight:700;
        }

        .hr-logo-text { font-size:13px; font-weight:600; color:#0f766e; letter-spacing:-.01em; }

        .hr-illus-title {
          font-size:17px; font-weight:700; color:#0f766e;
          letter-spacing:-.02em; line-height:1.35; margin-bottom:4px;
        }
        .hr-illus-sub { font-size:12px; color:#5eead4; }

        .hr-illus-wrap {
          position:relative; z-index:1;
          animation: floatIllus 5s ease-in-out infinite;
        }
        @keyframes floatIllus {
          0%,100%{transform:translateY(0);} 50%{transform:translateY(-8px);}
        }

        .hr-role-info {
          position:relative; z-index:1; width:100%;
          background:rgba(255,255,255,0.65);
          border:1px solid rgba(20,184,166,0.18);
          border-radius:14px; padding:14px 16px;
          backdrop-filter:blur(8px);
          animation: statIn .45s cubic-bezier(0.22,1,0.36,1) .1s both;
        }
        @keyframes statIn {
          from{opacity:0;transform:translateY(12px);} to{opacity:1;transform:translateY(0);}
        }
        .hr-role-info-title { font-size:11px; font-weight:700; color:#0d9488; text-transform:uppercase; letter-spacing:.08em; margin-bottom:6px; }
        .hr-role-bullet { display:flex; align-items:flex-start; gap:6px; margin-bottom:5px; font-size:11.5px; color:#475569; line-height:1.4; }
        .hr-role-bullet::before { content:'✚'; font-size:9px; color:#14b8a6; margin-top:2px; flex-shrink:0; }

        /* RIGHT */
        .hr-right {
          flex:1;
          padding: 40px 40px;
          display:flex; flex-direction:column; justify-content:center;
          background:rgba(255,255,255,0.6);
          overflow-y: auto;
          max-height: 100vh;
        }

        @media (max-width: 859px) { .hr-right { padding:32px 24px; } }

        .hr-eyebrow {
          font-size:11px; font-weight:600;
          letter-spacing:.12em; text-transform:uppercase;
          color: #0d9488;
          display:flex; align-items:center; gap:8px;
          margin-bottom:8px;
          animation: fadeUp .4s ease both;
        }
        .hr-eyebrow::before {
          content:''; width:18px; height:2px;
          background:#0d9488; border-radius:2px; display:block;
          animation: lineIn .5s ease .15s both; transform-origin:left;
        }
        @keyframes lineIn { from{transform:scaleX(0);} to{transform:scaleX(1);} }

        .hr-h1 {
          font-size:26px; font-weight:700;
          letter-spacing:-.03em; color:#0f172a;
          margin-bottom:5px;
          animation: fadeUp .4s ease .05s both;
        }
        .hr-sub {
          font-size:13px; color:#64748b;
          margin-bottom:22px; line-height:1.6;
          animation: fadeUp .4s ease .1s both;
        }

        @keyframes fadeUp {
          from{opacity:0;transform:translateY(10px);} to{opacity:1;transform:translateY(0);}
        }

        /* Role tabs */
        .hr-role-tabs {
          display:flex; gap:0;
          background:#f1f5f9;
          border-radius:12px; padding:4px;
          margin-bottom:22px;
          animation: fadeUp .4s ease .12s both;
        }

        .hr-role-tab {
          flex:1; padding:9px 14px;
          border-radius:9px;
          border:none; background:none;
          font-family:'Plus Jakarta Sans',sans-serif;
          font-size:13px; font-weight:500;
          color:#64748b; cursor:pointer;
          transition: all .2s;
          display:flex; align-items:center; justify-content:center; gap:6px;
        }

        .hr-role-tab.active {
          background:white;
          color:#0d9488;
          font-weight:600;
          box-shadow:0 1px 6px rgba(0,0,0,0.08), 0 0 0 1px rgba(20,184,166,0.12);
        }

        .hr-role-tab-icon { font-size:14px; }

        .hr-form {
          display:flex; flex-direction:column; gap:12px;
          animation: fadeUp .4s ease .15s both;
        }

        .hr-row { display:grid; grid-template-columns:1fr 1fr; gap:12px; }

        .hr-field { display:flex; flex-direction:column; gap:5px; }
        .hr-field-full { grid-column: span 2; }

        .hr-label {
          font-size:11px; font-weight:600;
          letter-spacing:.08em; text-transform:uppercase;
          color:#94a3b8;
        }

        .hr-input-wrap { position:relative; }

        .hr-input {
          width:100%; padding:10px 13px;
          background:#f8fafc;
          border:1.5px solid #e2e8f0;
          border-radius:11px;
          color:#0f172a;
          font-family:'Plus Jakarta Sans',sans-serif;
          font-size:13.5px; outline:none;
          transition:border-color .18s, box-shadow .18s, background .18s;
        }

        .hr-input::placeholder { color:#cbd5e1; }

        .hr-input:hover { border-color:#99f6e4; background:#f0fdfa; }

        .hr-input:focus {
          border-color:#14b8a6;
          box-shadow:0 0 0 3px rgba(20,184,166,0.14);
          background:#f0fdfa;
        }

        .hr-select {
          appearance:none;
          background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");
          background-repeat:no-repeat;
          background-position:right 11px center;
          padding-right:32px;
          cursor:pointer;
        }

        .hr-input-mono { font-family:'DM Mono',monospace; font-size:12.5px; }

        .hr-pass-toggle {
          position:absolute; right:11px; top:50%; transform:translateY(-50%);
          background:none; border:none; cursor:pointer;
          color:#94a3b8; font-size:10.5px;
          font-family:'DM Mono',monospace;
          text-transform:uppercase; letter-spacing:.04em;
          padding:4px; transition:color .15s;
        }
        .hr-pass-toggle:hover { color:#14b8a6; }

        /* Doctor section */
        .hr-doctor-section {
          border-top:1.5px dashed #e2e8f0;
          padding-top:16px; margin-top:2px;
          animation: fadeUp .35s ease both;
        }

        .hr-section-label {
          display:flex; align-items:center; gap:8px;
          margin-bottom:12px;
        }

        .hr-section-badge {
          display:inline-flex; align-items:center; gap:5px;
          background:linear-gradient(135deg,#f0fdfa,#ccfbf1);
          border:1px solid rgba(20,184,166,0.25);
          border-radius:8px; padding:4px 10px;
          font-size:11px; font-weight:600; color:#0d9488;
          letter-spacing:.05em;
        }

        .hr-section-line { flex:1; height:1px; background:#f1f5f9; }

        .hr-notice {
          display:flex; align-items:flex-start; gap:8px;
          padding:10px 13px;
          background:#fffbeb;
          border:1.5px solid #fde68a;
          border-radius:11px;
          font-size:12px; color:#92400e; line-height:1.5;
        }

        .hr-success {
          display:flex; align-items:flex-start; gap:8px;
          padding:11px 14px;
          background:#f0fdf4;
          border:1.5px solid #bbf7d0;
          border-radius:11px;
          font-size:13px; color:#166534; line-height:1.5;
          animation: fadeUp .25s ease both;
        }

        .hr-error {
          display:flex; align-items:center; gap:8px;
          padding:11px 14px;
          background:#fef2f2;
          border:1.5px solid #fecaca;
          border-radius:11px;
          font-size:13px; color:#dc2626;
          animation: fadeUp .2s ease both;
        }

        .hr-btn {
          width:100%; padding:13px;
          border-radius:12px; border:none;
          background:linear-gradient(135deg,#0d9488 0%,#0891b2 100%);
          color:#fff;
          font-family:'Plus Jakarta Sans',sans-serif;
          font-size:14px; font-weight:600;
          cursor:pointer;
          transition:opacity .18s, transform .12s, box-shadow .18s;
          margin-top:4px;
          position:relative; overflow:hidden;
          letter-spacing:.01em;
        }

        .hr-btn::after {
          content:'';
          position:absolute; inset:0;
          background:linear-gradient(90deg,transparent,rgba(255,255,255,0.12),transparent);
          transform:translateX(-100%);
          transition:transform .55s ease;
        }

        .hr-btn:hover::after { transform:translateX(100%); }
        .hr-btn:hover { transform:translateY(-1px); box-shadow:0 8px 28px rgba(13,148,136,.32); }
        .hr-btn:active { transform:translateY(0); }

        .hr-footer {
          margin-top:18px; font-size:13px; color:#94a3b8;
          text-align:center;
          animation: fadeUp .4s ease .2s both;
        }
        .hr-link { color:#0d9488; text-decoration:none; font-weight:600; transition:color .15s; }
        .hr-link:hover { color:#0f766e; }
      `}</style>

      <HealthBg />

      <div className="hr-root">
        <div className="hr-card">

          {/* LEFT */}
          <section className="hr-left">
            <div className="hr-left-top">
              <div className="hr-logo-mark">
                <div className="hr-logo-icon">✚</div>
                <span className="hr-logo-text">MediCare Platform</span>
              </div>
              <div className="hr-illus-title">Join Our<br/>Care Network</div>
              <div className="hr-illus-sub">Register in minutes</div>
            </div>

            <div className="hr-illus-wrap">
              <RegisterIllustration />
            </div>

            <div className="hr-role-info">
              {isDoctor ? (
                <>
                  <div className="hr-role-info-title">Doctor Registration</div>
                  <div className="hr-role-bullet">Profile sent for admin verification</div>
                  <div className="hr-role-bullet">Manage appointments & prescriptions</div>
                  <div className="hr-role-bullet">Set your availability schedule</div>
                  <div className="hr-role-bullet">Telemedicine sessions supported</div>
                </>
              ) : (
                <>
                  <div className="hr-role-info-title">Patient Registration</div>
                  <div className="hr-role-bullet">Book appointments instantly</div>
                  <div className="hr-role-bullet">View medical reports & history</div>
                  <div className="hr-role-bullet">Real-time appointment updates</div>
                  <div className="hr-role-bullet">Secure payment & billing</div>
                </>
              )}
            </div>
          </section>

          {/* RIGHT */}
          <section className="hr-right">
            <div className="hr-eyebrow">
              {isDoctor ? "Healthcare Provider" : "New Patient"}
            </div>
            <h1 className="hr-h1">Create Account</h1>
            <p className="hr-sub">
              {isDoctor
                ? "Register as a healthcare provider to manage your practice."
                : "Start managing your healthcare profile today."}
            </p>

            {/* Role toggle tabs */}
            <div className="hr-role-tabs">
              <button
                className={`hr-role-tab ${role==="patient"?"active":""}`}
                onClick={() => { setRole("patient"); setMessage(""); setError(""); }}
              >
                <span className="hr-role-tab-icon">👤</span> Patient
              </button>
              <button
                className={`hr-role-tab ${role==="doctor"?"active":""}`}
                onClick={() => { setRole("doctor"); setMessage(""); setError(""); }}
              >
                <span className="hr-role-tab-icon">🩺</span> Doctor
              </button>
            </div>

            <div className="hr-form">

              {/* Alerts */}
              {message && (
                <div className="hr-success">
                  <span style={{fontSize:15,lineHeight:1.2,flexShrink:0}}>✓</span>
                  <span>{message}</span>
                </div>
              )}
              {error && (
                <div className="hr-error">
                  <span style={{fontSize:15,lineHeight:1}}>✕</span>
                  <span>{error}</span>
                </div>
              )}

              {/* Basic fields */}
              <div className="hr-field">
                <label className="hr-label">Full Name</label>
                <input
                  name="name" placeholder="Dr. / Mr. / Ms. Your Name"
                  value={form.name} onChange={handleChange}
                  className="hr-input"
                />
              </div>

              <div className="hr-row">
                <div className="hr-field hr-field-full">
                  <label className="hr-label">Email Address</label>
                  <input
                    name="email" placeholder="you@hospital.com"
                    value={form.email} onChange={handleChange}
                    className="hr-input hr-input-mono"
                  />
                </div>
              </div>

              <div className="hr-field">
                <label className="hr-label">Password</label>
                <div className="hr-input-wrap">
                  <input
                    name="password"
                    type={showPass ? "text" : "password"}
                    placeholder="Create a strong password"
                    value={form.password} onChange={handleChange}
                    className="hr-input"
                    style={{ paddingRight: 50 }}
                  />
                  <button
                    type="button" className="hr-pass-toggle"
                    onClick={() => setShowPass(v=>!v)}
                  >
                    {showPass ? "hide" : "show"}
                  </button>
                </div>
              </div>

              {/* Doctor fields */}
              {isDoctor && (
                <div className="hr-doctor-section">
                  <div className="hr-section-label">
                    <div className="hr-section-badge">🩺 Doctor Details</div>
                    <div className="hr-section-line" />
                  </div>

                  <div className="hr-row" style={{marginBottom:12}}>
                    <div className="hr-field">
                      <label className="hr-label">Specialization</label>
                      <select
                        name="specialization"
                        value={form.specialization} onChange={handleChange}
                        className="hr-input hr-select"
                      >
                        <option value="">Select specialization</option>
                        {getSpecializations().map((spec) => (
                          <option key={spec} value={spec}>{spec}</option>
                        ))}
                      </select>
                    </div>
                    <div className="hr-field">
                      <label className="hr-label">Years of Experience</label>
                      <input
                        name="experience" type="number"
                        placeholder="e.g. 8"
                        value={form.experience} onChange={handleChange}
                        className="hr-input hr-input-mono"
                      />
                    </div>
                  </div>

                  <div className="hr-row" style={{marginBottom:12}}>
                    <div className="hr-field">
                      <label className="hr-label">Hospital / Clinic</label>
                      <input
                        name="hospital" placeholder="Hospital name"
                        value={form.hospital} onChange={handleChange}
                        className="hr-input"
                      />
                    </div>
                    <div className="hr-field">
                      <label className="hr-label">License Number</label>
                      <input
                        name="licenseNumber" placeholder="SLMC-XXXXX"
                        value={form.licenseNumber} onChange={handleChange}
                        className="hr-input hr-input-mono"
                      />
                    </div>
                  </div>

                  <div className="hr-field" style={{marginBottom:12}}>
                    <label className="hr-label">Phone Number</label>
                    <input
                      name="phoneNumber" placeholder="+94 7X XXX XXXX"
                      value={form.phoneNumber} onChange={handleChange}
                      className="hr-input hr-input-mono"
                    />
                  </div>

                  <div className="hr-notice">
                    <span style={{fontSize:14,flexShrink:0}}>⚠️</span>
                    <span>Your profile will be reviewed by admin before activation. This usually takes 1–2 business days.</span>
                  </div>
                </div>
              )}

              <button className="hr-btn" onClick={handleRegister}>
                {isDoctor ? "Submit for Verification →" : "Create Account →"}
              </button>
            </div>

            <div className="hr-footer">
              Already have an account?{" "}
              <Link to="/" className="hr-link">Sign in →</Link>
            </div>
          </section>

        </div>
      </div>
    </>
  );
}

export default Register;