import API from "./axios";

/**
 * Issue a new prescription for an appointment
 * @param {Object} prescriptionData - { appointmentId, patientId, notes, medicines[] }
 */
export const issuePrescription = async (prescriptionData) => {
  try {
    const response = await API.post("/prescriptions", prescriptionData);
    return response.data.data;
  } catch (error) {
    throw error.response?.data?.message || "Failed to issue prescription";
  }
};

/**
 * Get prescription by appointment ID
 * @param {string} appointmentId - Appointment ID
 */
export const getPrescriptionByAppointment = async (appointmentId) => {
  try {
    const response = await API.get(
      `/prescriptions/appointment/${appointmentId}`,
    );
    return response.data.data;
  } catch (error) {
    // Return null if no prescription found (404)
    if (error.response?.status === 404) {
      return null;
    }
    throw error.response?.data?.message || "Failed to fetch prescription";
  }
};

/**
 * Get all prescriptions issued by current doctor
 */
export const getMyPrescriptions = async () => {
  try {
    const response = await API.get("/prescriptions/me");
    return response.data.data || [];
  } catch (error) {
    throw error.response?.data?.message || "Failed to fetch prescriptions";
  }
};

/**
 * Update prescription status
 * @param {string} prescriptionId - Prescription ID
 * @param {string} status - "issued" | "filled" | "expired"
 */
export const updatePrescriptionStatus = async (prescriptionId, status) => {
  try {
    const response = await API.put(`/prescriptions/${prescriptionId}/status`, {
      status,
    });
    return response.data.data;
  } catch (error) {
    throw (
      error.response?.data?.message || "Failed to update prescription status"
    );
  }
};

/**
 * Get a single prescription by ID
 */
export const getPrescriptionDetail = async (prescriptionId) => {
  try {
    const response = await API.get(`/prescriptions/${prescriptionId}`);
    return response.data.data;
  } catch (error) {
    throw (
      error.response?.data?.message || "Failed to fetch prescription details"
    );
  }
};

/**
 * Create a new prescription (alternate export name)
 */
export const createPrescription = issuePrescription;

/**
 * Update an existing prescription
 * @param {string} prescriptionId - Prescription ID
 * @param {Object} updateData - Fields to update
 */
export const updatePrescription = async (prescriptionId, updateData) => {
  try {
    const response = await API.put(
      `/prescriptions/${prescriptionId}`,
      updateData,
    );
    return response.data.data;
  } catch (error) {
    throw error.response?.data?.message || "Failed to update prescription";
  }
};

/**
 * Completely remove a prescription from database
 * @param {string} prescriptionId - Prescription ID
 */
export const removePrescription = async (prescriptionId) => {
  try {
    const response = await API.delete(`/prescriptions/${prescriptionId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || "Failed to remove prescription";
  }
};
