import { useMemo, useState } from "react";
import { Card, Button, Badge, Modal } from "../ui";

function ReportList({ reports, onDelete }) {
  const [previewReport, setPreviewReport] = useState(null);

  const previewType = useMemo(() => {
    if (!previewReport) return null;

    const url = previewReport.fileUrl || "";
    const mime = (previewReport.fileType || "").toLowerCase();

    if (mime.includes("pdf") || /\.pdf($|\?)/i.test(url)) return "pdf";
    if (mime.startsWith("image/") || /\.(png|jpe?g|gif|webp)($|\?)/i.test(url)) {
      return "image";
    }

    return "other";
  }, [previewReport]);

  if (!reports?.length) {
    return (
      <Card border shadow="sm">
        <p className="text-sm text-slate-500">No reports uploaded yet.</p>
      </Card>
    );
  }

  return (
    <>
      <div className="grid gap-4">
        {reports.map((r) => (
          <Card key={r._id} className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between" border shadow="sm">

          <div className="min-w-0">
            <p className="truncate font-semibold text-slate-900">{r.name || r.originalName}</p>
            {r.originalName && (
              <p className="mt-1 truncate text-xs text-slate-500">File: {r.originalName}</p>
            )}

            <div className="mt-2 flex flex-wrap gap-2">
              <Badge variant="info">Report</Badge>
              {r.category && <Badge variant="primary">{r.category}</Badge>}
              <Badge variant="default">
                {new Date(r.createdAt).toLocaleDateString()}
              </Badge>
              {r.fileType && <Badge variant="unverified">{r.fileType}</Badge>}
            </div>

            {r.notes && (
              <p className="mt-2 text-sm text-slate-600">{r.notes}</p>
            )}
          </div>

          <div className="flex gap-2">
            <Button
              size="sm"
              variant="secondary"
              onClick={() => setPreviewReport(r)}
            >
              View
            </Button>

            <Button
              size="sm"
              variant="danger"
              onClick={() => onDelete(r._id)}
            >
              Delete
            </Button>
          </div>

          </Card>
        ))}
      </div>

      <Modal
        isOpen={Boolean(previewReport)}
        onClose={() => setPreviewReport(null)}
        title={previewReport?.name || previewReport?.originalName || "Report Preview"}
        size="xl"
        className="max-w-6xl"
        actions={
          <>
            <a href={previewReport?.fileUrl} target="_blank" rel="noreferrer">
              <Button variant="secondary">Open in new tab</Button>
            </a>
            <Button onClick={() => setPreviewReport(null)}>Close</Button>
          </>
        }
      >
        <p className="mb-3 text-xs text-slate-500">
          File: {previewReport?.originalName || "Unknown file"}
        </p>

        {previewType === "pdf" && (
          <iframe
            title="Report PDF Preview"
            src={previewReport?.fileUrl}
            className="h-[70vh] w-full rounded-lg border border-slate-200"
          />
        )}

        {previewType === "image" && (
          <div className="flex h-[70vh] items-center justify-center rounded-lg border border-slate-200 bg-slate-50 p-2">
            <img
              src={previewReport?.fileUrl}
              alt={previewReport?.name || previewReport?.originalName || "Report"}
              className="max-h-full max-w-full rounded-md object-contain"
            />
          </div>
        )}

        {previewType === "other" && (
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-6 text-sm text-slate-600">
            Preview is not supported for this file type. Use "Open in new tab" to view or download.
          </div>
        )}
      </Modal>
    </>
  );
}

export default ReportList;