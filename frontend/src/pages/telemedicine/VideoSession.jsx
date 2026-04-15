import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTelemedicine } from '../../hooks/useTelemedicine';

const VideoSession = () => {
    const { id } = useParams(); // Grabs the ID from the URL if it exists
    const navigate = useNavigate();
    const { handleStartMeeting, loading, error } = useTelemedicine();
    
    // State for the manual input box (used if M3's code isn't ready)
    const [manualId, setManualId] = useState(id || '');

    const onJoinClick = () => {
        if (!manualId) return;

        // When M3 finishes their part, we will pull Doctor/Patient IDs from the actual appointment.
        // For now, we still mock them, but the Appointment ID is now dynamic!
        const dynamicAppointmentData = {
            appointmentId: manualId,
            doctorId: "DOC_MATHEESHA", 
            patientId: "PAT_WARUNA",   
            startTime: new Date().toISOString()
        };

        handleStartMeeting(dynamicAppointmentData);
    };

    return (
        <div className="p-6 max-w-lg mx-auto bg-white rounded-xl shadow-md mt-10 text-center">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">Telehealth Portal</h2>
            
            {/* Show a different message depending on if they came from a link or not */}
            {id ? (
                <p className="text-green-600 font-semibold mb-6">
                    Ready to join appointment: {id}
                </p>
            ) : (
                <p className="text-gray-600 mb-4">
                    Please enter your Appointment ID to join the call.
                </p>
            )}

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
                    {error}
                </div>
            )}

            {/* If no ID in URL, show this input box */}
            {!id && (
                <input 
                    type="text" 
                    placeholder="e.g. APP_12345"
                    value={manualId}
                    onChange={(e) => setManualId(e.target.value)}
                    className="w-full px-4 py-2 mb-4 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                />
            )}

            <button 
                onClick={onJoinClick}
                disabled={loading || !manualId}
                className={`w-full font-bold py-3 px-4 rounded text-white ${
                    (loading || !manualId) ? 'bg-blue-300 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
                }`}
            >
                {loading ? 'Generating Secure Link...' : 'Start Video Consultation 📹'}
            </button>
        </div>
    );
};

export default VideoSession;