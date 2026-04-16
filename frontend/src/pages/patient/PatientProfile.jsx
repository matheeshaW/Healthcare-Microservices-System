import { useEffect, useState } from "react";
import { usePatient } from "../../hooks/usePatient";
import { useNavigate } from "react-router-dom";
import { Button, Card, Modal, Spinner, StatusChip } from "../../components/ui";

function PatientProfile() {
  const {
    profile,
    fetchProfile,
    saveProfile,
    deletePatientProfile,
    loading,
    error
  } = usePatient();
  const navigate = useNavigate();
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [form, setForm] = useState({
    age: "",
    dob: "",
    gender: "",
    bloodGroup: "",
    heightCm: "",
    weightKg: "",
    address: "",
    emergencyContactName: "",
    emergencyContactRelation: "",
    emergencyContactPhone: "",
    insuranceProvider: "",
    insurancePolicyNumber: "",
    medicalHistory: "",
    allergies: "",
    chronicConditions: "",
    currentMedications: "",
    notes: ""
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  useEffect(() => {
    if (profile) {
      setForm({
        age: profile.age || "",
        dob: profile.dob ? new Date(profile.dob).toISOString().split("T")[0] : "",
        gender: profile.gender || "",
        bloodGroup: profile.bloodGroup || "",
        heightCm: profile.heightCm || "",
        weightKg: profile.weightKg || "",
        address: profile.address || "",
        emergencyContactName: profile.emergencyContact?.name || "",
        emergencyContactRelation: profile.emergencyContact?.relation || "",
        emergencyContactPhone: profile.emergencyContact?.phone || "",
        insuranceProvider: profile.insuranceProvider || "",
        insurancePolicyNumber: profile.insurancePolicyNumber || "",
        medicalHistory: profile.medicalHistory?.join(", ") || "",
        allergies: profile.allergies?.join(", ") || "",
        chronicConditions: profile.chronicConditions?.join(", ") || "",
        currentMedications: profile.currentMedications?.join(", ") || "",
        notes: profile.notes || ""
      });
      setValidationErrors({});
    }
  }, [profile]);

  const toList = (value) =>
    value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

  const bloodGroupOptions = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
  const genderOptions = ["Male", "Female", "Other"];

  const validateForm = () => {
    const nextErrors = {};

    const requiredMessage = "This field is required.";

    if (!form.age) nextErrors.age = requiredMessage;
    if (!form.dob) nextErrors.dob = requiredMessage;
    if (!form.gender) nextErrors.gender = requiredMessage;
    if (!form.bloodGroup) nextErrors.bloodGroup = requiredMessage;
    if (!form.heightCm) nextErrors.heightCm = requiredMessage;
    if (!form.weightKg) nextErrors.weightKg = requiredMessage;
    if (!form.address?.trim()) nextErrors.address = requiredMessage;
    if (!form.emergencyContactName?.trim()) nextErrors.emergencyContactName = requiredMessage;
    if (!form.emergencyContactRelation?.trim()) nextErrors.emergencyContactRelation = requiredMessage;
    if (!form.emergencyContactPhone?.trim()) nextErrors.emergencyContactPhone = requiredMessage;
    if (!form.insuranceProvider?.trim()) nextErrors.insuranceProvider = requiredMessage;
    if (!form.insurancePolicyNumber?.trim()) nextErrors.insurancePolicyNumber = requiredMessage;
    if (!form.medicalHistory?.trim()) nextErrors.medicalHistory = requiredMessage;
    if (!form.allergies?.trim()) nextErrors.allergies = requiredMessage;
    if (!form.chronicConditions?.trim()) nextErrors.chronicConditions = requiredMessage;
    if (!form.currentMedications?.trim()) nextErrors.currentMedications = requiredMessage;

    if (form.age) {
      const age = Number(form.age);
      if (Number.isNaN(age) || age < 0 || age > 120) {
        nextErrors.age = "Age must be between 0 and 120.";
      }
    }

    if (form.dob) {
      const dobDate = new Date(form.dob);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (Number.isNaN(dobDate.getTime()) || dobDate > today) {
        nextErrors.dob = "Date of birth cannot be in the future.";
      }
    }

    if (form.bloodGroup && !bloodGroupOptions.includes(form.bloodGroup)) {
      nextErrors.bloodGroup = "Please select a valid blood group.";
    }

    if (form.heightCm) {
      const height = Number(form.heightCm);
      if (Number.isNaN(height) || height < 30 || height > 280) {
        nextErrors.heightCm = "Height must be between 30 and 280 cm.";
      }
    }

    if (form.weightKg) {
      const weight = Number(form.weightKg);
      if (Number.isNaN(weight) || weight < 1 || weight > 500) {
        nextErrors.weightKg = "Weight must be between 1 and 500 kg.";
      }
    }

    if (form.emergencyContactPhone) {
      const phoneRegex = /^[+]?\d{7,15}$/;
      if (!phoneRegex.test(form.emergencyContactPhone.trim())) {
        nextErrors.emergencyContactPhone =
          "Phone must be 7-15 digits and may start with +.";
      }
    }

    return nextErrors;
  };

  const handleFieldChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setValidationErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleSubmit = async () => {
    const nextErrors = validateForm();
    if (Object.keys(nextErrors).length > 0) {
      setValidationErrors(nextErrors);
      return;
    }

    try {
      setIsSubmitting(true);
      await saveProfile({
        age: form.age ? Number(form.age) : undefined,
        dob: form.dob || undefined,
        gender: form.gender || undefined,
        bloodGroup: form.bloodGroup || undefined,
        heightCm: form.heightCm ? Number(form.heightCm) : undefined,
        weightKg: form.weightKg ? Number(form.weightKg) : undefined,
        address: form.address || undefined,
        emergencyContact: {
          name: form.emergencyContactName || undefined,
          relation: form.emergencyContactRelation || undefined,
          phone: form.emergencyContactPhone || undefined
        },
        insuranceProvider: form.insuranceProvider || undefined,
        insurancePolicyNumber: form.insurancePolicyNumber || undefined,
        medicalHistory: toList(form.medicalHistory),
        allergies: toList(form.allergies),
        chronicConditions: toList(form.chronicConditions),
        currentMedications: toList(form.currentMedications),
        notes: form.notes || undefined
      });

      setValidationErrors({});
      alert("Profile updated!");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    try {
      await deletePatientProfile();
      setIsDeleteOpen(false);
      alert("Profile deleted successfully");
      navigate("/home");
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to delete profile");
    }
  };

  const inputClass =
    "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200";
  const inputErrorClass = "border-red-400 focus:border-red-500 focus:ring-red-200";
  const hasValidationErrors = Object.keys(validationErrors).length > 0;

  if (loading) return <Spinner label="Loading profile..." />;

  return (
    <div className="space-y-4">
      <Card border shadow="sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Patient Profile</h2>
            <p className="text-sm text-slate-600">
              Keep your healthcare information up to date.
            </p>
          </div>
          <StatusChip status={profile ? "active" : "pending"} />
        </div>
      </Card>

      {error && (
        <Card border shadow="sm">
          <p className="text-sm text-red-600">
            {error?.response?.data?.message || error?.message || "Something went wrong"}
          </p>
        </Card>
      )}

      {hasValidationErrors && (
        <Card border shadow="sm" className="border-amber-200 bg-amber-50">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 text-amber-600">
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01M10.29 3.86l-8.1 14.02A2 2 0 003.92 21h16.16a2 2 0 001.73-3.12l-8.1-14.02a2 2 0 00-3.46 0z"
                />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-amber-900">
                Please fill in the highlighted fields below.
              </p>
              <p className="mt-1 text-sm text-amber-800">
                Required fields are marked with inline warnings so you can fix them quickly before saving.
              </p>
            </div>
          </div>
        </Card>
      )}

      <Card border shadow="sm" className="space-y-4">
        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <label className="mb-1 block text-sm font-semibold text-slate-700">Age</label>
            <input type="number" value={form.age} onChange={(e) => handleFieldChange("age", e.target.value)} className={`${inputClass} ${validationErrors.age ? inputErrorClass : ""}`} />
            {validationErrors.age && <p className="mt-1 text-xs text-red-600">{validationErrors.age}</p>}
          </div>
          <div>
            <label className="mb-1 block text-sm font-semibold text-slate-700">Date of Birth</label>
            <input type="date" value={form.dob} onChange={(e) => handleFieldChange("dob", e.target.value)} className={`${inputClass} ${validationErrors.dob ? inputErrorClass : ""}`} />
            {validationErrors.dob && <p className="mt-1 text-xs text-red-600">{validationErrors.dob}</p>}
          </div>
          <div>
            <label className="mb-1 block text-sm font-semibold text-slate-700">Gender</label>
            <select
              value={form.gender}
              onChange={(e) => handleFieldChange("gender", e.target.value)}
              className={`${inputClass} ${validationErrors.gender ? inputErrorClass : ""}`}
            >
              <option value="">Select gender</option>
              {genderOptions.map((option) => (
                <option key={option} value={option.toLowerCase()}>
                  {option}
                </option>
              ))}
            </select>
            {validationErrors.gender && <p className="mt-1 text-xs text-red-600">{validationErrors.gender}</p>}
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <label className="mb-1 block text-sm font-semibold text-slate-700">Blood Group</label>
            <select
              value={form.bloodGroup}
              onChange={(e) => handleFieldChange("bloodGroup", e.target.value)}
              className={`${inputClass} ${validationErrors.bloodGroup ? inputErrorClass : ""}`}
            >
              <option value="">Select blood group</option>
              {bloodGroupOptions.map((group) => (
                <option key={group} value={group}>
                  {group}
                </option>
              ))}
            </select>
            {validationErrors.bloodGroup && <p className="mt-1 text-xs text-red-600">{validationErrors.bloodGroup}</p>}
          </div>
          <div>
            <label className="mb-1 block text-sm font-semibold text-slate-700">Height (cm)</label>
            <input type="number" value={form.heightCm} onChange={(e) => handleFieldChange("heightCm", e.target.value)} className={`${inputClass} ${validationErrors.heightCm ? inputErrorClass : ""}`} />
            {validationErrors.heightCm && <p className="mt-1 text-xs text-red-600">{validationErrors.heightCm}</p>}
          </div>
          <div>
            <label className="mb-1 block text-sm font-semibold text-slate-700">Weight (kg)</label>
            <input type="number" value={form.weightKg} onChange={(e) => handleFieldChange("weightKg", e.target.value)} className={`${inputClass} ${validationErrors.weightKg ? inputErrorClass : ""}`} />
            {validationErrors.weightKg && <p className="mt-1 text-xs text-red-600">{validationErrors.weightKg}</p>}
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-semibold text-slate-700">Address</label>
          <input value={form.address} onChange={(e) => handleFieldChange("address", e.target.value)} className={`${inputClass} ${validationErrors.address ? inputErrorClass : ""}`} />
          {validationErrors.address && <p className="mt-1 text-xs text-red-600">{validationErrors.address}</p>}
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <label className="mb-1 block text-sm font-semibold text-slate-700">Emergency Contact Name</label>
            <input value={form.emergencyContactName} onChange={(e) => handleFieldChange("emergencyContactName", e.target.value)} className={`${inputClass} ${validationErrors.emergencyContactName ? inputErrorClass : ""}`} />
            {validationErrors.emergencyContactName && <p className="mt-1 text-xs text-red-600">{validationErrors.emergencyContactName}</p>}
          </div>
          <div>
            <label className="mb-1 block text-sm font-semibold text-slate-700">Emergency Contact Relation</label>
            <input value={form.emergencyContactRelation} onChange={(e) => handleFieldChange("emergencyContactRelation", e.target.value)} className={`${inputClass} ${validationErrors.emergencyContactRelation ? inputErrorClass : ""}`} />
            {validationErrors.emergencyContactRelation && <p className="mt-1 text-xs text-red-600">{validationErrors.emergencyContactRelation}</p>}
          </div>
          <div>
            <label className="mb-1 block text-sm font-semibold text-slate-700">Emergency Contact Phone</label>
            <input value={form.emergencyContactPhone} onChange={(e) => handleFieldChange("emergencyContactPhone", e.target.value)} className={`${inputClass} ${validationErrors.emergencyContactPhone ? inputErrorClass : ""}`} />
            {validationErrors.emergencyContactPhone && <p className="mt-1 text-xs text-red-600">{validationErrors.emergencyContactPhone}</p>}
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-semibold text-slate-700">Insurance Provider</label>
            <input value={form.insuranceProvider} onChange={(e) => handleFieldChange("insuranceProvider", e.target.value)} className={`${inputClass} ${validationErrors.insuranceProvider ? inputErrorClass : ""}`} />
            {validationErrors.insuranceProvider && <p className="mt-1 text-xs text-red-600">{validationErrors.insuranceProvider}</p>}
          </div>
          <div>
            <label className="mb-1 block text-sm font-semibold text-slate-700">Insurance Policy Number</label>
            <input value={form.insurancePolicyNumber} onChange={(e) => handleFieldChange("insurancePolicyNumber", e.target.value)} className={`${inputClass} ${validationErrors.insurancePolicyNumber ? inputErrorClass : ""}`} />
            {validationErrors.insurancePolicyNumber && <p className="mt-1 text-xs text-red-600">{validationErrors.insurancePolicyNumber}</p>}
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-semibold text-slate-700">Medical History</label>
          <input value={form.medicalHistory} onChange={(e) => handleFieldChange("medicalHistory", e.target.value)} className={`${inputClass} ${validationErrors.medicalHistory ? inputErrorClass : ""}`} placeholder="Comma separated" />
          {validationErrors.medicalHistory && <p className="mt-1 text-xs text-red-600">{validationErrors.medicalHistory}</p>}
        </div>

        <div>
          <label className="mb-1 block text-sm font-semibold text-slate-700">Allergies</label>
          <input value={form.allergies} onChange={(e) => handleFieldChange("allergies", e.target.value)} className={`${inputClass} ${validationErrors.allergies ? inputErrorClass : ""}`} placeholder="Comma separated" />
          {validationErrors.allergies && <p className="mt-1 text-xs text-red-600">{validationErrors.allergies}</p>}
        </div>

        <div>
          <label className="mb-1 block text-sm font-semibold text-slate-700">Chronic Conditions</label>
          <input value={form.chronicConditions} onChange={(e) => handleFieldChange("chronicConditions", e.target.value)} className={`${inputClass} ${validationErrors.chronicConditions ? inputErrorClass : ""}`} placeholder="Comma separated" />
          {validationErrors.chronicConditions && <p className="mt-1 text-xs text-red-600">{validationErrors.chronicConditions}</p>}
        </div>

        <div>
          <label className="mb-1 block text-sm font-semibold text-slate-700">Current Medications</label>
          <input value={form.currentMedications} onChange={(e) => handleFieldChange("currentMedications", e.target.value)} className={`${inputClass} ${validationErrors.currentMedications ? inputErrorClass : ""}`} placeholder="Comma separated" />
          {validationErrors.currentMedications && <p className="mt-1 text-xs text-red-600">{validationErrors.currentMedications}</p>}
        </div>

        <div>
          <label className="mb-1 block text-sm font-semibold text-slate-700">Notes</label>
          <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className={inputClass} rows={4} />
        </div>

        <div className="flex flex-col gap-3 pt-2 md:flex-row md:justify-end">
          <Button variant="danger" onClick={() => setIsDeleteOpen(true)}>
            Delete Profile
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Save Profile"}
          </Button>
        </div>
      </Card>

      <Modal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        title="Delete Patient Profile"
        actions={(
          <>
            <Button variant="ghost" onClick={() => setIsDeleteOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDelete}>
              Confirm Delete
            </Button>
          </>
        )}
      >
        <p className="text-sm text-slate-600">
          This will delete your patient profile record. Your login account and uploaded medical reports will remain.
        </p>
      </Modal>
    </div>
  );
}

export default PatientProfile;