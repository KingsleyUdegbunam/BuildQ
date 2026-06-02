type Row = Record<string, unknown>;

export function ResultTable({ rows }: { rows: Row[] }) {
  const columns = Object.keys(rows[0] ?? {});

  if (rows.length === 0) {
    return (
      <div className="rounded-lg border border-[var(--bq-border)] bg-[var(--bq-panel)] p-5 text-sm text-[var(--bq-muted)]">
        No matching rows. Adjust the query and run it again.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-md border border-[var(--bq-border)]">
      <div className="max-h-72 overflow-auto">
        <table className="w-full min-w-[560px] border-collapse text-left text-xs">
          <thead className="sticky top-0 bg-[var(--bq-accent-soft)] text-[var(--bq-text)]">
            <tr>
              {columns.map((column) => (
                <th
                  key={column}
                  className="border-b border-[var(--bq-border)] px-3 py-2 font-semibold"
                >
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-[var(--bq-panel)] text-[var(--bq-text)]">
            {rows.map((row, index) => (
              <tr
                key={String(row.id ?? row.orderId ?? index)}
                className="border-b border-[var(--bq-border)]"
              >
                {columns.map((column) => (
                  <td key={column} className="px-3 py-2">
                    {String(row[column])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
