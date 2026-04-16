import { useState } from 'react';
import { createVideoSession } from '../api/telemedicine.api';

export const useTelemedicine = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleStartMeeting = async (data) => {
        setLoading(true);
        setError(null);
        try {
            const result = await createVideoSession(data);
            // Open Jitsi in a new tab immediately
            window.open(result.data.meetingLink, '_blank');
            return result.data;
        } catch (err) {
            setError(err.error || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    return { handleStartMeeting, loading, error };
};