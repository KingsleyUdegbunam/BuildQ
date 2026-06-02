import { ValidationIssue } from "../types/query";

function issueSummary(issues: ValidationIssue[]) {
  if (issues.length === 0) {
    return "Valid query";
  }

  const errors = issues.filter((issue) => issue.severity === "error").length;
  return `${errors} ${errors === 1 ? "error" : "errors"}`;
}

export function AppHeader({
  issues,
  schemaLabel,
  theme,
  onToggleTheme,
}: {
  issues: ValidationIssue[];
  schemaLabel: string;
  theme: "light" | "dark";
  onToggleTheme: () => void;
}) {
  const hasErrors = issues.some((issue) => issue.severity === "error");

  return (
    <header className="flex h-11 shrink-0 items-center gap-4 border-b border-[var(--bq-chrome-border)] bg-[var(--bq-chrome)] px-4 text-[var(--bq-chrome-text)]">
      <div className="rounded-md border border-[var(--bq-chrome-border)] bg-[var(--bq-panel)] px-3 py-1.5 text-base font-bold text-[var(--bq-accent)] shadow-sm">BuildQ</div>
      <div className="text-sm font-medium">Visual Query Builder</div>
      <div className="hidden text-xs text-[var(--bq-muted)] md:block">Datasets / {schemaLabel} / Builder</div>
      <span className={`ml-auto rounded-full px-3 py-1 text-xs font-semibold ${hasErrors ? "bg-[var(--bq-danger)] text-white" : "bg-[var(--bq-accent-soft)] text-[var(--bq-accent)]"}`}>
        {issueSummary(issues)}
      </span>
      <button type="button" onClick={onToggleTheme} className="rounded-md bg-[var(--bq-accent)] px-3 py-1.5 text-xs font-semibold text-white">
        {theme === "light" ? "Dark" : "Light"}
      </button>
    </header>
  );
}
