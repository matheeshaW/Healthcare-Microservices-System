import { Card, Badge } from "../ui";

function PatientProfileCard({ profile }) {
  if (!profile) {
    return (
      <Card>
        <p className="text-slate-500">No profile found</p>
      </Card>
    );
  }

  return (
    <Card border shadow="sm">
      <h3 className="mb-3 text-lg font-bold text-slate-900">Patient Summary</h3>

      <div className="grid gap-3 text-sm md:grid-cols-2">
        <p><strong>Age:</strong> {profile.age || "N/A"}</p>
        <p><strong>DOB:</strong> {profile.dob ? new Date(profile.dob).toLocaleDateString() : "N/A"}</p>
        <p><strong>Gender:</strong> {profile.gender || "N/A"}</p>
        <p><strong>Blood Group:</strong> {profile.bloodGroup || "N/A"}</p>
        <p><strong>Height:</strong> {profile.heightCm ? `${profile.heightCm} cm` : "N/A"}</p>
        <p><strong>Weight:</strong> {profile.weightKg ? `${profile.weightKg} kg` : "N/A"}</p>
        <p className="md:col-span-2"><strong>Address:</strong> {profile.address || "N/A"}</p>
        <p><strong>Insurance:</strong> {profile.insuranceProvider || "N/A"}</p>
        <p><strong>Policy #:</strong> {profile.insurancePolicyNumber || "N/A"}</p>
        <p><strong>Emergency Contact:</strong> {profile.emergencyContact?.name || "N/A"}</p>
        <p><strong>Emergency Phone:</strong> {profile.emergencyContact?.phone || "N/A"}</p>
        <p><strong>Relation:</strong> {profile.emergencyContact?.relation || "N/A"}</p>
      </div>

      <div className="mt-4 space-y-3">
        <div>
          <strong>Medical History:</strong>
          <div className="flex flex-wrap gap-2 mt-1">
            {profile.medicalHistory?.length > 0 ? (
              profile.medicalHistory.map((item, i) => (
                <Badge key={i} variant="info">{item}</Badge>
              ))
            ) : (
              <span className="text-slate-400 ml-1">None</span>
            )}
          </div>
        </div>

        <div>
          <strong>Chronic Conditions:</strong>
          <div className="flex flex-wrap gap-2 mt-1">
            {profile.chronicConditions?.length > 0 ? (
              profile.chronicConditions.map((item, i) => (
                <Badge key={i} variant="warning">{item}</Badge>
              ))
            ) : (
              <span className="text-slate-400 ml-1">None</span>
            )}
          </div>
        </div>

        <div>
          <strong>Current Medications:</strong>
          <div className="flex flex-wrap gap-2 mt-1">
            {profile.currentMedications?.length > 0 ? (
              profile.currentMedications.map((item, i) => (
                <Badge key={i} variant="primary">{item}</Badge>
              ))
            ) : (
              <span className="text-slate-400 ml-1">None</span>
            )}
          </div>
        </div>

        <div>
          <strong>Allergies:</strong>
          <div className="flex flex-wrap gap-2 mt-1">
            {profile.allergies?.length > 0 ? (
              profile.allergies.map((item, i) => (
                <Badge key={i} variant="danger">{item}</Badge>
              ))
            ) : (
              <span className="text-slate-400 ml-1">None</span>
            )}
          </div>
        </div>

        {profile.notes && (
          <div>
            <strong>Clinical Notes:</strong>
            <p className="mt-1 text-slate-600">{profile.notes}</p>
          </div>
        )}
      </div>
    </Card>
  );
}

export default PatientProfileCard;