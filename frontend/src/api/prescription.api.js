import API from "./axios";

/**
 * Get all prescriptions issued by the current doctor
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
 * Create a new prescription
 * @param {Object} prescriptionData - { appointmentId, patientId, notes, medicines[] }
 */
export const createPrescription = async (prescriptionData) => {
  try {
    const response = await API.post("/prescriptions", prescriptionData);
    return response.data.data;
  } catch (error) {
    throw error.response?.data?.message || "Failed to create prescription";
  }
};

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
