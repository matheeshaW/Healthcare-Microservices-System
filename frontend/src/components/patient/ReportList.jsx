function ReportList({ reports }) {
  return (
    <div>
      {reports.map((r) => (
        <div key={r._id} className="p-3 border mb-2">
          <p>{r.originalName}</p>

          <a
            href={r.fileUrl}
            target="_blank"
            className="text-blue-500"
          >
            View
          </a>
        </div>
      ))}
    </div>
  );
}

export default ReportList;