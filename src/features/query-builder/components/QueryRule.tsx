"use client";

import type { DragEvent } from "react";
import { QueryRule as QueryRuleType, QuerySchema, QueryValue, ValidationIssue } from "../types/query";

type QueryRuleProps = {
  rule: QueryRuleType;
  schema: QuerySchema;
  issues: ValidationIssue[];
  isSelected: boolean;
  canMoveUp: boolean;
  canMoveDown: boolean;
  onRemove: () => void;
  onMove: (direction: -1 | 1) => void;
  onDragStart: (event: DragEvent<HTMLDivElement>) => void;
  onDropOnRule: (event: DragEvent<HTMLDivElement>) => void;
  onSelect: () => void;
};

function valueAsInput(value: QueryValue) {
  if (Array.isArray(value)) {
    return value.join(", ");
  }

  return value === null ? "" : String(value);
}

export function QueryRule({
  rule,
  schema,
  issues,
  isSelected,
  canMoveUp,
  canMoveDown,
  onRemove,
  onMove,
  onDragStart,
  onDropOnRule,
  onSelect,
}: QueryRuleProps) {
  const field = schema.fields[rule.field] ?? Object.values(schema.fields)[0];
  const ruleIssues = issues.filter((issue) => issue.nodeId === rule.id);
  const isInvalid = ruleIssues.some((issue) => issue.severity === "error");
  const operatorLabel = rule.operator.replaceAll("_", " ");
  const hidesValue =
    rule.operator === "is_null" || rule.operator === "is_not_null";
  const displayValue = hidesValue ? "no value" : valueAsInput(rule.value);

  return (
    <div
      draggable
      onClick={(event) => {
        event.stopPropagation();
        onSelect();
      }}
      onDragStart={onDragStart}
      onDragOver={(event) => {
        event.preventDefault();
        event.stopPropagation();
      }}
      onDrop={(event) => {
        event.preventDefault();
        event.stopPropagation();
        onDropOnRule(event);
      }}
      className={`group w-[190px] rounded-md border bg-[var(--bq-panel)] p-3 shadow-sm transition ${
        isInvalid
          ? "border-[var(--bq-danger)]"
          : isSelected
            ? "border-[var(--bq-accent)] ring-2 ring-[var(--bq-accent-soft)]"
            : "border-[var(--bq-border)]"
      }`}
    >
      <div className="flex items-start gap-2">
        <span className="cursor-grab rounded border border-[var(--bq-border)] px-1.5 py-1 text-[10px] text-[var(--bq-muted)]" title="Drag rule">
          ::
        </span>
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-semibold text-[var(--bq-text)]">
            {field.label}
          </div>
          <div className="mt-1 truncate text-xs text-[var(--bq-muted)]">
            {operatorLabel} {displayValue}
          </div>
        </div>
      </div>
      <div className="mt-3 flex items-center gap-1 border-t border-[var(--bq-border)] pt-2">
        <span className="rounded bg-[var(--bq-accent-soft)] px-1.5 py-0.5 text-[11px] text-[var(--bq-accent)]">
          {field.type}
        </span>
        <div className="ml-auto flex items-center gap-1 opacity-0 transition group-hover:opacity-100">
          <button
            type="button"
            disabled={!canMoveUp}
            onClick={(event) => {
              event.stopPropagation();
              onMove(-1);
            }}
            className="rounded border border-[var(--bq-border)] px-1.5 py-0.5 text-[11px] text-[var(--bq-text)] disabled:opacity-40"
            title="Move up"
          >
            Up
          </button>
          <button
            type="button"
            disabled={!canMoveDown}
            onClick={(event) => {
              event.stopPropagation();
              onMove(1);
            }}
            className="rounded border border-[var(--bq-border)] px-1.5 py-0.5 text-[11px] text-[var(--bq-text)] disabled:opacity-40"
            title="Move down"
          >
            Down
          </button>
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onRemove();
            }}
            className="rounded border border-[var(--bq-danger)] px-1.5 py-0.5 text-[11px] text-[var(--bq-danger)]"
          >
            Del
          </button>
        </div>
      </div>
      {ruleIssues.length > 0 ? (
        <div className="mt-1.5 text-xs text-[var(--bq-danger)]">
          {ruleIssues.map((issue) => issue.message).join(" ")}
        </div>
      ) : (
        <div className="mt-1.5 text-xs text-[var(--bq-muted)]">
          {field.label} {operatorLabel} {hidesValue ? "" : valueAsInput(rule.value)}
        </div>
      )}
    </div>
  );
}





