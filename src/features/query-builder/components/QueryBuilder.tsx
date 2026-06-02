"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { mockOrders, mockUsers } from "../data/mock-user";
import { createPresetQueries } from "../data/presets";
import { querySchemas, userSchema } from "../data/schema";
import {
  QueryPreviewFormat,
  QueryState,
} from "../types/query";
import { executeQuery } from "../lib/query-execute";
import { generateQueryPreview } from "../lib/query-generate";
import { useQueryImportExport } from "../hooks/useQueryImportExport";
import { useQueryShortcuts } from "../hooks/useQueryShortcuts";
import { useThemePersistence } from "../hooks/useThemePersistence";
import {
  addGroupToGroup,
  addRuleToGroup,
  cloneQueryState,
  createDefaultQueryState,
  moveNodeToGroup,
  moveNodeBefore,
  moveNodeWithinGroup,
  removeNode,
  toggleGroupCollapsed,
  updateGroup,
  updateRule,
} from "../lib/query-state";
import { hasBlockingIssues, validateQuery } from "../lib/query-validation";
import { AppHeader } from "./AppHeader";
import { ExecutionResults } from "./ExecutionResults";
import { ExecutionToolbar } from "./ExecutionToolbar";
import { QuerySidebar } from "./QuerySidebar";
import { QueryWorkspace } from "./QueryWorkspace";

type Row = Record<string, unknown>;

const SIDEBAR_MIN_WIDTH = 44;
const SIDEBAR_DEFAULT_WIDTH = 368;

const datasetBySchema: Record<string, Row[]> = {
  users: mockUsers,
  orders: mockOrders,
};

type QueryBuilderProps = {
  initialTheme?: "light" | "dark";
};

export function QueryBuilder({ initialTheme = "light" }: QueryBuilderProps) {
  const [isCompactViewport, setIsCompactViewport] = useState(false);
  const [schemaId, setSchemaId] = useState(userSchema.id);
  const schema = useMemo(
    () => querySchemas.find((item) => item.id === schemaId) ?? userSchema,
    [schemaId],
  );
  const [query, setQuery] = useState<QueryState>(() =>
    createDefaultQueryState(userSchema),
  );
  const [history, setHistory] = useState<QueryState[]>([]);
  const [future, setFuture] = useState<QueryState[]>([]);
  const [previewFormat, setPreviewFormat] = useState<QueryPreviewFormat>("sql");
  const [results, setResults] = useState<Row[]>(() => datasetBySchema.users);
  const [isRunning, setIsRunning] = useState(false);
  const [lastRunMs, setLastRunMs] = useState<number | null>(null);
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);
  const [importError, setImportError] = useState("");
  const [importStatus, setImportStatus] = useState("");
  const [theme, setTheme] = useState<"light" | "dark">(initialTheme);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const importInputRef = useRef<HTMLInputElement>(null);

  const presets = useMemo(() => createPresetQueries(schema), [schema]);
  const issues = useMemo(() => validateQuery(query, schema), [query, schema]);
  const preview = useMemo(
    () => generateQueryPreview(query, schema, previewFormat),
    [query, schema, previewFormat],
  );
  const hasErrors = hasBlockingIssues(issues);
  const activeNodeId = selectedNodeId && query.nodes[selectedNodeId]
    ? selectedNodeId
    : query.rootId;
  const activeNode = query.nodes[activeNodeId];
  const activeChildCount =
    activeNode?.type === "group"
      ? query.childrenByGroupId[activeNode.id]?.length ?? 0
      : 0;

  function applyQuery(nextQuery: QueryState) {
    setHistory((items) => [...items.slice(-19), cloneQueryState(query)]);
    setFuture([]);
    setQuery(nextQuery);
  }

  function resetForSchema(nextSchemaId: string) {
    const nextSchema =
      querySchemas.find((item) => item.id === nextSchemaId) ?? userSchema;
    const nextQuery = createDefaultQueryState(nextSchema);
    setSchemaId(nextSchemaId);
    setQuery(nextQuery);
    setHistory([]);
    setFuture([]);
    setResults(datasetBySchema[nextSchemaId] ?? []);
    setLastRunMs(null);
    setImportError("");
    setImportStatus("");
    setSelectedNodeId(nextQuery.rootId);
  }

  function undo() {
    const previous = history.at(-1);
    if (!previous) {
      return;
    }
    setHistory((items) => items.slice(0, -1));
    setFuture((items) => [cloneQueryState(query), ...items]);
    setQuery(previous);
  }

  function redo() {
    const next = future[0];
    if (!next) {
      return;
    }
    setFuture((items) => items.slice(1));
    setHistory((items) => [...items, cloneQueryState(query)]);
    setQuery(next);
  }

  function runQuery() {
    if (hasErrors) {
      return;
    }

    const startedAt = performance.now();
    setIsRunning(true);
    window.setTimeout(() => {
      setResults(executeQuery(query, schema, datasetBySchema[schema.id] ?? []));
      setLastRunMs(Math.max(1, Math.round(performance.now() - startedAt)));
      setIsRunning(false);
    }, 420);
  }

  const { exportQuery, handleImportFile } = useQueryImportExport({
    activeSchema: schema,
    setImportError,
    setImportStatus,
    applyImportedQuery: (importedQuery, importedSchema) => {
      setSchemaId(importedSchema.id);
      applyQuery(importedQuery);
      setResults(datasetBySchema[importedSchema.id] ?? []);
      setLastRunMs(null);
      setSelectedNodeId(importedQuery.rootId);
    },
  });

  useQueryShortcuts({ onRedo: redo, onRun: runQuery, onUndo: undo });
  useThemePersistence(theme);

  const shellClass =
    theme === "dark" ? "buildq-theme-dark" : "buildq-theme-light";
  const sidebarWidth = isSidebarCollapsed
    ? SIDEBAR_MIN_WIDTH
    : SIDEBAR_DEFAULT_WIDTH;
  const shellGridStyle = isCompactViewport
    ? {
        gridTemplateColumns: "minmax(0, 1fr)",
        gridTemplateRows: isSidebarCollapsed
          ? "44px auto"
          : "minmax(220px, 34dvh) auto",
      }
    : {
        gridTemplateColumns: `${sidebarWidth}px minmax(0, 1fr)`,
      };

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 900px)");

    function updateViewportMode() {
      setIsCompactViewport(mediaQuery.matches);
      if (mediaQuery.matches) {
        setIsSidebarCollapsed(true);
      }
    }

    updateViewportMode();
    mediaQuery.addEventListener("change", updateViewportMode);

    return () => mediaQuery.removeEventListener("change", updateViewportMode);
  }, []);

  return (
    <main
      className={`${shellClass} flex min-h-dvh w-full max-w-full flex-col overflow-x-hidden overflow-y-auto bg-[var(--bq-bg)] text-[var(--bq-text)] lg:h-dvh lg:overflow-hidden`}
    >
      <AppHeader
        issues={issues}
        schemaLabel={schema.label}
        theme={theme}
        onToggleTheme={() =>
          setTheme((value) => (value === "light" ? "dark" : "light"))
        }
      />

      <div
        className="grid min-h-0 w-full max-w-full flex-1 overflow-x-hidden overflow-y-visible transition-[grid-template-columns] duration-200 ease-out lg:overflow-hidden"
        style={shellGridStyle}
      >
        <QuerySidebar
          historyLength={history.length}
          isCompact={isCompactViewport}
          isCollapsed={isSidebarCollapsed}
          presets={presets}
          schema={schema}
          onCollapse={() => setIsSidebarCollapsed(true)}
          onExpand={() => setIsSidebarCollapsed(false)}
          onPresetSelect={(presetQuery) => applyQuery(cloneQueryState(presetQuery))}
        />

        <section className="flex min-h-0 min-w-0 max-w-full flex-col overflow-x-hidden overflow-y-visible bg-[var(--bq-bg)] lg:overflow-hidden">
          <ExecutionToolbar
            canRedo={future.length > 0}
            canUndo={history.length > 0}
            hasErrors={hasErrors}
            isRunning={isRunning}
            schema={schema}
            schemaId={schemaId}
            schemas={querySchemas}
            onRedo={redo}
            onRun={runQuery}
            onSchemaChange={resetForSchema}
            onUndo={undo}
          />
          <div className="grid min-h-0 max-w-full flex-1 grid-rows-[auto_auto] overflow-x-hidden overflow-y-visible lg:grid-rows-[minmax(0,1fr)_auto] lg:overflow-hidden">
            <QueryWorkspace
              activeChildCount={activeChildCount}
              activeNodeId={activeNodeId}
              draggingNodeId={draggingNodeId}
              importError={importError}
              importInputRef={importInputRef}
              importStatus={importStatus}
              issues={issues}
              preview={preview}
              previewFormat={previewFormat}
              query={query}
              schema={schema}
              onAddGroup={(groupId) => applyQuery(addGroupToGroup(query, groupId, schema))}
              onAddRule={(groupId) => applyQuery(addRuleToGroup(query, groupId, schema))}
              onDragEnd={() => setDraggingNodeId(null)}
              onDragStart={(nodeId, event) => {
                event.stopPropagation();
                event.dataTransfer.effectAllowed = "move";
                event.dataTransfer.setData("text/plain", nodeId);
                setDraggingNodeId(nodeId);
              }}
              onExport={() => exportQuery(query, schema.id)}
              onFormatChange={setPreviewFormat}
              onImportFile={handleImportFile}
              onMoveBeforeNode={(nodeId, targetNodeId) => {
                if (!nodeId) return;
                applyQuery(moveNodeBefore(query, nodeId, targetNodeId));
                setDraggingNodeId(null);
              }}
              onMoveNode={(groupId, nodeId, direction) =>
                applyQuery(moveNodeWithinGroup(query, groupId, nodeId, direction))
              }
              onMoveToGroup={(nodeId, groupId) => {
                applyQuery(moveNodeToGroup(query, nodeId, groupId));
                setDraggingNodeId(null);
              }}
              onRemoveNode={(nodeId) => applyQuery(removeNode(query, nodeId))}
              onReset={() => {
                const next = createDefaultQueryState(schema);
                applyQuery(next);
                setResults(datasetBySchema[schema.id] ?? []);
                setLastRunMs(null);
              }}
              onSelectNode={setSelectedNodeId}
              onToggleGroup={(groupId) => applyQuery(toggleGroupCollapsed(query, groupId))}
              onUpdateGroupLogic={(groupId, logic) =>
                applyQuery(updateGroup(query, groupId, { logic }))
              }
              onUpdateRule={(ruleId, updates) => applyQuery(updateRule(query, ruleId, updates))}
            />
            <ExecutionResults
              hasErrors={hasErrors}
              isRunning={isRunning}
              lastRunMs={lastRunMs}
              rows={results}
            />
          </div>
        </section>
      </div>
    </main>
  );
}
