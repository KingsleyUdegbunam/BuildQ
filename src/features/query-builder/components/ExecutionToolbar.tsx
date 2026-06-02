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
    <div className="shrink-0 border-b border-[var(--bq-border)] bg-[var(--bq-panel)] px-6 py-3">
      <div className="flex items-center gap-5">
        <div className="flex h-11 min-w-0 flex-1 rounded-md border border-[var(--bq-border-strong)] bg-[var(--bq-bg)]">
          <BrandSelect ariaLabel="Dataset" value={schemaId} onChange={onSchemaChange} options={schemas.map((item) => ({ label: item.label, value: item.id }))} className="w-36 border-r border-[var(--bq-border)]" variant="flush" />
          <div className="flex min-w-0 flex-1 items-center px-3 font-mono text-sm text-[var(--bq-text)]">Mock dataset: {schema.id}</div>
          <button type="button" onClick={onRun} disabled={hasErrors || isRunning} className="h-full bg-[var(--bq-accent)] px-6 text-sm font-bold text-white hover:bg-[var(--bq-accent-hover)] disabled:opacity-50">
            {isRunning ? "Running..." : "Run Query"}
          </button>
        </div>
        <button type="button" onClick={onUndo} disabled={!canUndo} className="h-11 rounded-md border border-[var(--bq-border)] px-4 text-sm disabled:opacity-40">Undo</button>
        <button type="button" onClick={onRedo} disabled={!canRedo} className="h-11 rounded-md border border-[var(--bq-border)] px-4 text-sm disabled:opacity-40">Redo</button>
      </div>
    </div>
  );
}
