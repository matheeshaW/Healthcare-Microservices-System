import React, { useEffect, useRef, useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import { AuthContext } from '../../context/AuthContext';

const VideoSession = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const myName = user?.role === 'doctor' ? `Dr. ${user?.name}` : user?.name || 'Me';

  // Refs
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const socketRef = useRef(null);
  const peerRef = useRef(null);
  const messagesEndRef = useRef(null); 

  // WebRTC States
  const [stream, setStream] = useState(null);
  const [hasJoined, setHasJoined] = useState(false);
  const [error, setError] = useState("");
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  
  const [remoteUserJoined, setRemoteUserJoined] = useState(false);
  const [isRemoteVideoOff, setIsRemoteVideoOff] = useState(false); 
  const [callStatus, setCallStatus] = useState("Waiting for the other person to join...");

  // Chat States
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [isChatOpen, setIsChatOpen] = useState(true);

  // ==========================================
  // WEBRTC & SOCKET LOGIC
  // ==========================================
  const requestPermissionsAndJoin = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setStream(mediaStream);
      setHasJoined(true);
      setError("");

      socketRef.current = io('http://localhost:5006'); 

      peerRef.current = new RTCPeerConnection({
        iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
      });

      mediaStream.getTracks().forEach((track) => peerRef.current.addTrack(track, mediaStream));

      peerRef.current.ontrack = (event) => {
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = event.streams[0];
          setRemoteUserJoined(true);
          setIsRemoteVideoOff(false); 
        }
      };

      peerRef.current.onicecandidate = (event) => {
        if (event.candidate) {
          socketRef.current.emit('ice-candidate', { roomId: id, candidate: event.candidate });
        }
      };

      peerRef.current.onconnectionstatechange = () => {
        if (['disconnected', 'failed', 'closed'].includes(peerRef.current.connectionState)) {
          setRemoteUserJoined(false);
          setIsRemoteVideoOff(false);
          setCallStatus("The other person has left the consultation.");
          if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
        }
      };

      // --- SIGNALING ---
      socketRef.current.emit('join-room', id, user?._id || 'guest');

      socketRef.current.on('user-connected', async () => {
        const offer = await peerRef.current.createOffer();
        await peerRef.current.setLocalDescription(offer);
        socketRef.current.emit('offer', { roomId: id, offer });
      });

      socketRef.current.on('offer', async (offer) => {
        await peerRef.current.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await peerRef.current.createAnswer();
        await peerRef.current.setLocalDescription(answer);
        socketRef.current.emit('answer', { roomId: id, answer });
      });

      socketRef.current.on('answer', async (answer) => {
        await peerRef.current.setRemoteDescription(new RTCSessionDescription(answer));
      });

      socketRef.current.on('ice-candidate', async (candidate) => {
        if (candidate) await peerRef.current.addIceCandidate(new RTCIceCandidate(candidate));
      });

      // --- CHAT & CAMERA SIGNALING ---
      socketRef.current.on('receive-chat-message', (messageData) => {
        setMessages((prev) => [...prev, messageData]);
      });

      socketRef.current.on('camera-toggle', (isVideoOff) => {
        setIsRemoteVideoOff(isVideoOff);
      });

    } catch (err) {
      console.error("Error starting call:", err);
      setError("Could not access camera/mic. Please check permissions!");
    }
  };

  useEffect(() => {
    if (hasJoined && localVideoRef.current && stream) {
      localVideoRef.current.srcObject = stream;
    }
  }, [hasJoined, stream]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const endCall = () => {
    if (localVideoRef.current?.srcObject) {
      localVideoRef.current.srcObject.getTracks().forEach(track => track.stop());
    }
    if (peerRef.current) peerRef.current.close();
    if (socketRef.current) socketRef.current.disconnect();
    navigate('/telemedicine');
  };

  useEffect(() => {
    return () => {
      if (localVideoRef.current?.srcObject) {
        localVideoRef.current.srcObject.getTracks().forEach(track => track.stop());
      }
      if (peerRef.current) peerRef.current.close();
      if (socketRef.current) socketRef.current.disconnect();
    };
  }, []);

  // UI Toggles
  const toggleMute = () => {
    if (stream) {
      const audioTrack = stream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
      }
    }
  };

  const toggleVideo = () => {
    if (stream) {
      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        const newVideoState = !videoTrack.enabled;
        setIsVideoOff(newVideoState);
        
        // 👈 NEW: Tell the server we turned our camera off/on
        if (socketRef.current) {
          socketRef.current.emit('camera-toggle', { roomId: id, isVideoOff: newVideoState });
        }
      }
    }
  };

  const sendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const messageData = {
      roomId: id,
      senderName: myName,
      text: newMessage,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    socketRef.current.emit('send-chat-message', messageData);
    setMessages((prev) => [...prev, { ...messageData, isMine: true }]);
    setNewMessage("");
  };

  // ==========================================
  // VIEW 1: LOBBY
  // ==========================================
  if (!hasJoined) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-6">
        <div className="bg-slate-800 p-8 rounded-2xl shadow-2xl max-w-md w-full text-center border border-slate-700">
          <div className="w-20 h-20 bg-cyan-900 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-4xl">📹</span>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Ready to join?</h2>
          <p className="text-slate-400 mb-8">Room: <span className="text-cyan-400 font-mono">{id || 'Test'}</span></p>
          {error && <div className="bg-red-500/20 text-red-400 p-3 rounded-lg mb-6">{error}</div>}
          <button onClick={requestPermissionsAndJoin} className="w-full py-4 bg-cyan-600 hover:bg-cyan-700 text-white font-bold rounded-xl transition-all shadow-lg">
            Join Consultation
          </button>
        </div>
      </div>
    );
  }

  // ==========================================
  // VIEW 2: ACTIVE CALL ROOM
  // ==========================================
  return (
    <div className="h-screen bg-slate-900 flex flex-col overflow-hidden">
      <div className="p-4 bg-slate-800 text-white flex justify-between items-center shadow-md z-10 shrink-0">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <span className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>
          Room: {id || 'Test-Room'}
        </h2>
        <div className="flex items-center gap-4">
          <span className="text-cyan-400 text-sm font-semibold hidden sm:block">
            {remoteUserJoined ? 'Connected' : 'Waiting...'}
          </span>
          <button onClick={() => setIsChatOpen(!isChatOpen)} className="p-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm transition-colors">
            {isChatOpen ? 'Hide Chat' : 'Show Chat'} 💬
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden relative">
        <div className="flex-1 p-4 relative flex items-center justify-center bg-black overflow-hidden">
          
          {/* MAIN VIDEO (The other person) */}
          <video 
            ref={remoteVideoRef} 
            autoPlay 
            playsInline 
            className={`w-full h-full object-contain bg-black ${isRemoteVideoOff ? 'hidden' : 'block'}`} 
          />
          
          {/* 👈 NEW: Placeholder when REMOTE video is off */}
          {remoteUserJoined && isRemoteVideoOff && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-800">
              <div className="w-32 h-32 bg-slate-600 rounded-full flex items-center justify-center text-6xl text-white mb-4 shadow-xl border-4 border-slate-700">
                👤
              </div>
              <p className="text-white text-xl font-medium">Camera is turned off</p>
            </div>
          )}

          {/* Waiting for user to join */}
          {!remoteUserJoined && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500">
              <span className="text-6xl mb-4 animate-bounce">📡</span>
              <p className="text-xl text-center px-4">{callStatus}</p>
            </div>
          )}

          {/* PIP Video (You) */}
          <div className="absolute bottom-6 left-6 w-32 md:w-48 lg:w-64 aspect-video bg-slate-800 rounded-xl overflow-hidden shadow-2xl border-2 border-slate-600 z-20">
            <video ref={localVideoRef} autoPlay playsInline muted className={`w-full h-full object-cover scale-x-[-1] ${isVideoOff ? 'hidden' : 'block'}`} />
            {isVideoOff && <div className="w-full h-full flex items-center justify-center bg-slate-800 text-3xl">👤</div>}
            <div className="absolute bottom-1 left-1 bg-black/60 text-white text-[10px] md:text-xs px-2 py-0.5 rounded backdrop-blur-sm truncate max-w-[90%]">
              {myName} (You)
            </div>
          </div>
        </div>

        {/* CHAT PANEL */}
        {isChatOpen && (
          <div className="w-full sm:w-80 lg:w-96 bg-slate-800 border-l border-slate-700 flex flex-col shrink-0 absolute sm:relative h-full right-0 z-30 transition-transform shadow-2xl sm:shadow-none">
            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
              {messages.length === 0 ? (
                <div className="text-center text-slate-500 mt-10 text-sm">Send a message to start the chat</div>
              ) : (
                messages.map((msg, index) => (
                  <div key={index} className={`flex flex-col ${msg.isMine ? 'items-end' : 'items-start'}`}>
                    <span className="text-xs text-slate-400 mb-1 px-1">{msg.isMine ? 'You' : msg.senderName} • {msg.timestamp}</span>
                    <div className={`px-4 py-2 rounded-2xl max-w-[85%] text-sm ${msg.isMine ? 'bg-cyan-600 text-white rounded-br-none' : 'bg-slate-700 text-slate-100 rounded-bl-none'}`}>
                      {msg.text}
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-4 bg-slate-900 border-t border-slate-700">
              <form onSubmit={sendMessage} className="flex gap-2">
                <input type="text" value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder="Type a message..." className="flex-1 bg-slate-800 text-white px-4 py-2 rounded-full border border-slate-700 focus:outline-none focus:border-cyan-500 text-sm" />
                <button type="submit" disabled={!newMessage.trim()} className="p-2 bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-700 disabled:text-slate-500 text-white rounded-full transition-colors flex items-center justify-center w-10 h-10 shrink-0">➤</button>
              </form>
            </div>
          </div>
        )}
      </div>

      <div className="p-4 md:p-6 bg-slate-800 flex justify-center gap-4 md:gap-6 z-10 shrink-0 border-t border-slate-700">
        <button onClick={toggleMute} className={`p-3 md:p-4 rounded-full flex items-center justify-center transition-all ${isMuted ? 'bg-red-500 text-white' : 'bg-slate-600 text-white'}`}>{isMuted ? '🔇' : '🎤'}</button>
        <button onClick={toggleVideo} className={`p-3 md:p-4 rounded-full flex items-center justify-center transition-all ${isVideoOff ? 'bg-red-500 text-white' : 'bg-slate-600 text-white'}`}>{isVideoOff ? '🚫' : '📷'}</button>
        <button onClick={endCall} className="px-6 md:px-8 py-3 md:py-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-full transition-all text-sm md:text-base">End Call</button>
      </div>
    </div>
  );
};

export default VideoSession;