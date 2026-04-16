import { useEffect, useState, useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

function PaymentHistory() {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  
  // States to hold our data
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

        // 1. Fetch Payment History from Port 5005
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
              console.warn(`Appointment ${payment.appointmentId} details not found.`);
            }
          }));
          setAppointmentDetails(detailsMap);
        }
      } catch (err) {
        console.error("Data fetch failed", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, [user]);

  if (loading) {
    return (
      <div className="p-20 text-center">
        <div className="animate-spin inline-block w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full mb-4"></div>
        <p className="text-slate-500 font-bold">Syncing Records...</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-slate-800 text-center md:text-left">Your Payment History</h1>
      <div className="grid gap-4">
        {paidSessions.length > 0 ? (
          paidSessions.map((payment) => {
            const details = appointmentDetails[payment.appointmentId];
            
            return (
              <div key={payment._id} className="p-5 border-2 border-cyan-100 rounded-2xl flex flex-wrap justify-between items-center bg-white shadow-sm hover:border-cyan-400 transition-all duration-300">
                <div className="space-y-1 min-w-[250px]">
                  <span className="text-[10px] font-extrabold bg-emerald-500 text-white px-2 py-0.5 rounded uppercase tracking-tighter">Verified</span>
                  
                  {/* Shows Name from Appt Service, or Patient Email from Payment Record as fallback */}
                  <p className="font-bold text-slate-900 text-lg">
                    {user.role === 'doctor' 
                      ? `Patient: ${details?.patientName || payment.patientEmail || "Verified Patient"}` 
                      : `Doctor: ${details?.doctorName || "Assigned Specialist"}`}
                  </p>
                  
                  <div className="flex items-center gap-3 text-sm text-slate-600 font-medium">
                    <span className="flex items-center gap-1">📅 {details?.date || "Scheduled"}</span>
                    <span className="flex items-center gap-1">⏰ {details?.time || "Confirmed"}</span>
                  </div>
                  
                  <p className="text-[10px] text-slate-400 font-mono mt-2 uppercase">TXN: {payment.transactionId}</p>
                </div>

                <div className="flex flex-col items-end gap-3 ml-auto">
                  <span className="font-extrabold text-slate-800 text-lg">Rs. {payment.amount}</span>
                  <button
                    className="bg-cyan-600 text-white px-8 py-2.5 rounded-xl font-bold hover:bg-cyan-700 shadow-lg shadow-cyan-100 active:scale-95 transition-all"
                    onClick={() => navigate(`/telemedicine/session/${payment.appointmentId}`)}
                  >
                    Join Meeting
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-32 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200 text-slate-400">
            <p className="text-4xl mb-4">🗒️</p>
            <p className="font-medium text-lg">No verified payment records found.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default PaymentHistory;