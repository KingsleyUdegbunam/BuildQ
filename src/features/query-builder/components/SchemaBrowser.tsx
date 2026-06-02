import { QuerySchema } from "../types/query";

export function SchemaBrowser({ schema }: { schema: QuerySchema }) {
  return (
    <details open className="group">
      <summary className="flex items-center justify-between rounded-md px-1 py-2 text-xs font-bold uppercase tracking-wide text-[var(--bq-muted)]">
        <span>Tables</span>
        <span className="text-[10px] transition group-open:rotate-90">›</span>
      </summary>
      <div className="rounded-lg border border-[var(--bq-border)] bg-[var(--bq-panel-soft)]">
        <div className="border-b border-[var(--bq-border)] px-3 py-2">
          <div className="text-sm font-semibold">{schema.label}</div>
          <p className="mt-1 text-xs text-[var(--bq-muted)]">
            {schema.description}
          </p>
        </div>
        <div className="divide-y divide-[var(--bq-border)]">
          {Object.entries(schema.fields).map(([key, field]) => (
            <div
              key={key}
              className="flex items-center justify-between gap-3 px-3 py-2 text-sm hover:bg-[var(--bq-panel-muted)]"
            >
              <span className="min-w-0 truncate">{field.label}</span>
              <span className="rounded bg-[var(--bq-accent-soft)] px-1.5 py-0.5 text-[11px] text-[var(--bq-accent)]">
                {field.type}
              </span>
            </div>
          ))}
        </div>
      </div>
    </details>
  );
}
