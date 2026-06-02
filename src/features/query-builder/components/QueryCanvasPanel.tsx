import type { DragEvent } from "react";
import { QueryRule, QuerySchema, QueryState, ValidationIssue } from "../types/query";
import { QueryGroup } from "./QueryGroup";

type QueryCanvasPanelProps = {
  activeNodeId: string;
  draggingNodeId: string | null;
  issues: ValidationIssue[];
  query: QueryState;
  schema: QuerySchema;
  onAddGroup: (groupId: string) => void;
  onAddRule: (groupId: string) => void;
  onDragEnd: () => void;
  onDragStart: (nodeId: string, event: DragEvent<HTMLElement>) => void;
  onMoveBeforeNode: (nodeId: string, targetNodeId: string) => void;
  onMoveNode: (groupId: string, nodeId: string, direction: -1 | 1) => void;
  onMoveToGroup: (nodeId: string, groupId: string) => void;
  onRemoveNode: (nodeId: string) => void;
  onReset: () => void;
  onSelectNode: (nodeId: string) => void;
  onToggleGroup: (groupId: string) => void;
  onUpdateGroupLogic: (groupId: string, logic: "AND" | "OR") => void;
  onUpdateRule: (
    ruleId: string,
    updates: Partial<Omit<QueryRule, "id" | "type">>,
  ) => void;
};

export function QueryCanvasPanel({
  activeNodeId,
  draggingNodeId,
  issues,
  query,
  schema,
  onAddGroup,
  onAddRule,
  onDragEnd,
  onDragStart,
  onMoveBeforeNode,
  onMoveNode,
  onMoveToGroup,
  onRemoveNode,
  onReset,
  onSelectNode,
  onToggleGroup,
  onUpdateGroupLogic,
  onUpdateRule,
}: QueryCanvasPanelProps) {
  return (
    <div className="flex min-h-0 flex-col overflow-hidden">
      <div className="flex h-12 shrink-0 items-center justify-between border-b border-[var(--bq-border)] bg-[var(--bq-bg)] px-5">
        <h1 className="text-base font-semibold">Query Builder</h1>
        <button type="button" onClick={onReset} className="rounded-md border border-[var(--bq-border)] px-3 py-1.5 text-xs">
          Reset
        </button>
      </div>
      <div className="buildq-canvas-grid min-h-0 flex-1 overflow-auto p-7">
        <QueryGroup
          groupId={query.rootId}
          state={query}
          schema={schema}
          issues={issues}
          draggingNodeId={draggingNodeId}
          selectedNodeId={activeNodeId}
          onAddRule={onAddRule}
          onAddGroup={onAddGroup}
          onUpdateRule={onUpdateRule}
          onUpdateGroupLogic={onUpdateGroupLogic}
          onToggleGroup={onToggleGroup}
          onRemoveNode={onRemoveNode}
          onMoveNode={onMoveNode}
          onMoveBeforeNode={onMoveBeforeNode}
          onMoveToGroup={onMoveToGroup}
          onDragStart={onDragStart}
          onDragEnd={onDragEnd}
          onSelectNode={onSelectNode}
        />
      </div>
    </div>
  );
}
