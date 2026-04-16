import { Card, Button, Badge } from "../ui";

function ReportList({ reports, onDelete }) {
  return (
    <div className="grid gap-4">
      {reports.map((r) => (
        <Card key={r._id} className="flex justify-between items-center">

          <div>
            <p className="font-semibold">{r.originalName}</p>

            <div className="flex gap-2 mt-1">
              <Badge variant="info">Report</Badge>
              <Badge variant="default">
                {new Date(r.createdAt).toLocaleDateString()}
              </Badge>
            </div>
          </div>

          <div className="flex gap-2">
            <a
              href={r.fileUrl}
              target="_blank"
              rel="noreferrer"
            >
              <Button size="sm">View</Button>
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