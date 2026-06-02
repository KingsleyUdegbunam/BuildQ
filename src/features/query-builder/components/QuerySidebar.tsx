import { QueryPreset, QuerySchema, QueryState } from "../types/query";
import { SchemaBrowser } from "./SchemaBrowser";

type QuerySidebarProps = {
  historyLength: number;
  isCompact: boolean;
  isCollapsed: boolean;
  presets: QueryPreset[];
  schema: QuerySchema;
  onCollapse: () => void;
  onExpand: () => void;
  onPresetSelect: (query: QueryState) => void;
};

function SidebarIcon() {
  return (
    <span className="relative block h-4 w-5 rounded-[3px] border-2 border-current">
      <span className="absolute bottom-0 left-[6px] top-0 border-l-2 border-current" />
    </span>
  );
}

export function QuerySidebar({
  historyLength,
  isCompact,
  isCollapsed,
  presets,
  schema,
  onCollapse,
  onExpand,
  onPresetSelect,
}: QuerySidebarProps) {
  if (isCollapsed) {
    return (
      <aside className="flex min-h-0 flex-col border-r border-[var(--bq-border)] bg-[var(--bq-panel)]">
        <div
          className={`flex h-full w-full items-center gap-3 px-2 py-2 ${
            isCompact ? "flex-row justify-between" : "flex-col"
          }`}
        >
          <button type="button" onClick={onExpand} className="grid size-7 place-items-center rounded-md border border-[var(--bq-border)] text-[var(--bq-muted)] hover:border-[var(--bq-accent)] hover:text-[var(--bq-accent)]" aria-label="Open schema panel" title="Open schema panel">
            <SidebarIcon />
          </button>
          <button type="button" onClick={onExpand} className="flex flex-1 items-center justify-center text-xs font-semibold uppercase tracking-wide text-[var(--bq-muted)] hover:text-[var(--bq-accent)]" aria-label="Open schema panel">
            <span className={isCompact ? "" : "[writing-mode:vertical-rl]"}>Schema</span>
          </button>
        </div>
      </aside>
    );
  }

  return (
    <aside className="flex min-h-0 flex-col border-r border-[var(--bq-border)] bg-[var(--bq-panel)]">
      <div className="min-h-0 flex-1 overflow-auto p-3">
        <div className="mb-3 flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wide text-[var(--bq-muted)]">Workspace</span>
          <button type="button" onClick={onCollapse} className="grid size-7 place-items-center rounded-md border border-[var(--bq-border)] text-[var(--bq-muted)] hover:border-[var(--bq-accent)] hover:text-[var(--bq-accent)]" aria-label="Toggle schema panel" title="Toggle schema panel">
            <SidebarIcon />
          </button>
        </div>
        <SchemaBrowser schema={schema} />
        <div className="mt-5 border-t border-[var(--bq-border)] pt-4">
          <div className="text-xs font-bold uppercase tracking-wide text-[var(--bq-muted)]">Saved query presets</div>
          <div className="mt-3 space-y-2">
            {presets.map((preset) => (
              <button key={preset.id} type="button" onClick={() => onPresetSelect(preset.query)} className="block w-full rounded-md border border-[var(--bq-border)] bg-[var(--bq-panel-soft)] px-3 py-2 text-left text-sm hover:border-[var(--bq-accent)]">
                <span className="block font-semibold">{preset.name}</span>
                <span className="mt-1 block text-xs text-[var(--bq-muted)]">{preset.description}</span>
              </button>
            ))}
          </div>
        </div>
        <div className="mt-5 border-t border-[var(--bq-border)] pt-4">
          <div className="text-xs font-bold uppercase tracking-wide text-[var(--bq-muted)]">Query history</div>
          <div className="mt-2 rounded-md bg-[var(--bq-panel-soft)] px-3 py-2 text-sm">
            <span className="font-semibold">{historyLength}</span> undo step{historyLength === 1 ? "" : "s"} available
          </div>
        </div>
      </div>
    </aside>
  );
}
