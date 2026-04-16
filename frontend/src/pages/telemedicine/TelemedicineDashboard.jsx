import React from 'react';
import { Link } from 'react-router-dom';

const TelemedicineDashboard = () => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6 text-slate-800">Telemedicine Sessions</h1>
      
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Upcoming Consultations Today</h2>
        
        {/* Placeholder for when Kanushka's Appointment Service is ready */}
        <div className="border border-slate-200 rounded p-4 flex justify-between items-center bg-slate-50">
          <div>
            <p className="font-bold text-slate-800">Patient: John Doe</p>
            <p className="text-sm text-slate-500">Time: 10:30 AM | Reason: General Checkup</p>
          </div>
          <Link 
            to="/telemedicine/session/ROOM_123" 
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
          >
            📹 Join Call
          </Link>
        </div>
        
      </div>
    </div>
  );
};

export default TelemedicineDashboard;