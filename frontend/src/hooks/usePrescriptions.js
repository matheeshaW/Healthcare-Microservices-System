import { useState, useCallback, useEffect } from "react";
import { getMyPrescriptions } from "../api/prescription.api";

/**
 * Custom hook for managing doctor's prescriptions
 * Follows the pattern of useAppointments with filtering support
 */
export const usePrescriptions = () => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filterStatus, setFilterStatus] = useState("all"); // "all", "active", "completed"

  /**
   * Transform backend prescription to UI format
   */
  const transformPrescription = (backendPrescription) => {
    return {
      id: backendPrescription._id,
      patientId: backendPrescription.patientId,
      patientName: backendPrescription.patientId, // Show patient ID as name (backend limitation)
      date: backendPrescription.createdAt,
      diagnosis: backendPrescription.notes,
      medicines: backendPrescription.medicines || [],
      status: mapBackendStatusToUI(backendPrescription.status),
      expiryDate: backendPrescription.expiryDate,
      // Store original backend data
      _backendStatus: backendPrescription.status,
    };
  };

  /**
   * Map backend status to UI status
   * Backend: "issued" | "filled" | "expired"
   * UI: "active" | "completed"
   */
  const mapBackendStatusToUI = (backendStatus) => {
    if (backendStatus === "expired") {
      return "completed";
    }
    return "active"; // "issued" and "filled" both show as active
  };

  /**
   * Fetch prescriptions from backend
   */
  const fetchMyPrescriptions = useCallback(async () => {
    let isMounted = true;

    try {
      setLoading(true);
      setError(null);

      const data = await getMyPrescriptions();

      if (!isMounted) return;

      // Transform backend data to UI format
      const transformedData = data.map(transformPrescription);
      setPrescriptions(transformedData);
    } catch (err) {
      if (!isMounted) return;

      const errorMessage =
        typeof err === "string"
          ? err
          : err?.message || "Failed to load prescriptions";
      setError(errorMessage);
      console.error("Error fetching prescriptions:", err);
    } finally {
      if (isMounted) {
        setLoading(false);
      }
    }

    return () => {
      isMounted = false;
    };
  }, []);

  /**
   * Get filtered prescriptions based on current filter
   */
  const getFilteredPrescriptions = useCallback(() => {
    if (filterStatus === "all") {
      return prescriptions;
    }
    return prescriptions.filter((p) => p.status === filterStatus);
  }, [prescriptions, filterStatus]);

  /**
   * Get prescription counts for filter buttons
   */
  const getPrescriptionCounts = useCallback(() => {
    return {
      all: prescriptions.length,
      active: prescriptions.filter((p) => p.status === "active").length,
      completed: prescriptions.filter((p) => p.status === "completed").length,
    };
  }, [prescriptions]);

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    // State
    prescriptions,
    filteredPrescriptions: getFilteredPrescriptions(),
    allPrescriptions: prescriptions,
    loading,
    error,
    filterStatus,

    // Methods
    fetchMyPrescriptions,
    setFilterStatus,
    clearError,

    // Computed
    counts: getPrescriptionCounts(),
  };
};
