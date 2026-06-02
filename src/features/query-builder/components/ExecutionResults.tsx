import { ResultTable } from "./ResultTable";

type Row = Record<string, unknown>;

export function ExecutionResults({
  hasErrors,
  isRunning,
  lastRunMs,
  rows,
}: {
  hasErrors: boolean;
  isRunning: boolean;
  lastRunMs: number | null;
  rows: Row[];
}) {
  return (
    <section className="flex max-h-[220px] min-h-[152px] flex-col bg-[var(--bq-panel)]">
      <div className="flex h-9 shrink-0 items-center gap-3 border-b border-[var(--bq-border)] px-5">
        <span className="font-semibold">Execution Results</span>
        <span className={`rounded-full px-3 py-1 text-xs ${hasErrors ? "bg-[var(--bq-panel-muted)] text-[var(--bq-muted)]" : "bg-[var(--bq-accent-soft)] text-[var(--bq-accent)]"}`}>
          {isRunning ? "Running" : lastRunMs ? `Success ${lastRunMs}ms` : "Ready"}
        </span>
        <span className="ml-auto rounded-full bg-[var(--bq-accent-soft)] px-3 py-1 text-xs text-[var(--bq-accent)]">
          {rows.length} {rows.length === 1 ? "match" : "matches"}
        </span>
      </div>
      <div className="min-h-0 flex-1 overflow-auto px-5 py-2">
        <ResultTable rows={rows} />
      </div>
    </section>
  );
}
