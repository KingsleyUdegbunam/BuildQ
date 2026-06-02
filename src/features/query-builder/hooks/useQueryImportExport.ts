import type { ChangeEvent } from "react";
import { QuerySchema, QueryState } from "../types/query";
import { querySchemas } from "../data/schema";
import { exportQueryJson, importQueryJson } from "../lib/query-import-export";
import { hasBlockingIssues, validateQuery } from "../lib/query-validation";

type UseQueryImportExportArgs = {
  activeSchema: QuerySchema;
  applyImportedQuery: (
    query: QueryState,
    schema: QuerySchema,
    sourceName: string,
  ) => void;
  setImportError: (message: string) => void;
  setImportStatus: (message: string) => void;
};

export function useQueryImportExport({
  activeSchema,
  applyImportedQuery,
  setImportError,
  setImportStatus,
}: UseQueryImportExportArgs) {
  function importFromJson(json: string, sourceName = "file") {
    const imported = importQueryJson(json);
    if (!imported.ok) {
      setImportError(imported.error);
      setImportStatus("");
      return;
    }

    const importedSchema =
      querySchemas.find((item) => item.id === imported.schemaId) ?? activeSchema;
    if (hasBlockingIssues(validateQuery(imported.state, importedSchema))) {
      setImportError("Imported query does not match a supported schema.");
      setImportStatus("");
      return;
    }

    setImportError("");
    setImportStatus(`Imported ${importedSchema.label} query from ${sourceName}.`);
    applyImportedQuery(imported.state, importedSchema, sourceName);
  }

  async function handleImportFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    try {
      importFromJson(await file.text(), file.name);
    } catch {
      setImportError("Could not read the selected JSON file.");
      setImportStatus("");
    }
  }

  function exportQuery(query: QueryState, schemaId: string) {
    const json = exportQueryJson(query, schemaId);
    const blob = new Blob([json], { type: "application/json" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");

    setImportError("");
    link.href = url;
    link.download = `buildq-${schemaId}-query.json`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
    setImportStatus(`Downloaded buildq-${schemaId}-query.json.`);
  }

  return { exportQuery, handleImportFile };
}
