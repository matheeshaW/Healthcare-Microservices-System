import { useState } from "react";
import {
  getProfile,
  updateProfile,
  getReports,
  uploadReport
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

  const addReport = async (file) => {
    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("file", file);

      await uploadReport(formData);

      await fetchReports(); // refresh list
    } catch (err) {
      setError(err);
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
    addReport
  };
};