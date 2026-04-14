import { useState } from "react";
import { uploadReport } from "../../api/patient.api";

function ReportUploader({ onUpload }) {
  const [file, setFile] = useState(null);

  const handleUpload = async () => {
    const formData = new FormData();
    formData.append("file", file);

    await uploadReport(formData);

    alert("Uploaded!");
    onUpload();
  };

  return (
    <div className="mb-4">
      <input className="border p-2" type="file" onChange={(e) => setFile(e.target.files[0])} />
      <button onClick={handleUpload} className="bg-blue-500 px-3 py-1 rounded">
        Upload
      </button>
    </div>
  );
}

export default ReportUploader;