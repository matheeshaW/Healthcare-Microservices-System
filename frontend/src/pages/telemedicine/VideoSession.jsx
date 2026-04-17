import React, { useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { JitsiMeeting } from '@jitsi/react-sdk';
import { AuthContext } from '../../context/AuthContext';

const VideoSession = () => {
  const { id } = useParams(); // The Room ID from the URL
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  // Format the user's name for the meeting
  const displayName = user?.role === 'doctor' ? `Dr. ${user?.name}` : user?.name || 'Patient';

  return (
    <div className="h-screen w-full bg-slate-900 flex flex-col">
      {/* Header */}
      <div className="p-4 bg-slate-800 text-white flex justify-between items-center shadow-md shrink-0">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></span>
          Consultation Room: {id}
        </h2>
        <span className="text-slate-400 text-sm">Powered by Jitsi Meet API</span>
      </div>

      {/* Jitsi Video Container */}
      <div className="flex-1 w-full h-full">
        <JitsiMeeting
          domain="meet.jit.si"
          roomName={`HealthcareSystem_Room_${id}`} 
          configOverwrite={{
            startWithAudioMuted: true,
            disableModeratorIndicator: true,
            startScreenSharing: true,
            enableEmailInStats: false
          }}
          interfaceConfigOverwrite={{
            DISABLE_JOIN_LEAVE_NOTIFICATIONS: true
          }}
          userInfo={{
            displayName: displayName
          }}
          onApiReady={(externalApi) => {
            }}
          getIFrameRef={(iframeRef) => {
            iframeRef.style.height = '100%';
            iframeRef.style.width = '100%';
          }}
        />
      </div>

      {/* Back Button */}
      <div className="p-4 bg-slate-800 flex justify-center shrink-0">
        <button 
          onClick={() => navigate('/telemedicine')}
          className="px-8 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-full transition-all"
        >
          Leave Consultation Dashboard
        </button>
      </div>
    </div>
  );
};

export default VideoSession;