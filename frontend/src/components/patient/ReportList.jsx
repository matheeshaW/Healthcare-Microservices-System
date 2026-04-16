import { Card, Button, Badge } from "../ui";

function ReportList({ reports, onDelete }) {
  if (!reports?.length) {
    return (
      <Card border shadow="sm">
        <p className="text-sm text-slate-500">No reports uploaded yet.</p>
      </Card>
    );
  }

  return (
    <div className="grid gap-4">
      {reports.map((r) => (
        <Card key={r._id} className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between" border shadow="sm">

          <div className="min-w-0">
            <p className="truncate font-semibold text-slate-900">{r.originalName}</p>

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
            <a
              href={r.fileUrl}
              target="_blank"
              rel="noreferrer"
            >
              <Button size="sm" variant="secondary">View</Button>
            </a>

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
  );
}

export default ReportList;