import { useState, useCallback } from "react";
import * as doctorAPI from "../api/doctor.api";

/**
 * useDoctors Hook
 */
export const useDoctors = () => {
  // Doctors list state
  const [doctors, setDoctors] = useState([]);
  const [filteredDoctors, setFilteredDoctors] = useState([]);

  // Current doctor state
  const [currentDoctor, setCurrentDoctor] = useState(null);
  const [myProfile, setMyProfile] = useState(null);

  // Loading states
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);

  // Error states
  const [error, setError] = useState(null);
  const [searchError, setSearchError] = useState(null);
  const [profileError, setProfileError] = useState(null);
  const [profileNotFound, setProfileNotFound] = useState(false);

  // Filter/search state
  const [filters, setFilters] = useState({
    specialization: null,
    verified: true,
  });

  // Fetch all doctors
  const fetchAllDoctors = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const response = await doctorAPI.getAllDoctors(params);

      if (response.success) {
        const formattedDoctors = response.data.map((doctor) =>
          doctorAPI.formatDoctorData(doctor),
        );
        setDoctors(formattedDoctors);
        setFilteredDoctors(formattedDoctors);
        return response;
      } else {
        throw new Error(response.message || "Failed to fetch doctors");
      }
    } catch (err) {
      const errorMessage =
        err.message || err.data?.message || "Failed to fetch doctors";
      setError(errorMessage);
      console.error("Error fetching doctors:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Search doctors
  const searchDoctorsBySpecialization = useCallback(
    async (specialization, verified = true) => {
      setSearchLoading(true);
      setSearchError(null);
      try {
        const params = { specialization };

        // Handle verified filter
        if (verified === "all") {
          params.verified = "all";
        } else if (verified === true) {
          params.verified = "true";
        } else if (verified === false) {
          params.verified = "false";
        }

        const response = await doctorAPI.searchDoctors(params);

        if (response.success) {
          const formattedDoctors = response.data.map((doctor) =>
            doctorAPI.formatDoctorData(doctor),
          );
          setFilteredDoctors(formattedDoctors);

          // Update filters state
          setFilters({
            specialization,
            verified,
          });

          return response;
        } else {
          throw new Error(response.message || "Failed to search doctors");
        }
      } catch (err) {
        const errorMessage =
          err.message || err.data?.message || "Failed to search doctors";
        setSearchError(errorMessage);
        console.error("Error searching doctors:", err);
        throw err;
      } finally {
        setSearchLoading(false);
      }
    },
    [],
  );

  // GET my profile (Current Doctor)
  const fetchMyProfile = useCallback(async () => {
    setProfileLoading(true);
    setProfileError(null);
    setProfileNotFound(false);
    try {
      const response = await doctorAPI.getMyProfile();

      if (response.success) {
        const formattedProfile = doctorAPI.formatDoctorData(response.data);
        setMyProfile(formattedProfile);
        return response;
      } else {
        throw new Error(response.message || "Failed to fetch your profile");
      }
    } catch (err) {
      // Check if it's a 404 Not Found error (profile doesn't exist)
      const statusCode = err.cause?.response?.status || err.response?.status;
      if (statusCode === 404) {
        setProfileNotFound(true);
      }

      const errorMessage =
        err.message || err.data?.message || "Failed to fetch your profile";
      setProfileError(errorMessage);
      console.error("Error fetching my profile:", err);
    } finally {
      setProfileLoading(false);
    }
  }, []);

  // GET doctor by ID
  const getDoctorById = useCallback(async (doctorId) => {
    setLoading(true);
    setError(null);
    try {
      const response = await doctorAPI.getDoctorById(doctorId);

      if (response.success) {
        const formattedDoctor = doctorAPI.formatDoctorData(response.data);
        setCurrentDoctor(formattedDoctor);
        return response;
      } else {
        throw new Error(response.message || "Failed to fetch doctor");
      }
    } catch (err) {
      const errorMessage =
        err.message || err.data?.message || "Failed to fetch doctor";
      setError(errorMessage);
      console.error("Error fetching doctor:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Create doctor profile
  const createProfile = useCallback(
    async (profileData) => {
      setProfileLoading(true);
      setProfileError(null);
      try {
        // Validate required fields
        const required = [
          "name",
          "specialization",
          "experience",
          "hospital",
          "licenseNumber",
          "phoneNumber",
        ];
        const missing = required.filter((field) => !profileData[field]);

        if (missing.length > 0) {
          throw new Error(`Missing required fields: ${missing.join(", ")}`);
        }

        const experience = Number(profileData.experience);
        // Validate experience is a finite, non-negative number
        if (!Number.isFinite(experience) || experience < 0) {
          throw new Error("Experience must be a non-negative number");
        }

        const response = await doctorAPI.createDoctorProfile({
          ...profileData,
          experience,
        });

        if (response.success) {
          // Fetch the newly created profile
          await fetchMyProfile();
          return response;
        } else {
          throw new Error(response.message || "Failed to create profile");
        }
      } catch (err) {
        const errorMessage = err.message || "Failed to create profile";
        setProfileError(errorMessage);
        console.error("Error creating profile:", err);
        throw err;
      } finally {
        setProfileLoading(false);
      }
    },
    [fetchMyProfile],
  );

  // Update doctor profile
  const updateProfile = useCallback(async (doctorId, updateData) => {
    setProfileLoading(true);
    setProfileError(null);
    try {
      // Only allow updating specific fields
      const allowedFields = ["name", "experience", "hospital", "phoneNumber"];
      const cleanData = {};

      allowedFields.forEach((field) => {
        if (updateData[field] !== undefined) {
          cleanData[field] = updateData[field];
        }
      });

      if (Object.keys(cleanData).length === 0) {
        throw new Error("No valid fields to update");
      }

      const response = await doctorAPI.updateDoctorProfile(doctorId, cleanData);

      if (response.success) {
        const formattedProfile = doctorAPI.formatDoctorData(response.data);
        setMyProfile(formattedProfile);
        setCurrentDoctor(formattedProfile);
        return response;
      } else {
        throw new Error(response.message || "Failed to update profile");
      }
    } catch (err) {
      const errorMessage =
        err.message || err.data?.message || "Failed to update profile";
      setProfileError(errorMessage);
      console.error("Error updating profile:", err);
      throw err;
    } finally {
      setProfileLoading(false);
    }
  }, []);

  // Delete profile (Soft Delete)
  const deleteProfile = useCallback(async (doctorId) => {
    setProfileLoading(true);
    setProfileError(null);
    try {
      const response = await doctorAPI.deleteDoctorProfile(doctorId);

      if (response.success) {
        setMyProfile(null);
        setCurrentDoctor(null);
        return response;
      } else {
        throw new Error(response.message || "Failed to delete profile");
      }
    } catch (err) {
      const errorMessage =
        err.message || err.data?.message || "Failed to delete profile";
      setProfileError(errorMessage);
      console.error("Error deleting profile:", err);
      throw err;
    } finally {
      setProfileLoading(false);
    }
  }, []);

  // Verify doctor (Admin only)
  const verifyDoctorProfile = useCallback(async (doctorId) => {
    setProfileLoading(true);
    setProfileError(null);
    try {
      const response = await doctorAPI.verifyDoctor(doctorId);

      if (response.success) {
        const formattedDoctor = doctorAPI.formatDoctorData(response.data);
        setCurrentDoctor(formattedDoctor);

        // Update in doctors and filtered doctors lists if the doctor exists
        setDoctors((prevDoctors) =>
          prevDoctors.map((doc) =>
            doc.id === doctorId ? { ...doc, verified: true } : doc,
          ),
        );
        setFilteredDoctors((prevFilteredDoctors) =>
          prevFilteredDoctors.map((doc) =>
            doc.id === doctorId ? { ...doc, verified: true } : doc,
          ),
        );

        return response;
      } else {
        throw new Error(response.message || "Failed to verify doctor");
      }
    } catch (err) {
      const errorMessage =
        err.message || err.data?.message || "Failed to verify doctor";
      setProfileError(errorMessage);
      console.error("Error verifying doctor:", err);
      throw err;
    } finally {
      setProfileLoading(false);
    }
  }, []);

  // Clear all errors
  const clearErrors = useCallback(() => {
    setError(null);
    setSearchError(null);
    setProfileError(null);
    setProfileNotFound(false);
  }, []);

  // Reset all state to initial values
  const resetState = useCallback(() => {
    setDoctors([]);
    setFilteredDoctors([]);
    setCurrentDoctor(null);
    setMyProfile(null);
    setLoading(false);
    setSearchLoading(false);
    setProfileLoading(false);
    setError(null);
    setSearchError(null);
    setProfileError(null);
    setFilters({ specialization: null, verified: true });
  }, []);

  // Get list of available specializations
  const getSpecializations = useCallback(() => {
    return doctorAPI.getSpecializations();
  }, []);

  return {
    // State
    doctors,
    filteredDoctors,
    currentDoctor,
    myProfile,
    filters,

    // Loading states
    loading,
    searchLoading,
    profileLoading,
    isLoading: loading || searchLoading || profileLoading,

    // Error states
    error,
    searchError,
    profileError,
    profileNotFound,

    // API Methods
    fetchAllDoctors,
    searchDoctorsBySpecialization,
    fetchMyProfile,
    getDoctorById,
    createProfile,
    updateProfile,
    deleteProfile,
    verifyDoctorProfile,

    // Utility Methods
    clearErrors,
    resetState,
    getSpecializations,
  };
};

export default useDoctors;