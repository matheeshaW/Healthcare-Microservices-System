import { useState } from "react";
import { Button, Card } from "../ui";

function ReportUploader({ onUpload }) {
  const [file, setFile] = useState(null);
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const categories = ["Lab", "Imaging", "Discharge", "Other"];

  const handleUpload = async () => {
    if (!file) {
      alert("Please choose a file first");
      return;
    }

    if (!name.trim()) {
      alert("Please enter a report name");
      return;
    }

    try {
      setSubmitting(true);
      await onUpload(file, { name: name.trim(), category, notes });
      setFile(null);
      setName("");
      setCategory("");
      setNotes("");
      alert("Report uploaded successfully");
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to upload report");
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass = "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200";

  return (
    <Card border shadow="sm" className="mb-6">
      <h3 className="mb-1 text-lg font-bold text-slate-900">Upload Medical Report</h3>
      <p className="mb-4 text-sm text-slate-600">
        Attach your test result, scan, prescription, or discharge summary.
      </p>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-semibold text-slate-700">
            Report Name
          </label>
          <input
            className={inputClass}
            type="text"
            placeholder="e.g. Blood Test - March 2026"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-semibold text-slate-700">
            Report File
          </label>
          <input
            className={inputClass}
            type="file"
            onChange={(e) => setFile(e.target.files[0] || null)}
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-semibold text-slate-700">
            Category
          </label>
          <select
            className={inputClass}
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="">Select category</option>
            {categories.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-4">
        <label className="mb-1 block text-sm font-semibold text-slate-700">
          Notes (optional)
        </label>
        <textarea
          className={inputClass}
          rows={3}
          placeholder="Add a short note for this report"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </div>

      <div className="mt-4 flex justify-end">
        <Button onClick={handleUpload} loading={submitting} disabled={!file || !name.trim()}>
          Upload Report
        </Button>
      </div>
    </Card>
  );
}

export default ReportUploader;