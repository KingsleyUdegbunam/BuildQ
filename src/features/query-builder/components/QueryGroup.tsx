"use client";

import type { DragEvent } from "react";
import {
  QueryRule as QueryRuleType,
  QuerySchema,
  QueryState,
  ValidationIssue,
} from "../types/query";
import { getNodeChildren } from "../lib/query-state";
import { BrandSelect } from "./BrandSelect";
import { QueryRule } from "./QueryRule";

type QueryGroupProps = {
  groupId: string;
  state: QueryState;
  schema: QuerySchema;
  issues: ValidationIssue[];
  depth?: number;
  draggingNodeId: string | null;
  selectedNodeId: string;
  onAddRule: (groupId: string) => void;
  onAddGroup: (groupId: string) => void;
  onUpdateRule: (
    ruleId: string,
    updates: Partial<Omit<QueryRuleType, "id" | "type">>,
  ) => void;
  onUpdateGroupLogic: (groupId: string, logic: "AND" | "OR") => void;
  onToggleGroup: (groupId: string) => void;
  onRemoveNode: (nodeId: string) => void;
  onMoveNode: (groupId: string, nodeId: string, direction: -1 | 1) => void;
  onMoveToGroup: (nodeId: string, groupId: string) => void;
  onMoveBeforeNode: (nodeId: string, targetNodeId: string) => void;
  onDragStart: (nodeId: string, event: DragEvent<HTMLElement>) => void;
  onDragEnd: () => void;
  onSelectNode: (nodeId: string) => void;
};

export function QueryGroup({
  groupId,
  state,
  schema,
  issues,
  depth = 0,
  draggingNodeId,
  selectedNodeId,
  onAddRule,
  onAddGroup,
  onUpdateRule,
  onUpdateGroupLogic,
  onToggleGroup,
  onRemoveNode,
  onMoveNode,
  onMoveToGroup,
  onMoveBeforeNode,
  onDragStart,
  onDragEnd,
  onSelectNode,
}: QueryGroupProps) {
  const group = state.nodes[groupId];
  if (!group || group.type !== "group") {
    return null;
  }

  const children = getNodeChildren(state, groupId);
  const groupIssues = issues.filter((issue) => issue.nodeId === groupId);
  const isRoot = state.rootId === groupId;
  const isSelected = selectedNodeId === groupId;
  const railColor = group.logic === "AND" ? "var(--bq-accent)" : "var(--bq-or)";
  const hasBranches = children.length > 0;

  return (
    <section
      draggable={!isRoot}
      onClick={(event) => {
        event.stopPropagation();
        onSelectNode(groupId);
      }}
      onDragStart={(event) => onDragStart(groupId, event)}
      onDragEnd={onDragEnd}
      onDragOver={(event) => {
        event.preventDefault();
      }}
      onDrop={(event) => {
        event.preventDefault();
        event.stopPropagation();
        const nodeId = event.dataTransfer.getData("text/plain") || draggingNodeId;
        if (nodeId) {
          onMoveToGroup(nodeId, groupId);
        }
      }}
      className={`relative inline-flex w-max items-start gap-5 py-2 pr-6 transition ${
        isSelected
          ? "rounded-lg bg-[var(--bq-accent-soft)] p-2"
          : ""
      }`}
    >
      <div className="relative w-[150px] shrink-0 rounded-md border border-[var(--bq-border)] bg-[var(--bq-panel)] p-3 shadow-sm">
        <div className="flex items-center justify-between gap-2">
          <span
            className="rounded px-2 py-1 text-xs font-bold"
            style={{ backgroundColor: "var(--bq-accent-soft)", color: railColor }}
          >
            {group.logic}
          </span>
          {!isRoot ? (
            <span className="cursor-grab rounded border border-[var(--bq-border)] bg-[var(--bq-panel-soft)] px-1.5 py-1 text-[10px] text-[var(--bq-muted)]">
              ::
            </span>
          ) : null}
        </div>
        <div className="mt-2 text-sm font-semibold text-[var(--bq-text)]">
          {isRoot ? "Root group" : "Group"}
        </div>
        <div className="mt-1 text-xs text-[var(--bq-muted)]">
          {children.length} {children.length === 1 ? "node" : "nodes"}
        </div>
        <div className="mt-3 flex flex-wrap gap-1">
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onToggleGroup(groupId);
            }}
            className="rounded border border-[var(--bq-border)] bg-[var(--bq-panel-soft)] px-2 py-1 text-[11px] font-medium text-[var(--bq-text)]"
            title={group.collapsed ? "Expand group" : "Collapse group"}
          >
            {group.collapsed ? "Open" : "Close"}
          </button>
          <BrandSelect
            ariaLabel="Group logic"
            value={group.logic}
            onChange={(logic) => onUpdateGroupLogic(groupId, logic)}
            options={[
              { label: "AND", value: "AND" },
              { label: "OR", value: "OR" },
            ]}
            className="w-20"
          />
          {!isRoot ? (
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                onRemoveNode(groupId);
              }}
              className="rounded border border-[var(--bq-danger)] px-2 py-1 text-[11px] font-semibold text-[var(--bq-danger)]"
            >
              Del
            </button>
          ) : null}
        </div>
      </div>
      {groupIssues.length > 0 ? (
        <div className="absolute left-0 top-full mt-1 text-xs text-[var(--bq-danger)]">
          {groupIssues.map((issue) => issue.message).join(" ")}
        </div>
      ) : null}
      {!group.collapsed ? (
        <div className="relative flex items-start">
          <div
            aria-hidden="true"
            className="absolute -left-5 top-[52px] h-px w-5"
            style={{ backgroundColor: railColor }}
          />
          <div className="relative space-y-4 pl-5">
            {hasBranches ? (
              <div
                aria-hidden="true"
                className="absolute left-0 top-[42px] bottom-[22px] w-px"
                style={{ backgroundColor: railColor }}
              />
            ) : null}
            {children.map((childId, index) => {
              const child = state.nodes[childId];
              if (!child) {
                return null;
              }

              if (child.type === "group") {
                return (
                  <div key={child.id} className="relative">
                    <div
                      aria-hidden="true"
                      className="absolute -left-5 top-1/2 h-px w-5"
                      style={{ backgroundColor: railColor }}
                    />
                  <QueryGroup
                    groupId={child.id}
                    state={state}
                    schema={schema}
                    issues={issues}
                    depth={depth + 1}
                    draggingNodeId={draggingNodeId}
                    selectedNodeId={selectedNodeId}
                    onAddRule={onAddRule}
                    onAddGroup={onAddGroup}
                    onUpdateRule={onUpdateRule}
                    onUpdateGroupLogic={onUpdateGroupLogic}
                    onToggleGroup={onToggleGroup}
                  onRemoveNode={onRemoveNode}
                  onMoveNode={onMoveNode}
                  onMoveToGroup={onMoveToGroup}
                  onMoveBeforeNode={onMoveBeforeNode}
                  onDragStart={onDragStart}
                  onDragEnd={onDragEnd}
                  onSelectNode={onSelectNode}
                />
                  </div>
                );
              }

              return (
                <div key={child.id} className="relative">
                  <div
                    aria-hidden="true"
                    className="absolute -left-5 top-1/2 h-px w-5"
                    style={{ backgroundColor: railColor }}
                  />
                <QueryRule
                  rule={child}
                  schema={schema}
                  issues={issues}
                  isSelected={selectedNodeId === child.id}
                  canMoveUp={index > 0}
                  canMoveDown={index < children.length - 1}
                onRemove={() => onRemoveNode(child.id)}
                onMove={(direction) => onMoveNode(groupId, child.id, direction)}
                onDragStart={(event) => onDragStart(child.id, event)}
                onDropOnRule={(event) => {
                  const nodeId = event.dataTransfer.getData("text/plain") || draggingNodeId;
                  if (nodeId) {
                    onMoveBeforeNode(nodeId, child.id);
                  }
                }}
                onSelect={() => onSelectNode(child.id)}
              />
                </div>
              );
            })}
            <div className="relative flex flex-wrap items-center gap-2">
              <div
                aria-hidden="true"
                className="absolute -left-5 top-1/2 h-px w-5"
                style={{ backgroundColor: railColor }}
              />
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                onAddRule(groupId);
              }}
              className="rounded-md border border-dashed border-[var(--bq-border)] bg-[var(--bq-panel)] px-3 py-2 text-xs font-semibold text-[var(--bq-accent)]"
            >
              + Add condition
            </button>
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                onAddGroup(groupId);
              }}
              className="rounded-md border border-dashed border-[var(--bq-border)] bg-[var(--bq-panel)] px-3 py-2 text-xs font-semibold text-[var(--bq-text)]"
            >
              + Add inner group
            </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}





