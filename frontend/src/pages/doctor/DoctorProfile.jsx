/**
 * DoctorProfile Page
 */

import { useEffect, useState } from "react";
import { useDoctors } from "../../hooks/useDoctors";
import { Card, Button, Badge, Spinner, StatusChip } from "../../components/ui";

export const DoctorProfile = ({ onSuccess }) => {
  const {
    myProfile,
    fetchMyProfile,
    updateProfile,
    profileLoading,
    profileError,
  } = useDoctors();

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    experience: "",
    hospital: "",
    phoneNumber: "",
  });

  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    fetchMyProfile();
  }, [fetchMyProfile]);

  useEffect(() => {
    if (myProfile) {
      setFormData({
        name: myProfile.name || "",
        experience: myProfile.experience || "",
        hospital: myProfile.hospital || "",
        phoneNumber: myProfile.phoneNumber || "",
      });
    }
  }, [myProfile]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!formData.experience || formData.experience < 0) {
      newErrors.experience = "Valid experience years required";
    }

    if (!formData.hospital.trim()) {
      newErrors.hospital = "Hospital name is required";
    }

    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = "Phone number is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    // Clear error for this field
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: undefined,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      await updateProfile(myProfile.id, formData);
      setSuccessMessage("Profile updated successfully!");
      setIsEditing(false);
      setTimeout(() => setSuccessMessage(""), 3000);
      onSuccess?.();
    } catch (error) {
      console.error("Failed to update profile:", error);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData({
      name: myProfile?.name || "",
      experience: myProfile?.experience || "",
      hospital: myProfile?.hospital || "",
      phoneNumber: myProfile?.phoneNumber || "",
    });
    setErrors({});
  };

  if (profileLoading && !myProfile) {
    return (
      <div className="space-y-6">
        <h1 className="text-4xl font-bold text-slate-900">Doctor Profile</h1>
        <Card padding="lg" className="text-center">
          <Spinner size="lg" variant="primary" label="Loading profile..." />
        </Card>
      </div>
    );
  }

  if (profileError && !myProfile) {
    return (
      <div className="space-y-6">
        <h1 className="text-4xl font-bold text-slate-900">Doctor Profile</h1>
        <Card padding="lg" className="bg-red-50 border border-red-200">
          <div className="space-y-4">
            <p className="text-red-700 font-semibold">{profileError}</p>
            <Button variant="danger" onClick={fetchMyProfile}>
              Retry
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Page Header */}
      <div>
        <h1 className="text-4xl font-bold text-slate-900 mb-2">
          Doctor Profile
        </h1>
        <p className="text-slate-600">
          View and manage your professional information
        </p>
      </div>

      {/* Success Message */}
      {successMessage && (
        <Card padding="md" className="bg-emerald-50 border border-emerald-200">
          <p className="text-emerald-700 font-semibold">{successMessage}</p>
        </Card>
      )}

      {/* Profile Error */}
      {profileError && (
        <Card padding="md" className="bg-red-50 border border-red-200">
          <p className="text-red-700 font-semibold">{profileError}</p>
        </Card>
      )}

      {/* Profile Information */}
      {myProfile && (
        <Card padding="lg" className="space-y-6">
          {/* Header Section */}
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">
                Dr. {myProfile.name}
              </h2>
              <div className="flex gap-2 mt-2 flex-wrap">
                <Badge variant="specialization">
                  {myProfile.specialization}
                </Badge>
                <StatusChip
                  status={myProfile.verified ? "verified" : "unverified"}
                  size="sm"
                />
              </div>
            </div>

            {!isEditing && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => setIsEditing(true)}
              >
                Edit Profile
              </Button>
            )}
          </div>

          {/* Edit Form */}
          {isEditing ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  className={`
                    w-full px-4 py-2.5 rounded-lg border
                    text-slate-900 font-medium
                    focus:outline-none focus:ring-2 focus:ring-cyan-500
                    transition
                    ${errors.name ? "border-red-500" : "border-slate-300"}
                  `}
                  disabled={profileLoading}
                />
                {errors.name && (
                  <p className="text-red-600 text-sm mt-1">{errors.name}</p>
                )}
              </div>

              {/* Experience */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Years of Experience
                </label>
                <input
                  type="number"
                  value={formData.experience}
                  onChange={(e) =>
                    handleInputChange("experience", parseInt(e.target.value))
                  }
                  min="0"
                  max="100"
                  className={`
                    w-full px-4 py-2.5 rounded-lg border
                    text-slate-900 font-medium
                    focus:outline-none focus:ring-2 focus:ring-cyan-500
                    transition
                    ${errors.experience ? "border-red-500" : "border-slate-300"}
                  `}
                  disabled={profileLoading}
                />
                {errors.experience && (
                  <p className="text-red-600 text-sm mt-1">
                    {errors.experience}
                  </p>
                )}
              </div>

              {/* Hospital */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Hospital/Clinic Name
                </label>
                <input
                  type="text"
                  value={formData.hospital}
                  onChange={(e) =>
                    handleInputChange("hospital", e.target.value)
                  }
                  className={`
                    w-full px-4 py-2.5 rounded-lg border
                    text-slate-900 font-medium
                    focus:outline-none focus:ring-2 focus:ring-cyan-500
                    transition
                    ${errors.hospital ? "border-red-500" : "border-slate-300"}
                  `}
                  disabled={profileLoading}
                />
                {errors.hospital && (
                  <p className="text-red-600 text-sm mt-1">{errors.hospital}</p>
                )}
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={formData.phoneNumber}
                  onChange={(e) =>
                    handleInputChange("phoneNumber", e.target.value)
                  }
                  className={`
                    w-full px-4 py-2.5 rounded-lg border
                    text-slate-900 font-medium
                    focus:outline-none focus:ring-2 focus:ring-cyan-500
                    transition
                    ${
                      errors.phoneNumber ? "border-red-500" : "border-slate-300"
                    }
                  `}
                  disabled={profileLoading}
                />
                {errors.phoneNumber && (
                  <p className="text-red-600 text-sm mt-1">
                    {errors.phoneNumber}
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <Button
                  type="submit"
                  variant="success"
                  fullWidth
                  loading={profileLoading}
                  disabled={profileLoading}
                >
                  Save Changes
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  fullWidth
                  onClick={handleCancel}
                  disabled={profileLoading}
                >
                  Cancel
                </Button>
              </div>
            </form>
          ) : (
            /* View Mode */
            <div className="space-y-4 border-t border-slate-200 pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-slate-600 uppercase tracking-wide">
                    Experience
                  </p>
                  <p className="text-xl font-bold text-slate-900 mt-1">
                    {myProfile.experience} years
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-600 uppercase tracking-wide">
                    Hospital
                  </p>
                  <p className="text-xl font-bold text-slate-900 mt-1">
                    {myProfile.hospital}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-600 uppercase tracking-wide">
                    Phone
                  </p>
                  <p className="text-xl font-bold text-slate-900 mt-1">
                    {myProfile.phoneNumber}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-600 uppercase tracking-wide">
                    License Number
                  </p>
                  <p className="text-xl font-bold text-slate-900 mt-1">
                    {myProfile.licenseNumber}
                  </p>
                </div>
              </div>
            </div>
          )}
        </Card>
      )}
    </div>
  );
};

export default DoctorProfile;
