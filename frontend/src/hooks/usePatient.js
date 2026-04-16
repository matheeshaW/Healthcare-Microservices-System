import { useState } from "react";
import {
  getProfile,
  updateProfile,
  deleteProfile,
  getReports,
  uploadReport,
  deleteReport
} from "../api/patient.api";

export const usePatient = () => {
  const [profile, setProfile] = useState(null);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /* ================= PROFILE ================= */

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await getProfile();
      setProfile(res.data.data);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const saveProfile = async (data) => {
    try {
      setLoading(true);
      const res = await updateProfile(data);
      setProfile(res.data.data);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  /* ================= REPORTS ================= */

  const fetchReports = async () => {
    try {
      setLoading(true);
      const res = await getReports();
      setReports(res.data.data);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const addReport = async (file, metadata = {}) => {
    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("file", file);
      if (metadata.name) formData.append("name", metadata.name);
      if (metadata.category) formData.append("category", metadata.category);
      if (metadata.notes) formData.append("notes", metadata.notes);

      await uploadReport(formData);

      await fetchReports(); // refresh list
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const deletePatientReport = async (id) => {
    try {
      setLoading(true);
      await deleteReport(id);
      setReports(prev => prev.filter(r => r._id !== id));
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const deletePatientProfile = async () => {
    try {
      setLoading(true);
      await deleteProfile();
      setProfile(null);
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    profile,
    reports,
    loading,
    error,
    fetchProfile,
    saveProfile,
    fetchReports,
    addReport,
    deletePatientReport,
    deletePatientProfile
  };
};