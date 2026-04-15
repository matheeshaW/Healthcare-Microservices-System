import API from './axios';

// Call the Gateway to create a Jitsi session
export const createVideoSession = async (appointmentData) => {
    try {
        const response = await API.post('/telemedicine/create', appointmentData);
        return response.data;
    } catch (error) {
        throw error.response?.data || { error: 'Failed to create session' };
    }
};

// Call the Gateway to fetch an existing link
export const getMeetingLink = async (appointmentId) => {
    try {
        const response = await API.get(`/telemedicine/session/${appointmentId}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || { error: 'Session not found' };
    }
};