import { QueryRule, QuerySchema, QueryState } from "../types/query";
import { getNodeChildren } from "./query-state";

type Row = Record<string, unknown>;

function compareValues(
  left: string | number | boolean | null,
  right: string | number | boolean | null,
  direction: "gt" | "lt" | "gte" | "lte",
) {
  if (
    (typeof left !== "number" && typeof left !== "string") ||
    (typeof right !== "number" && typeof right !== "string")
  ) {
    return false;
  }

  if (direction === "gt") {
    return left > right;
  }

  if (direction === "lt") {
    return left < right;
  }

  if (direction === "gte") {
    return left >= right;
  }

  return left <= right;
}

function normalizeComparable(value: unknown, fieldType: string): string | number | boolean | null {
  if (fieldType === "number") {
    return Number(value);
  }

  if (fieldType === "date") {
    return String(value);
  }

  if (typeof value === "boolean") {
    return value;
  }

  if (value === null || typeof value === "undefined") {
    return null;
  }

  return String(value);
}

function matchesRule(row: Row, rule: QueryRule, schema: QuerySchema) {
  const field = schema.fields[rule.field];
  if (!field) {
    return false;
  }

  const rowValue = row[rule.field];
  const left = normalizeComparable(rowValue, field.type);
  const right = normalizeComparable(rule.value, field.type);

  switch (rule.operator) {
    case "equals":
      return left === right;
    case "not_equals":
      return left !== right;
    case "contains":
      return String(rowValue ?? "")
        .toLowerCase()
        .includes(String(rule.value).toLowerCase());
    case "starts_with":
      return String(rowValue ?? "")
        .toLowerCase()
        .startsWith(String(rule.value).toLowerCase());
    case "greater_than":
      return compareValues(left, right, "gt");
    case "less_than":
      return compareValues(left, right, "lt");
    case "between":
      if (!Array.isArray(rule.value)) {
        return false;
      }
      return (
        compareValues(left, normalizeComparable(rule.value[0], field.type), "gte") &&
        compareValues(left, normalizeComparable(rule.value[1], field.type), "lte")
      );
    case "in_array":
      return Array.isArray(rule.value)
        ? rule.value.map(String).includes(String(rowValue))
        : false;
    case "is_null":
      return rowValue === null || typeof rowValue === "undefined";
    case "is_not_null":
      return rowValue !== null && typeof rowValue !== "undefined";
    case "regex":
      try {
        return new RegExp(String(rule.value), "i").test(String(rowValue ?? ""));
      } catch {
        return false;
      }
  }
}

function matchesNode(
  row: Row,
  state: QueryState,
  nodeId: string,
  schema: QuerySchema,
): boolean {
  const node = state.nodes[nodeId];
  if (!node) {
    return false;
  }

  if (node.type === "rule") {
    return matchesRule(row, node, schema);
  }

  const children = getNodeChildren(state, node.id);
  if (children.length === 0) {
    return false;
  }

  if (node.logic === "AND") {
    return children.every((childId) => matchesNode(row, state, childId, schema));
  }

  return children.some((childId) => matchesNode(row, state, childId, schema));
}

export function executeQuery(
  state: QueryState,
  schema: QuerySchema,
  rows: Row[],
) {
  return rows.filter((row) => matchesNode(row, state, state.rootId, schema));
}
