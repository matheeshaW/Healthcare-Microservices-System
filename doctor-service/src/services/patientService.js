const axios = require("axios");

const patientServiceAPI = axios.create({
  baseURL: process.env.PATIENT_SERVICE_URL,
  timeout: 5000,
});

/**
 * Fetch patient profile from Patient Service
 * @param {string} patientId - Patient ID (userId)
 * @returns {object} - Patient data
 */
const getPatientProfile = async (patientId) => {
  try {
    const response = await patientServiceAPI.get(`/patients/${patientId}`);
    return response.data.data;
  } catch (error) {
    console.error(`Failed to fetch patient ${patientId}:`, error.message);
    return null;
  }
};

/**
 * Fetch patient medical reports from Patient Service
 * @param {string} patientId - Patient ID
 * @returns {array} - Array of medical reports or empty array
 */
const getPatientReports = async (patientId) => {
  try {
    const response = await patientServiceAPI.get(
      `/patients/${patientId}/reports`,
    );
    return response.data.data || [];
  } catch (error) {
    console.error(
      `Failed to fetch reports for patient ${patientId}:`,
      error.message,
    );
    return [];
  }
};

module.exports = {
  getPatientProfile,
  getPatientReports,
};
