import { QuerySchema } from "../types/query";
import { BrandSelect } from "./BrandSelect";

export function ExecutionToolbar({
  canRedo,
  canUndo,
  hasErrors,
  isRunning,
  schema,
  schemaId,
  schemas,
  onRedo,
  onRun,
  onSchemaChange,
  onUndo,
}: {
  canRedo: boolean;
  canUndo: boolean;
  hasErrors: boolean;
  isRunning: boolean;
  schema: QuerySchema;
  schemaId: string;
  schemas: QuerySchema[];
  onRedo: () => void;
  onRun: () => void;
  onSchemaChange: (schemaId: string) => void;
  onUndo: () => void;
}) {
  return (
    <div className="shrink-0 border-b border-[var(--bq-border)] bg-[var(--bq-panel)] px-3 py-3 sm:px-4 lg:px-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:gap-5">
        <div className="grid min-w-0 flex-1 grid-cols-1 overflow-hidden rounded-md border border-[var(--bq-border-strong)] bg-[var(--bq-bg)] sm:grid-cols-[150px_minmax(0,1fr)_auto]">
          <BrandSelect ariaLabel="Dataset" value={schemaId} onChange={onSchemaChange} options={schemas.map((item) => ({ label: item.label, value: item.id }))} className="min-w-0 border-b border-[var(--bq-border)] sm:border-b-0 sm:border-r" variant="flush" />
          <div className="flex min-h-11 min-w-0 items-center px-3 font-mono text-xs text-[var(--bq-text)] sm:text-sm">Mock dataset: {schema.id}</div>
          <button type="button" onClick={onRun} disabled={hasErrors || isRunning} className="min-h-11 bg-[var(--bq-accent)] px-5 text-sm font-bold text-white hover:bg-[var(--bq-accent-hover)] disabled:opacity-50">
            {isRunning ? "Running..." : "Run Query"}
          </button>
        </div>
        <div className="grid grid-cols-2 gap-2 lg:flex">
          <button type="button" onClick={onUndo} disabled={!canUndo} className="h-10 rounded-md border border-[var(--bq-border)] px-4 text-sm disabled:opacity-40 lg:h-11">Undo</button>
          <button type="button" onClick={onRedo} disabled={!canRedo} className="h-10 rounded-md border border-[var(--bq-border)] px-4 text-sm disabled:opacity-40 lg:h-11">Redo</button>
        </div>
      </div>
    </div>
  );
}
