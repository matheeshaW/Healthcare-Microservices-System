import { useEffect, useState } from "react";
import { getProfile, updateProfile } from "../../api/patient.api";

function PatientProfile() {
  const [form, setForm] = useState({
    age: "",
    gender: "",
    address: "",
    medicalHistory: "",
    allergies: ""
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await getProfile();

      const data = res.data.data;

      setForm({
        age: data.age || "",
        gender: data.gender || "",
        address: data.address || "",
        medicalHistory: data.medicalHistory?.join(", ") || "",
        allergies: data.allergies?.join(", ") || ""
      });
    } catch {
      console.log("No profile yet");
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    await updateProfile({
      ...form,
      medicalHistory: form.medicalHistory.split(",").map(s => s.trim()),
      allergies: form.allergies.split(",").map(s => s.trim())
    });

    alert("Profile updated!");
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Patient Profile</h2>

      <input name="age" placeholder="Age" value={form.age} onChange={handleChange} className="border p-2" />
      <input name="gender" placeholder="Gender" value={form.gender} onChange={handleChange} className="border p-2" />
      <input name="address" placeholder="Address" value={form.address} onChange={handleChange} className="border p-2" />
      <input name="medicalHistory" placeholder="Medical History (comma separated)" value={form.medicalHistory} onChange={handleChange} className="border p-2" />
      <input name="allergies" placeholder="Allergies (comma separated)" value={form.allergies} onChange={handleChange} className="border p-2" />

      <button onClick={handleSubmit} className="bg-blue-500 px-3 py-1 rounded">
        Save
      </button>
    </div>
  );
}

export default PatientProfile;