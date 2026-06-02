import {
  QueryNode,
  QueryRule,
  QuerySchema,
  QueryValue,
  ValidationIssue,
} from "../types/query";
import {
  defaultOperatorForField,
  defaultValueForField,
} from "../lib/query-state";
import { BrandSelect } from "./BrandSelect";

type NodeInspectorProps = {
  node: QueryNode | undefined;
  schema: QuerySchema;
  issues: ValidationIssue[];
  childCount: number;
  onUpdateRule: (
    ruleId: string,
    updates: Partial<Omit<QueryRule, "id" | "type">>,
  ) => void;
  onUpdateGroupLogic: (groupId: string, logic: "AND" | "OR") => void;
  onToggleGroup: (groupId: string) => void;
  onRemoveNode: (nodeId: string) => void;
};

function parseScalar(rawValue: string, fieldType: string): QueryValue {
  if (fieldType === "number") {
    return rawValue === "" ? "" : Number(rawValue);
  }

  if (fieldType === "boolean") {
    return rawValue === "true";
  }

  return rawValue;
}

function parseRange(rawValue: string, fieldType: string) {
  return fieldType === "number" && rawValue !== "" ? Number(rawValue) : rawValue;
}

function valueAsInput(value: QueryValue) {
  return Array.isArray(value) ? value.join(", ") : value === null ? "" : String(value);
}

function GroupInspector({
  node,
  childCount,
  nodeIssues,
  onUpdateGroupLogic,
  onToggleGroup,
  onRemoveNode,
}: {
  node: Extract<QueryNode, { type: "group" }>;
  childCount: number;
  nodeIssues: ValidationIssue[];
  onUpdateGroupLogic: NodeInspectorProps["onUpdateGroupLogic"];
  onToggleGroup: NodeInspectorProps["onToggleGroup"];
  onRemoveNode: NodeInspectorProps["onRemoveNode"];
}) {
  return (
    <div className="shrink-0 border-b border-[var(--bq-border)] p-4">
      <div className="text-xs font-semibold uppercase text-[var(--bq-muted)]">
        Selected group
      </div>
      <div className="mt-3 space-y-3">
        <label className="block text-xs font-semibold text-[var(--bq-muted)]">
          Logic
          <BrandSelect
            ariaLabel="Selected group logic"
            value={node.logic}
            onChange={(logic) => onUpdateGroupLogic(node.id, logic)}
            options={[{ label: "AND", value: "AND" }, { label: "OR", value: "OR" }]}
            className="mt-1"
          />
        </label>
        <span className="text-sm text-[var(--bq-muted)]">
          {childCount} {childCount === 1 ? "child" : "children"}
        </span>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => onToggleGroup(node.id)}
            className="rounded-md border border-[var(--bq-border)] px-3 py-1.5 text-xs font-semibold"
          >
            {node.collapsed ? "Open group" : "Close group"}
          </button>
          <button
            type="button"
            onClick={() => onRemoveNode(node.id)}
            className="rounded-md border border-[var(--bq-danger)] px-3 py-1.5 text-xs font-semibold text-[var(--bq-danger)]"
          >
            Remove
          </button>
        </div>
      </div>
      {nodeIssues.length > 0 ? (
        <div className="mt-3 rounded-md border border-[var(--bq-danger)] p-2 text-xs text-[var(--bq-danger)]">
          {nodeIssues.map((issue) => issue.message).join(" ")}
        </div>
      ) : null}
    </div>
  );
}

function RuleValueControl({
  rule,
  schema,
  onUpdateRule,
}: {
  rule: QueryRule;
  schema: QuerySchema;
  onUpdateRule: NodeInspectorProps["onUpdateRule"];
}) {
  const field = schema.fields[rule.field];
  const fieldType = field?.type ?? "string";

  if (rule.operator === "is_null" || rule.operator === "is_not_null") {
    return (
      <div className="rounded-md bg-[var(--bq-accent-soft)] px-3 py-2 text-xs text-[var(--bq-muted)]">
        This operator does not require a value.
      </div>
    );
  }

  if (rule.operator === "between") {
    const [start = "", end = ""] = Array.isArray(rule.value) ? rule.value : ["", ""];
    return (
      <div className="grid grid-cols-2 gap-2">
        {[start, end].map((value, index) => (
          <input
            key={index}
            aria-label={`${rule.field} range ${index === 0 ? "start" : "end"}`}
            type={fieldType === "number" ? "number" : fieldType === "date" ? "date" : "text"}
            value={valueAsInput(value)}
            onChange={(event) => {
              const next = [parseRange(valueAsInput(start), fieldType), parseRange(valueAsInput(end), fieldType)];
              next[index] = parseRange(event.target.value, fieldType);
              onUpdateRule(rule.id, { value: next });
            }}
            className="min-w-0 rounded-md border border-[var(--bq-border)] bg-[var(--bq-panel-soft)] px-2 py-1.5 text-sm outline-none focus:border-[var(--bq-accent)]"
          />
        ))}
      </div>
    );
  }

  if (rule.operator === "in_array") {
    return (
      <input
        aria-label={`${rule.field} array values`}
        value={valueAsInput(rule.value)}
        placeholder="comma, separated, values"
        onChange={(event) =>
          onUpdateRule(rule.id, {
            value: event.target.value.split(",").map((value) => value.trim()).filter(Boolean),
          })
        }
        className="w-full rounded-md border border-[var(--bq-border)] bg-[var(--bq-panel-soft)] px-2 py-1.5 text-sm outline-none focus:border-[var(--bq-accent)]"
      />
    );
  }

  if (field?.type === "enum" || field?.type === "boolean") {
    const options = field.type === "boolean"
      ? [{ label: "true", value: "true" }, { label: "false", value: "false" }]
      : (field.options ?? []).map((option) => ({ label: option, value: option }));
    return (
      <BrandSelect
        ariaLabel={`${rule.field} value`}
        value={String(rule.value)}
        onChange={(nextValue) =>
          onUpdateRule(rule.id, { value: field.type === "boolean" ? nextValue === "true" : nextValue })
        }
        options={options}
      />
    );
  }

  return (
    <input
      aria-label={`${rule.field} value`}
      type={fieldType === "number" ? "number" : fieldType === "date" ? "date" : "text"}
      value={valueAsInput(rule.value)}
      onChange={(event) => onUpdateRule(rule.id, { value: parseScalar(event.target.value, fieldType) })}
      className="w-full rounded-md border border-[var(--bq-border)] bg-[var(--bq-panel-soft)] px-2 py-1.5 text-sm outline-none focus:border-[var(--bq-accent)]"
    />
  );
}

export function NodeInspector(props: NodeInspectorProps) {
  const { node, schema, issues, childCount, onUpdateRule, onUpdateGroupLogic, onToggleGroup, onRemoveNode } = props;
  if (!node) {
    return <div className="shrink-0 border-b border-[var(--bq-border)] p-4 text-sm text-[var(--bq-muted)]">Select a rule or group to inspect its details.</div>;
  }

  const nodeIssues = issues.filter((issue) => issue.nodeId === node.id);
  if (node.type === "group") {
    return <GroupInspector node={node} childCount={childCount} nodeIssues={nodeIssues} onUpdateGroupLogic={onUpdateGroupLogic} onToggleGroup={onToggleGroup} onRemoveNode={onRemoveNode} />;
  }

  const field = schema.fields[node.field];
  return (
    <div className="shrink-0 border-b border-[var(--bq-border)] p-4">
      <div className="text-xs font-semibold uppercase text-[var(--bq-muted)]">Selected rule</div>
      <div className="mt-3 space-y-3">
        <label className="block text-xs font-semibold text-[var(--bq-muted)]">
          Field
          <BrandSelect ariaLabel="Selected rule field" value={node.field} onChange={(fieldKey) => {
            const nextField = schema.fields[fieldKey];
            onUpdateRule(node.id, { field: fieldKey, operator: defaultOperatorForField(nextField), value: defaultValueForField(nextField) });
          }} options={Object.entries(schema.fields).map(([key, item]) => ({ label: item.label, value: key }))} className="mt-1" />
        </label>
        <label className="block text-xs font-semibold text-[var(--bq-muted)]">
          Operator
          <BrandSelect ariaLabel="Selected rule operator" value={node.operator} onChange={(operator) => {
            const value = operator === "between" ? field?.type === "number" ? [0, 100] : ["", ""] : operator === "in_array" ? [] : operator === "is_null" || operator === "is_not_null" ? null : Array.isArray(node.value) ? defaultValueForField(field) : node.value;
            onUpdateRule(node.id, { operator, value });
          }} options={(field?.operators ?? []).map((operator) => ({ label: operator.replaceAll("_", " "), value: operator }))} className="mt-1" />
        </label>
        <label className="block text-xs font-semibold text-[var(--bq-muted)]">Value<div className="mt-1"><RuleValueControl rule={node} schema={schema} onUpdateRule={onUpdateRule} /></div></label>
        <div className="flex items-center justify-between rounded-md bg-[var(--bq-panel-soft)] px-3 py-2 text-xs"><span className="text-[var(--bq-muted)]">Type</span><span className="rounded bg-[var(--bq-accent-soft)] px-2 py-1 text-[var(--bq-accent)]">{field?.type ?? "unknown"}</span></div>
        <button type="button" onClick={() => onRemoveNode(node.id)} className="rounded-md border border-[var(--bq-danger)] px-3 py-1.5 text-xs font-semibold text-[var(--bq-danger)]">Remove rule</button>
      </div>
      <div className={`mt-3 rounded-md p-2 text-xs ${nodeIssues.length ? "border border-[var(--bq-danger)] text-[var(--bq-danger)]" : "bg-[var(--bq-accent-soft)] text-[var(--bq-accent)]"}`}>
        {nodeIssues.length ? nodeIssues.map((issue) => issue.message).join(" ") : "Rule is valid for the active schema."}
      </div>
    </div>
  );
}
