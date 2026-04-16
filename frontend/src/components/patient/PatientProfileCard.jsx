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
    <Card>
      <h3 className="text-lg font-bold mb-3">Patient Info</h3>

      <div className="space-y-2 text-sm">
        <p><strong>Age:</strong> {profile.age || "N/A"}</p>
        <p><strong>Gender:</strong> {profile.gender || "N/A"}</p>
        <p><strong>Address:</strong> {profile.address || "N/A"}</p>

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
      </div>
    </Card>
  );
}

export default PatientProfileCard;