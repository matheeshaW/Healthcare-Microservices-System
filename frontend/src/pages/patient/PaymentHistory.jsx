import { useEffect, useState, useContext } from "react";
import { AuthContext } from "../../context/AuthContext";

function PaymentHistory() {
  const { user } = useContext(AuthContext);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await fetch(`http://localhost:5005/api/payment/history/${user._id || user.id}`);
        const data = await res.json();
        if (data.success) setPayments(data.data);
      } catch (err) {
        console.error("Failed to load payments");
      } finally {
        setLoading(false);
      }
    };

    if (user) fetchHistory();
  }, [user]);

  return (
<div className="p-4 md:p-8">
    <h1 className="text-2xl font-bold mb-6 text-slate-900">Your Payment History</h1>
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="p-4 font-semibold text-slate-700">Transaction ID</th>
              <th className="p-4 font-semibold text-slate-700">Amount</th>
              <th className="p-4 font-semibold text-slate-700">Date</th>
              <th className="p-4 font-semibold text-slate-700">Status</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((p) => (
              <tr key={p._id} className="border-b border-slate-100 hover:bg-slate-50 transition">
                <td className="p-4 text-sm font-mono text-cyan-600">{p.transactionId}</td>
                <td className="p-4 text-sm font-bold">Rs. {p.amount}</td>
                <td className="p-4 text-sm text-slate-600">{new Date(p.createdAt).toLocaleDateString()}</td>
                <td className="p-4">
                  <span className="px-2 py-1 text-xs font-bold rounded-full bg-emerald-100 text-emerald-700">
                    Success
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {payments.length === 0 && !loading && (
          <div className="p-10 text-center text-slate-500">No payments found.</div>
        )}
      </div>
    </div>
  );
}

export default PaymentHistory;