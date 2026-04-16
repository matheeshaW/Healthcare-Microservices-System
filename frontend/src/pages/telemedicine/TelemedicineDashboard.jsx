import { useEffect, useState, useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

function TelemedicinePortal() {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [paidSessions, setPaidSessions] = useState([]);
  const [appointmentDetails, setAppointmentDetails] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAllData = async () => {
      if (!user) return;
      try {
        setLoading(true);
        const userId = user._id || user.id;
        const role = user.role;

        // 1. Fetch Payments from Port 5005
        const res = await fetch(`http://localhost:5005/api/payment/history/${userId}?role=${role}`);
        const result = await res.json();

        if (result.success && Array.isArray(result.data)) {
          setPaidSessions(result.data);
          
          // 2. Fetch rich details for each appointment from Port 5002
          const detailsMap = {};
          await Promise.all(result.data.map(async (payment) => {
            try {
              const apptRes = await fetch(`http://localhost:5002/api/appointments/${payment.appointmentId}`);
              if (apptRes.ok) {
                const apptData = await apptRes.json();
                detailsMap[payment.appointmentId] = apptData;
              }
            } catch (err) {
              console.warn(`Could not fetch details for ${payment.appointmentId}`);
            }
          }));
          setAppointmentDetails(detailsMap);
        }
      } catch (err) {
        console.error("Portal Error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, [user]);

  if (loading) return <div className="p-20 text-center animate-pulse text-cyan-600 font-bold">Syncing Portals...</div>;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-slate-800">Telemedicine Portal</h1>
      <div className="grid gap-4">
        {paidSessions.length > 0 ? (
          paidSessions.map((payment) => {
            const details = appointmentDetails[payment.appointmentId];
            
            return (
              <div key={payment._id} className="p-5 border-2 border-cyan-100 rounded-2xl flex justify-between items-center bg-white shadow-sm hover:border-cyan-400 transition">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold bg-emerald-500 text-white px-2 py-0.5 rounded uppercase">Verified</span>
                  
                  {/* If details haven't loaded, we show the ID as a fallback */}
                  <p className="font-bold text-slate-900 text-lg">
                    {user.role === 'doctor' 
                      ? `Patient: ${details?.patientName || "User " + payment.patientId.slice(-4)}` 
                      : `Doctor: ${details?.doctorName || "Consultant"}`}
                  </p>
                  
                  <div className="flex items-center gap-3 text-sm text-slate-600">
                    <span>📅 {details?.date || "Date Pending"}</span>
                    <span>⏰ {details?.time || "Time Pending"}</span>
                  </div>
                  
                  <p className="text-[11px] text-slate-400 font-mono mt-2">TXN: {payment.transactionId}</p>
                </div>

                <div className="flex flex-col items-end gap-3">
                  <span className="font-bold text-slate-800">Rs. {payment.amount}</span>
                  <button
                    className="bg-cyan-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-cyan-700 shadow-lg shadow-cyan-100 transition"
                    onClick={() => navigate(`/telemedicine/session/${payment.appointmentId}`)}
                  >
                    Join Call
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-20 bg-slate-50 rounded-3xl border-2 border-dashed text-slate-400">
            No paid consultations found.
          </div>
        )}
      </div>
    </div>
  );
}

export default TelemedicinePortal;