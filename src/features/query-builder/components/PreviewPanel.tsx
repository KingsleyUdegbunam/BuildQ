import type { ChangeEvent, RefObject } from "react";
import { QueryPreviewFormat } from "../types/query";

export function PreviewPanel({
  format,
  importError,
  importInputRef,
  importStatus,
  preview,
  onExport,
  onFormatChange,
  onImportFile,
}: {
  format: QueryPreviewFormat;
  importError: string;
  importInputRef: RefObject<HTMLInputElement | null>;
  importStatus: string;
  preview: string;
  onExport: () => void;
  onFormatChange: (format: QueryPreviewFormat) => void;
  onImportFile: (event: ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <>
      <div className="flex h-11 shrink-0 items-center justify-between border-b border-[var(--bq-border)] px-4">
        <div className="text-xs font-semibold uppercase text-[var(--bq-muted)]">Preview</div>
        <div className="flex rounded-md border border-[var(--bq-border)] bg-[var(--bq-panel-soft)] p-1">
          {(["sql", "mongo", "graphql"] as QueryPreviewFormat[]).map((item) => (
            <button key={item} type="button" onClick={() => onFormatChange(item)} className={`rounded px-2 py-1 text-xs font-semibold ${format === item ? "bg-[var(--bq-accent)] text-white" : "text-[var(--bq-muted)]"}`}>
              {item}
            </button>
          ))}
        </div>
      </div>
      <pre className="h-56 shrink-0 overflow-y-auto overflow-x-hidden whitespace-pre-wrap break-words bg-[var(--bq-code)] p-5 font-mono text-xs leading-5 text-[var(--bq-chrome-text)]">
        {preview}
      </pre>
      <details className="group shrink-0 border-t border-[var(--bq-border)]">
        <summary className="flex h-10 items-center justify-between px-4 text-xs font-semibold uppercase tracking-wide text-[var(--bq-muted)]">
          <span>Import / export JSON</span>
          <span className="text-[var(--bq-accent)] group-open:hidden">Open</span>
          <span className="hidden text-[var(--bq-accent)] group-open:inline">Close</span>
        </summary>
        <div className="border-t border-[var(--bq-border)] p-3">
          <input ref={importInputRef} type="file" accept="application/json,.json" onChange={onImportFile} className="hidden" />
          {importError ? <div className="mt-2 text-xs text-[var(--bq-danger)]">{importError}</div> : null}
          {importStatus ? <div className="mt-2 text-xs text-[var(--bq-accent)]">{importStatus}</div> : null}
          <div className="flex gap-2">
            <button type="button" onClick={() => importInputRef.current?.click()} className="rounded-md bg-[var(--bq-accent)] px-3 py-1.5 text-xs font-semibold text-white">Import file</button>
            <button type="button" onClick={onExport} className="rounded-md border border-[var(--bq-border)] px-3 py-1.5 text-xs font-semibold">Export file</button>
          </div>
        </div>
      </details>
    </>
  );
}
