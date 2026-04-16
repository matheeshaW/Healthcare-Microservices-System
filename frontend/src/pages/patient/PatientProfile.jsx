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
    }
  }, [profile]);

  const toList = (value) =>
    value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

  const handleSubmit = async () => {
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

    alert("Profile updated!");
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

      <Card border shadow="sm" className="space-y-4">
        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <label className="mb-1 block text-sm font-semibold text-slate-700">Age</label>
            <input type="number" value={form.age} onChange={(e) => setForm({ ...form, age: e.target.value })} className={inputClass} />
          </div>
          <div>
            <label className="mb-1 block text-sm font-semibold text-slate-700">Date of Birth</label>
            <input type="date" value={form.dob} onChange={(e) => setForm({ ...form, dob: e.target.value })} className={inputClass} />
          </div>
          <div>
            <label className="mb-1 block text-sm font-semibold text-slate-700">Gender</label>
            <input value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })} className={inputClass} placeholder="Female/Male/Other" />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <label className="mb-1 block text-sm font-semibold text-slate-700">Blood Group</label>
            <input value={form.bloodGroup} onChange={(e) => setForm({ ...form, bloodGroup: e.target.value })} className={inputClass} placeholder="A+, O-, etc." />
          </div>
          <div>
            <label className="mb-1 block text-sm font-semibold text-slate-700">Height (cm)</label>
            <input type="number" value={form.heightCm} onChange={(e) => setForm({ ...form, heightCm: e.target.value })} className={inputClass} />
          </div>
          <div>
            <label className="mb-1 block text-sm font-semibold text-slate-700">Weight (kg)</label>
            <input type="number" value={form.weightKg} onChange={(e) => setForm({ ...form, weightKg: e.target.value })} className={inputClass} />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-semibold text-slate-700">Address</label>
          <input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className={inputClass} />
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <label className="mb-1 block text-sm font-semibold text-slate-700">Emergency Contact Name</label>
            <input value={form.emergencyContactName} onChange={(e) => setForm({ ...form, emergencyContactName: e.target.value })} className={inputClass} />
          </div>
          <div>
            <label className="mb-1 block text-sm font-semibold text-slate-700">Emergency Contact Relation</label>
            <input value={form.emergencyContactRelation} onChange={(e) => setForm({ ...form, emergencyContactRelation: e.target.value })} className={inputClass} />
          </div>
          <div>
            <label className="mb-1 block text-sm font-semibold text-slate-700">Emergency Contact Phone</label>
            <input value={form.emergencyContactPhone} onChange={(e) => setForm({ ...form, emergencyContactPhone: e.target.value })} className={inputClass} />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-semibold text-slate-700">Insurance Provider</label>
            <input value={form.insuranceProvider} onChange={(e) => setForm({ ...form, insuranceProvider: e.target.value })} className={inputClass} />
          </div>
          <div>
            <label className="mb-1 block text-sm font-semibold text-slate-700">Insurance Policy Number</label>
            <input value={form.insurancePolicyNumber} onChange={(e) => setForm({ ...form, insurancePolicyNumber: e.target.value })} className={inputClass} />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-semibold text-slate-700">Medical History</label>
          <input value={form.medicalHistory} onChange={(e) => setForm({ ...form, medicalHistory: e.target.value })} className={inputClass} placeholder="Comma separated" />
        </div>

        <div>
          <label className="mb-1 block text-sm font-semibold text-slate-700">Allergies</label>
          <input value={form.allergies} onChange={(e) => setForm({ ...form, allergies: e.target.value })} className={inputClass} placeholder="Comma separated" />
        </div>

        <div>
          <label className="mb-1 block text-sm font-semibold text-slate-700">Chronic Conditions</label>
          <input value={form.chronicConditions} onChange={(e) => setForm({ ...form, chronicConditions: e.target.value })} className={inputClass} placeholder="Comma separated" />
        </div>

        <div>
          <label className="mb-1 block text-sm font-semibold text-slate-700">Current Medications</label>
          <input value={form.currentMedications} onChange={(e) => setForm({ ...form, currentMedications: e.target.value })} className={inputClass} placeholder="Comma separated" />
        </div>

        <div>
          <label className="mb-1 block text-sm font-semibold text-slate-700">Notes</label>
          <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className={inputClass} rows={4} />
        </div>

        <div className="flex flex-col gap-3 pt-2 md:flex-row md:justify-end">
          <Button variant="danger" onClick={() => setIsDeleteOpen(true)}>
            Delete Profile
          </Button>
          <Button onClick={handleSubmit}>Save Profile</Button>
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