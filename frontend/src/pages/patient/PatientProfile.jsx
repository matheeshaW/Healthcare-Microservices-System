import { useEffect, useState } from "react";
import { usePatient } from "../../hooks/usePatient";
import { Button, Card, Spinner } from "../../components/ui";

function PatientProfile() {
  const { profile, fetchProfile, saveProfile, loading } = usePatient();

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

  useEffect(() => {
    if (profile) {
      setForm({
        age: profile.age || "",
        gender: profile.gender || "",
        address: profile.address || "",
        medicalHistory: profile.medicalHistory?.join(", ") || "",
        allergies: profile.allergies?.join(", ") || ""
      });
    }
  }, [profile]);

  const handleSubmit = async () => {
    await saveProfile({
      ...form,
      medicalHistory: form.medicalHistory.split(",").map(s => s.trim()),
      allergies: form.allergies.split(",").map(s => s.trim())
    });

    alert("Profile updated!");
  };

  if (loading) return <Spinner label="Loading profile..." />;

  return (
    <Card>
      <h2 className="text-xl font-bold mb-4">Patient Profile</h2>

      <input name="age" value={form.age} onChange={(e)=>setForm({...form, age:e.target.value})} className="input" />
      <input name="gender" value={form.gender} onChange={(e)=>setForm({...form, gender:e.target.value})} className="input" />
      <input name="address" value={form.address} onChange={(e)=>setForm({...form, address:e.target.value})} className="input" />
      <input name="medicalHistory" value={form.medicalHistory} onChange={(e)=>setForm({...form, medicalHistory:e.target.value})} className="input" placeholder="Comma separated" />
      <input name="allergies" value={form.allergies} onChange={(e)=>setForm({...form, allergies:e.target.value})} className="input" placeholder="Comma separated" />

      <Button onClick={handleSubmit} fullWidth>
        Save Profile
      </Button>
    </Card>
  );
}

export default PatientProfile;