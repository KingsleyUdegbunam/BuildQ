import type { ChangeEvent, DragEvent, RefObject } from "react";
import {
  QueryPreviewFormat,
  QueryRule,
  QuerySchema,
  QueryState,
  ValidationIssue,
} from "../types/query";
import { NodeInspector } from "./NodeInspector";
import { PreviewPanel } from "./PreviewPanel";
import { QueryCanvasPanel } from "./QueryCanvasPanel";

type QueryWorkspaceProps = {
  activeChildCount: number;
  activeNodeId: string;
  draggingNodeId: string | null;
  importError: string;
  importInputRef: RefObject<HTMLInputElement | null>;
  importStatus: string;
  issues: ValidationIssue[];
  preview: string;
  previewFormat: QueryPreviewFormat;
  query: QueryState;
  schema: QuerySchema;
  onAddGroup: (groupId: string) => void;
  onAddRule: (groupId: string) => void;
  onDragEnd: () => void;
  onDragStart: (nodeId: string, event: DragEvent<HTMLElement>) => void;
  onExport: () => void;
  onFormatChange: (format: QueryPreviewFormat) => void;
  onImportFile: (event: ChangeEvent<HTMLInputElement>) => void;
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

export function QueryWorkspace(props: QueryWorkspaceProps) {
  const activeNode = props.query.nodes[props.activeNodeId];

  return (
    <div className="grid min-w-0 max-w-full grid-cols-1 overflow-x-hidden overflow-y-visible border-b border-[var(--bq-border)] lg:min-h-0 lg:grid-cols-[minmax(0,1fr)_320px] lg:overflow-hidden">
      <QueryCanvasPanel
        activeNodeId={props.activeNodeId}
        draggingNodeId={props.draggingNodeId}
        issues={props.issues}
        query={props.query}
        schema={props.schema}
        onAddGroup={props.onAddGroup}
        onAddRule={props.onAddRule}
        onDragEnd={props.onDragEnd}
        onDragStart={props.onDragStart}
        onMoveBeforeNode={props.onMoveBeforeNode}
        onMoveNode={props.onMoveNode}
        onMoveToGroup={props.onMoveToGroup}
        onRemoveNode={props.onRemoveNode}
        onReset={props.onReset}
        onSelectNode={props.onSelectNode}
        onToggleGroup={props.onToggleGroup}
        onUpdateGroupLogic={props.onUpdateGroupLogic}
        onUpdateRule={props.onUpdateRule}
      />
      <div className="flex max-h-[calc(100dvh-5.5rem)] min-h-0 min-w-0 max-w-full flex-col overflow-x-hidden overflow-y-auto border-t border-[var(--bq-border)] bg-[var(--bq-panel)] lg:max-h-none lg:border-l lg:border-t-0">
        <NodeInspector
          node={activeNode}
          schema={props.schema}
          issues={props.issues}
          childCount={props.activeChildCount}
          onUpdateRule={props.onUpdateRule}
          onUpdateGroupLogic={props.onUpdateGroupLogic}
          onToggleGroup={props.onToggleGroup}
          onRemoveNode={props.onRemoveNode}
        />
        <PreviewPanel
          format={props.previewFormat}
          importError={props.importError}
          importInputRef={props.importInputRef}
          importStatus={props.importStatus}
          preview={props.preview}
          onExport={props.onExport}
          onFormatChange={props.onFormatChange}
          onImportFile={props.onImportFile}
        />
      </div>
    </div>
  );
}
