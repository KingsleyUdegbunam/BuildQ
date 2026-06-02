import {
  NestedQueryGroup,
  QueryGroup,
  QueryNode,
  QueryRule,
  QueryState,
} from "../types/query";
import { createId, nestedFromState, stateFromNested } from "./query-state";

type ExportedQueryDocument = {
  version: 1;
  schemaId: string;
  query: NestedQueryGroup | null;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function sanitizeNode(value: unknown, isRoot = false): QueryNode | null {
  if (!isRecord(value) || typeof value.type !== "string") {
    return null;
  }

  if (value.type === "rule") {
    if (
      typeof value.field !== "string" ||
      typeof value.operator !== "string"
    ) {
      return null;
    }

    return {
      id: typeof value.id === "string" ? value.id : createId("rule"),
      type: "rule",
      field: value.field,
      operator: value.operator as QueryRule["operator"],
      value: (value.value ?? null) as QueryRule["value"],
    };
  }

  if (value.type === "group") {
    return {
      id: typeof value.id === "string" ? value.id : createId("group"),
      type: "group",
      logic: value.logic === "OR" ? "OR" : "AND",
      collapsed: isRoot ? false : Boolean(value.collapsed),
    } satisfies QueryGroup;
  }

  return null;
}

function sanitizeNested(value: unknown, isRoot = false): NestedQueryGroup | null {
  const group = sanitizeNode(value, isRoot);
  if (!group || group.type !== "group" || !isRecord(value)) {
    return null;
  }

  const children = Array.isArray(value.children)
    ? value.children
        .map((child) => {
          const node = sanitizeNode(child);
          if (!node) {
            return null;
          }

          if (node.type === "group") {
            return sanitizeNested(child);
          }

          return node;
        })
        .filter(Boolean)
    : [];

  return {
    ...group,
    children: children as NestedQueryGroup["children"],
  };
}

export function exportQueryJson(state: QueryState, schemaId: string) {
  const query = nestedFromState(state);
  const document: ExportedQueryDocument = {
    version: 1,
    schemaId,
    query: query?.type === "group" ? query : null,
  };

  return JSON.stringify(document, null, 2);
}

export function importQueryJson(json: string) {
  try {
    const parsed = JSON.parse(json);
    const schemaId = isRecord(parsed) && typeof parsed.schemaId === "string"
      ? parsed.schemaId
      : null;
    const queryPayload = isRecord(parsed) && "query" in parsed
      ? parsed.query
      : parsed;
    const nested = sanitizeNested(queryPayload, true);

    if (!nested) {
      return { ok: false as const, error: "Imported JSON is not a query group." };
    }

    return { ok: true as const, state: stateFromNested(nested), schemaId };
  } catch {
    return { ok: false as const, error: "Imported JSON is malformed." };
  }
}
