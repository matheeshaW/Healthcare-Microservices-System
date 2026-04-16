import { useEffect, useState, useContext, useCallback } from "react";
import { AuthContext } from "../../context/AuthContext";
import useAppointments from "../../hooks/useAppointments";
import { getDoctorById } from "../../api/appointment.api";

/**
 * TelemedicineDashboard Component
 * Filters and displays confirmed appointments for virtual sessions.
 */
function TelemedicineDashboard() {
  const { user } = useContext(AuthContext);
  const { fetchMine, loading } = useAppointments();

  const [allSessions, setAllSessions] = useState([]);
  const [filter, setFilter] = useState("today");
  const [doctorNames, setDoctorNames] = useState({});

  // ==========================================
  // DATA LOADING LOGIC
  // ==========================================
  const loadData = useCallback(async () => {
    const data = await fetchMine();

    // Only show "Confirmed" appointments for telemedicine
    const confirmed = data.filter((app) => app.status === "confirmed");
    setAllSessions(confirmed);

    // Fetch Doctor Names for Patients to improve UI
    if (user?.role === "patient") {
      const uniqueDocs = [...new Set(confirmed.map((a) => a.doctorId))];
      const nameMap = {};
      for (const id of uniqueDocs) {
        try {
          const doc = await getDoctorById(id);
          nameMap[id] = doc.name;
        } catch (e) {
          nameMap[id] = "Specialist";
        }
      }
      setDoctorNames(nameMap);
    }
  }, [user, fetchMine]);

  useEffect(() => {
    if (user) loadData();
  }, [user, loadData]);

  // ==========================================
  // FILTERING LOGIC
  // ==========================================
  const filteredSessions = allSessions.filter((session) => {
    const sessionDate = new Date(session.date).setHours(0, 0, 0, 0);
    const today = new Date().setHours(0, 0, 0, 0);
    return filter === "today" ? sessionDate === today : sessionDate > today;
  });

  // ==========================================
  // RENDER
  // ==========================================
  return (
    <section className="p-4 md:p-8 max-w-4xl mx-auto">
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 md:text-3xl">Telemedicine Portal</h1>
        <p className="text-slate-500 text-sm mt-1">Join your virtual consultations and manage your schedule.</p>
      </header>

      {/* Tab Navigation */}
      <div className="flex gap-8 mb-6 border-b border-slate-200">
        {["today", "upcoming"].map((t) => (
          <button
            key={t}
            onClick={() => setFilter(t)}
            className={`pb-3 px-2 font-bold text-sm uppercase tracking-wider transition ${
              filter === t ? "border-b-2 border-cyan-600 text-cyan-600" : "text-slate-400 hover:text-slate-600"
            }`}
          >
            {t === "today" ? "Today's Calls" : "Future Schedule"}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 p-2 md:p-6 shadow-sm">
        {loading ? (
          <div className="py-20 text-center text-slate-400 animate-pulse">
            Checking for active sessions...
          </div>
        ) : filteredSessions.length > 0 ? (
          <div className="space-y-3">
            {filteredSessions.map((session) => {
              const isPaid = session.paymentStatus === "Paid";
              const isToday = filter === "today";

              return (
                <div
                  key={session._id}
                  className="group flex items-center justify-between p-5 border border-slate-100 rounded-2xl hover:border-cyan-200 hover:bg-cyan-50/30 transition-all"
                >
                  <div className="flex items-center gap-4">
                    {isToday && (
                      <span className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                      </span>
                    )}
                    <div>
                      <p className="font-bold text-slate-900">
                        {user?.role === "patient"
                          ? `Dr. ${doctorNames[session.doctorId] || "Specialist"}`
                          : `Patient ID: ...${session.patientId.slice(-6)}`}
                      </p>
                      <p className="text-sm text-slate-500 font-medium">
                        {session.time} <span className="mx-1 text-slate-300">|</span> {new Date(session.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {!isPaid && user?.role === "patient" && (
                      <span className="hidden md:block text-[10px] font-black bg-amber-100 text-amber-700 px-2 py-1 rounded uppercase">
                        Payment Required
                      </span>
                    )}
                    <button
                      onClick={() => (window.location.href = `/telemedicine/session/${session._id}`)}
                      disabled={user?.role === "patient" && !isPaid}
                      className={`px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 transition transform active:scale-95 ${
                        user?.role === "patient" && !isPaid
                          ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                          : "bg-cyan-600 text-white shadow-md hover:bg-cyan-700"
                      }`}
                    >
                      📹 Join Call
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
              📅
            </div>
            <p className="text-slate-500 font-medium">No consultations found for {filter}.</p>
            <p className="text-slate-400 text-xs mt-1">Confirmed appointments will appear here automatically.</p>
          </div>
        )}
      </div>
    </section>
  );
}

export default TelemedicineDashboard;