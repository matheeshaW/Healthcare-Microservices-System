
import { useEffect, useState, useContext } from "react";
import { AuthContext } from "../../context/AuthContext";

function PaymentHistory() {
  const { user } = useContext(AuthContext);
  
  // State management for cross-service data
  const [paidSessions, setPaidSessions] = useState([]);
  const [appointmentDetails, setAppointmentDetails] = useState({});
  const [doctorNames, setDoctorNames] = useState({}); // Stores names from Port 5002
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEverything = async () => {
      if (!user) return;
      try {
        setLoading(true);
        const userId = user._id || user.id;

        // 1. Fetch Payment History from Payment Service (Port 5005)
        const payRes = await fetch(`http://localhost:5005/api/payment/history/${userId}?role=${user.role}`);
        const payData = await payRes.json();

        if (payData.success && Array.isArray(payData.data)) {
          setPaidSessions(payData.data);

          const apptMap = {};
          const nameMap = {};

          // 2. Map through payments to enrich with Appointment & Doctor data
          await Promise.all(payData.data.map(async (payment) => {
            try {
              // Fetch Appointment details (Port 5003) to find the doctorId
              const apptRes = await fetch(`http://localhost:5003/api/appointments/${payment.appointmentId}`);
              const apptJson = await apptRes.json();
              
              if (apptJson.success && apptJson.data) {
                const appt = apptJson.data;
                apptMap[payment.appointmentId] = appt;

                // 3. Fetch Real Doctor Name from Doctor Service (Port 5002)
                const docId = appt.doctorId;
                if (docId && !nameMap[docId]) {
                  const docRes = await fetch(`http://localhost:5002/api/doctors/${docId}`);
                  const docJson = await docRes.json();
                  
                  if (docJson.success && docJson.data) {
                    // Store the real name found in the doctor profile
                    nameMap[docId] = docJson.data.name;
                  }
                }
              }
            } catch (err) {
              console.warn(`Data enrichment failed for appointment ${payment.appointmentId}`, err);
            }
          }));

          setAppointmentDetails(apptMap);
          setDoctorNames(nameMap);
        }
      } catch (err) {
        console.error("Critical cross-service fetch failed", err);
      } finally {
        setLoading(false);
      }
    };

    fetchEverything();
  }, [user]);

  if (loading) {
    return (
      <div className="p-20 text-center">
        <div className="animate-spin inline-block w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full mb-4"></div>
        <p className="text-slate-500 font-bold font-mono">Connecting Microservices...</p>
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
            const docId = details?.doctorId;
            
            // Priority: 1. Real name from 5002, 2. Name saved in payment, 3. Fallback
            const realName = doctorNames[docId] || payment.doctorName || "Assigned Specialist";

            return (
              <div key={payment._id} className="p-5 border-2 border-slate-100 rounded-2xl flex flex-wrap justify-between items-center bg-white shadow-sm hover:border-emerald-200 transition-all duration-300">
                <div className="space-y-1 min-w-[250px]">
                  <span className="text-[10px] font-extrabold bg-emerald-500 text-white px-2 py-0.5 rounded uppercase tracking-tighter">Verified</span>
                  
                  <p className="font-bold text-slate-900 text-lg">
                    {user.role === 'doctor' 
                      ? `Patient: ${payment.patientEmail || "Verified Patient"}` 
                      : `Doctor: Dr. ${realName}`}
                  </p>
                  
                  <div className="flex items-center gap-3 text-sm text-slate-600 font-medium">
                    {/* Shows the date from the appointment, or the payment creation date as fallback */}
                    <span className="flex items-center gap-1">📅 {details?.date ? new Date(details.date).toLocaleDateString() : new Date(payment.createdAt).toLocaleDateString()}</span>
                    <span className="flex items-center gap-1">⏰ {details?.time || "Session Confirmed"}</span>
                  </div>
                  
                  <p className="text-[10px] text-slate-400 font-mono mt-2 uppercase tracking-widest">TXN: {payment.transactionId}</p>
                </div>

                <div className="flex flex-col items-end gap-3 ml-auto">
                  <span className="font-extrabold text-slate-800 text-lg">Rs. {payment.amount}</span>
                  <div className="bg-emerald-50 text-emerald-600 border border-emerald-200 px-6 py-2 rounded-xl font-bold flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                    </svg>
                    Payment Done
                  </div>
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