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
    <header className="flex min-h-11 shrink-0 items-center gap-2 border-b border-[var(--bq-chrome-border)] bg-[var(--bq-chrome)] px-3 py-2 text-[var(--bq-chrome-text)] sm:gap-4 sm:px-4">
      <div className="rounded-md border border-[var(--bq-chrome-border)] bg-[var(--bq-panel)] px-2.5 py-1.5 text-sm font-bold text-[var(--bq-accent)] shadow-sm sm:px-3 sm:text-base">BuildQ</div>
      <div className="hidden text-sm font-medium min-[420px]:block">Visual Query Builder</div>
      <div className="hidden text-xs text-[var(--bq-muted)] md:block">Datasets / {schemaLabel} / Builder</div>
      <span className={`ml-auto whitespace-nowrap rounded-full px-2 py-1 text-xs font-semibold sm:px-3 ${hasErrors ? "bg-[var(--bq-danger)] text-white" : "bg-[var(--bq-accent-soft)] text-[var(--bq-accent)]"}`}>
        {issueSummary(issues)}
      </span>
      <button type="button" onClick={onToggleTheme} className="rounded-md bg-[var(--bq-accent)] px-2.5 py-1.5 text-xs font-semibold text-white sm:px-3">
        {theme === "light" ? "Dark" : "Light"}
      </button>
    </header>
  );
}
