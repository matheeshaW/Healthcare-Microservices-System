import API, { APINoAuth } from "./axios";

/**
 * Doctor API Service
 */

const createApiError = (error, fallbackMessage) => {
  const responseData = error.response?.data;
  const apiError = new Error(responseData?.message || fallbackMessage);
  apiError.responseData = responseData || {
    success: false,
    message: fallbackMessage,
  };
  apiError.cause = error;
  return apiError;
};

/**
 * Get all doctors (admin-only)
 * @param {Object} params
 * @param {boolean} [params.includeDeleted] - Whether to include deleted doctors
 * @returns {Promise<Object>}
 */
export const getAllDoctors = async (params = {}) => {
  try {
    const response = await API.get("/doctors/all", { params });
    return response.data;
  } catch (error) {
    throw createApiError(error, "Failed to fetch doctors");
  }
};

/**
 * Search doctors by specialization or verification status
 * @param {Object} params
 * @param {string} params.specialization
 * @param {string} params.verified
 * @returns {Promise<Object>}
 */
export const searchDoctors = async (params = {}) => {
  try {
    const response = await API.get("/doctors/search", { params });
    return response.data;
  } catch (error) {
    throw createApiError(error, "Failed to search doctors");
  }
};

/**
 * Get current logged-in doctor's profile
 * @returns {Promise<Object>}
 */
export const getMyProfile = async () => {
  try {
    const response = await API.get("/doctors/me");
    return response.data;
  } catch (error) {
    throw createApiError(error, "Failed to fetch your profile");
  }
};

/**
 * Get doctor profile by ID
 * @param {string} doctorId
 * @returns {Promise<Object>}
 */
export const getDoctorById = async (doctorId) => {
  try {
    const response = await API.get(`/doctors/${doctorId}`);
    return response.data;
  } catch (error) {
    throw createApiError(error, "Failed to fetch doctor profile");
  }
};

/**
 * Create a new doctor profile
 * @param {Object} profileData
 * @param {string} profileData.name
 * @param {string} profileData.specialization
 * @param {number} profileData.experience
 * @param {string} profileData.hospital
 * @param {string} profileData.licenseNumber
 * @param {string} profileData.phoneNumber
 * @returns {Promise<Object>}
 */
export const createDoctorProfile = async (profileData) => {
  try {
    const response = await API.post("/doctors", profileData);
    return response.data;
  } catch (error) {
    throw createApiError(error, "Failed to create doctor profile");
  }
};

/**
 * Register new doctor (called during user registration)
 * Does not require authentication
 * @param {Object} registrationData
 * @param {string} registrationData.email
 * @param {string} registrationData.name
 * @param {string} registrationData.specialization
 * @param {number} registrationData.experience
 * @param {string} registrationData.hospital
 * @param {string} registrationData.licenseNumber
 * @param {string} registrationData.phoneNumber
 * @returns {Promise<Object>}
 */
export const registerDoctor = async (registrationData) => {
  try {
    const response = await APINoAuth.post(
      "/doctors/register",
      registrationData,
    );
    return response.data;
  } catch (error) {
    throw createApiError(error, "Failed to register doctor profile");
  }
};

/**
 * Update doctor profile (name, experience, hospital, phone)
 * @param {string} doctorId
 * @param {Object} updateData
 * @param {string} updateData.name
 * @param {number} updateData.experience
 * @param {string} updateData.hospital
 * @param {string} updateData.phoneNumber
 * @returns {Promise<Object>}
 */
export const updateDoctorProfile = async (doctorId, updateData) => {
  try {
    const response = await API.put(`/doctors/${doctorId}`, updateData);
    return response.data;
  } catch (error) {
    throw createApiError(error, "Failed to update doctor profile");
  }
};

/**
 * Verify a doctor (ADMIN ONLY)
 * @param {string} doctorId
 * @returns {Promise<Object>}
 */
export const verifyDoctor = async (doctorId) => {
  try {
    const response = await API.put(`/doctors/${doctorId}/verify`);
    return response.data;
  } catch (error) {
    throw createApiError(error, "Failed to verify doctor");
  }
};

/**
 * Delete/deactivate doctor profile (soft delete)
 * @param {string} doctorId
 * @returns {Promise<Object>}
 */
export const deleteDoctorProfile = async (doctorId) => {
  try {
    const response = await API.delete(`/doctors/${doctorId}`);
    return response.data;
  } catch (error) {
    throw createApiError(error, "Failed to delete doctor profile");
  }
};

/**
 * Get available specializations
 */
export const getSpecializations = () => {
  return [
    "Cardiology",
    "Dermatology",
    "Pediatrics",
    "Neurology",
    "Orthopedics",
    "General Medicine",
    "Dentistry",
  ];
};

/**
 * Format doctor data for display
 * @param {Object} doctor
 * @returns {Object}
 */
export const formatDoctorData = (doctor) => {
  return {
    id: doctor._id,
    name: doctor.name,
    specialization: doctor.specialization,
    experience: doctor.experience,
    hospital: doctor.hospital,
    licenseNumber: doctor.licenseNumber,
    phoneNumber: doctor.phoneNumber,
    verified: doctor.verified,
    rating: doctor.rating,
    totalReviews: doctor.totalReviews,
    createdAt: new Date(doctor.createdAt).toLocaleDateString(),
    isActive: doctor.isActive,
  };
};

export default {
  getAllDoctors,
  searchDoctors,
  getMyProfile,
  getDoctorById,
  createDoctorProfile,
  updateDoctorProfile,
  verifyDoctor,
  deleteDoctorProfile,
  getSpecializations,
  formatDoctorData,
};
