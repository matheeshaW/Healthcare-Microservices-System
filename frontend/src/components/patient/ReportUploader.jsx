import { useState } from "react";
import { Button, Card } from "../ui";

function ReportUploader({ onUpload }) {
  const [file, setFile] = useState(null);
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [touched, setTouched] = useState({ name: false, file: false, category: false });

  const categories = ["Lab", "Imaging", "Discharge", "Other"];
  const allowedExtensions = ["jpg", "jpeg", "png", "pdf"];
  const allowedMimeTypes = ["image/jpeg", "image/png", "application/pdf"];

  const isSupportedFileType = (selectedFile) => {
    if (!selectedFile) return false;

    const extension = selectedFile.name.split(".").pop()?.toLowerCase() || "";
    const hasAllowedExtension = allowedExtensions.includes(extension);
    const hasAllowedMimeType = allowedMimeTypes.includes(selectedFile.type);

    // Accept either a trusted MIME type or a valid extension to support browser differences.
    return hasAllowedMimeType || hasAllowedExtension;
  };

  const validationErrors = {
    name: !name.trim() ? "Report name is required." : "",
    file: !file
      ? "Report file is required."
      : !isSupportedFileType(file)
        ? "Only JPG, JPEG, PNG, and PDF files are allowed."
        : "",
    category: !category ? "Category is required." : "",
  };

  const hasVisibleWarnings =
    (touched.name && validationErrors.name) ||
    (touched.file && validationErrors.file) ||
    (touched.category && validationErrors.category);

  const handleUpload = async () => {
    if (!file) {
      alert("Please choose a file first");
      return;
    }

    if (!isSupportedFileType(file)) {
      alert("Only JPG, JPEG, PNG, and PDF files are allowed.");
      return;
    }

    if (!name.trim()) {
      alert("Please enter a report name");
      return;
    }

    if (!category) {
      alert("Please select a category");
      return;
    }

    try {
      setSubmitting(true);
      await onUpload(file, { name: name.trim(), category, notes });
      setFile(null);
      setName("");
      setCategory("");
      setNotes("");
      setTouched({ name: false, file: false, category: false });
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

      {hasVisibleWarnings && (
        <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2">
          <p className="text-sm font-semibold text-amber-900">
            Please fill in the highlighted fields below.
          </p>
        </div>
      )}

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
            onBlur={() => setTouched((prev) => ({ ...prev, name: true }))}
          />
          {touched.name && validationErrors.name && (
            <p className="mt-1 text-xs text-red-600">{validationErrors.name}</p>
          )}
        </div>

        <div>
          <label className="mb-1 block text-sm font-semibold text-slate-700">
            Report File
          </label>
          <input
            className={inputClass}
            type="file"
            accept=".jpg,.jpeg,.png,.pdf,image/jpeg,image/png,application/pdf"
            onChange={(e) => {
              setFile(e.target.files[0] || null);
              setTouched((prev) => ({ ...prev, file: true }));
            }}
            onBlur={() => setTouched((prev) => ({ ...prev, file: true }))}
          />
          {touched.file && validationErrors.file && (
            <p className="mt-1 text-xs text-red-600">{validationErrors.file}</p>
          )}
        </div>

        <div>
          <label className="mb-1 block text-sm font-semibold text-slate-700">
            Category
          </label>
          <select
            className={inputClass}
            value={category}
            onChange={(e) => {
              setCategory(e.target.value);
              setTouched((prev) => ({ ...prev, category: true }));
            }}
            onBlur={() => setTouched((prev) => ({ ...prev, category: true }))}
          >
            <option value="">Select category</option>
            {categories.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
          {touched.category && validationErrors.category && (
            <p className="mt-1 text-xs text-red-600">{validationErrors.category}</p>
          )}
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
        <Button onClick={handleUpload} loading={submitting} disabled={!file || !name.trim() || !category || !!validationErrors.file}>
          Upload Report
        </Button>
      </div>
    </Card>
  );
}

export default ReportUploader;