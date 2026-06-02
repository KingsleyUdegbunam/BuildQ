import {
  QueryRule,
  QuerySchema,
  QueryState,
  QueryValue,
  ValidationIssue,
} from "../types/query";
import { getNodeChildren } from "./query-state";

function issue(
  nodeId: string,
  message: string,
  severity: "error" | "warning" = "error",
): ValidationIssue {
  return {
    id: `${nodeId}_${message}`,
    nodeId,
    severity,
    message,
  };
}

function isBlank(value: QueryValue) {
  return (
    value === null ||
    value === "" ||
    (Array.isArray(value) && value.length === 0)
  );
}

function validateRule(rule: QueryRule, schema: QuerySchema): ValidationIssue[] {
  const field = schema.fields[rule.field];

  if (!field) {
    return [issue(rule.id, `Unknown field "${rule.field}".`)];
  }

  if (!field.operators.includes(rule.operator)) {
    return [
      issue(
        rule.id,
        `${field.label} does not support ${rule.operator.replaceAll("_", " ")}.`,
      ),
    ];
  }

  if (rule.operator === "is_null" || rule.operator === "is_not_null") {
    return [];
  }

  if (rule.operator === "between") {
    if (!Array.isArray(rule.value) || rule.value.length !== 2) {
      return [issue(rule.id, "Between requires a start and end value.")];
    }

    const [start, end] = rule.value;
    if (isBlank(start) || isBlank(end)) {
      return [issue(rule.id, "Between values cannot be empty.")];
    }

    if (field.type === "number" && Number(start) > Number(end)) {
      return [issue(rule.id, "Number range start cannot be greater than end.")];
    }

    if (field.type === "date" && String(start) > String(end)) {
      return [issue(rule.id, "Date range start cannot be after end.")];
    }

    return [];
  }

  if (rule.operator === "in_array") {
    if (!Array.isArray(rule.value) || rule.value.length === 0) {
      return [issue(rule.id, "Array operators need at least one value.")];
    }
    return [];
  }

  if (isBlank(rule.value)) {
    return [issue(rule.id, "Rule value is required.")];
  }

  if (field.type === "number" && Number.isNaN(Number(rule.value))) {
    return [issue(rule.id, "Number fields require numeric values.")];
  }

  if (field.type === "date" && Number.isNaN(Date.parse(String(rule.value)))) {
    return [issue(rule.id, "Date fields require valid dates.")];
  }

  if (rule.operator === "regex") {
    try {
      new RegExp(String(rule.value));
    } catch {
      return [issue(rule.id, "Regex pattern is invalid.")];
    }
  }

  return [];
}

export function validateQuery(
  state: QueryState,
  schema: QuerySchema,
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  function visit(nodeId: string) {
    const node = state.nodes[nodeId];
    if (!node) {
      issues.push(issue(nodeId, "Query tree references a missing node."));
      return;
    }

    if (node.type === "rule") {
      issues.push(...validateRule(node, schema));
      return;
    }

    const children = getNodeChildren(state, node.id);
    if (children.length === 0) {
      issues.push(issue(node.id, "Group cannot be empty."));
    }

    children.forEach(visit);
  }

  if (!state.nodes[state.rootId]) {
    issues.push(issue(state.rootId, "Root group is missing."));
    return issues;
  }

  visit(state.rootId);
  return issues;
}

export function hasBlockingIssues(issues: ValidationIssue[]) {
  return issues.some((issueItem) => issueItem.severity === "error");
}
