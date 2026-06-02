import { QueryPreviewFormat, QueryRule, QuerySchema, QueryState } from "../types/query";
import { getNodeChildren } from "./query-state";

const sqlOperatorMap: Record<QueryRule["operator"], string> = {
  equals: "=",
  not_equals: "!=",
  contains: "LIKE",
  starts_with: "LIKE",
  greater_than: ">",
  less_than: "<",
  between: "BETWEEN",
  in_array: "IN",
  is_null: "IS NULL",
  is_not_null: "IS NOT NULL",
  regex: "REGEXP",
};

function escapeSql(value: unknown) {
  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }

  return `'${String(value).replaceAll("'", "''")}'`;
}

function sqlRule(rule: QueryRule) {
  const operator = sqlOperatorMap[rule.operator];

  if (rule.operator === "is_null" || rule.operator === "is_not_null") {
    return `${rule.field} ${operator}`;
  }

  if (rule.operator === "contains") {
    return `${rule.field} ${operator} ${escapeSql(`%${rule.value}%`)}`;
  }

  if (rule.operator === "starts_with") {
    return `${rule.field} ${operator} ${escapeSql(`${rule.value}%`)}`;
  }

  if (rule.operator === "between" && Array.isArray(rule.value)) {
    return `${rule.field} BETWEEN ${escapeSql(rule.value[0])} AND ${escapeSql(
      rule.value[1],
    )}`;
  }

  if (rule.operator === "in_array" && Array.isArray(rule.value)) {
    return `${rule.field} IN (${rule.value.map(escapeSql).join(", ")})`;
  }

  return `${rule.field} ${operator} ${escapeSql(rule.value)}`;
}

function generateWhereClause(state: QueryState, nodeId: string): string {
  const node = state.nodes[nodeId];
  if (!node) {
    return "";
  }

  if (node.type === "rule") {
    return sqlRule(node);
  }

  const children = getNodeChildren(state, node.id)
    .map((childId) => generateWhereClause(state, childId))
    .filter(Boolean);

  if (children.length === 0) {
    return "";
  }

  return `(${children.join(` ${node.logic} `)})`;
}

function mongoRule(rule: QueryRule) {
  const value = rule.value;

  switch (rule.operator) {
    case "equals":
      return { [rule.field]: value };
    case "not_equals":
      return { [rule.field]: { $ne: value } };
    case "contains":
      return { [rule.field]: { $regex: String(value), $options: "i" } };
    case "starts_with":
      return { [rule.field]: { $regex: `^${String(value)}`, $options: "i" } };
    case "greater_than":
      return { [rule.field]: { $gt: value } };
    case "less_than":
      return { [rule.field]: { $lt: value } };
    case "between":
      if (Array.isArray(value)) {
        return { [rule.field]: { $gte: value[0], $lte: value[1] } };
      }
      return { [rule.field]: value };
    case "in_array":
      return { [rule.field]: { $in: Array.isArray(value) ? value : [value] } };
    case "is_null":
      return { [rule.field]: null };
    case "is_not_null":
      return { [rule.field]: { $ne: null } };
    case "regex":
      return { [rule.field]: { $regex: String(value) } };
  }
}

function mongoNode(state: QueryState, nodeId: string): unknown {
  const node = state.nodes[nodeId];
  if (!node) {
    return {};
  }

  if (node.type === "rule") {
    return mongoRule(node);
  }

  const children = getNodeChildren(state, node.id).map((childId) =>
    mongoNode(state, childId),
  );

  if (children.length === 1) {
    return children[0];
  }

  return { [node.logic === "AND" ? "$and" : "$or"]: children };
}

function graphqlRule(rule: QueryRule) {
  const operatorMap: Record<QueryRule["operator"], string> = {
    equals: "eq",
    not_equals: "neq",
    contains: "contains",
    starts_with: "startsWith",
    greater_than: "gt",
    less_than: "lt",
    between: "between",
    in_array: "in",
    is_null: "isNull",
    is_not_null: "isNotNull",
    regex: "regex",
  };

  return `{ ${rule.field}: { ${operatorMap[rule.operator]}: ${JSON.stringify(
    rule.value,
  )} } }`;
}

function graphqlNode(state: QueryState, nodeId: string): string {
  const node = state.nodes[nodeId];
  if (!node) {
    return "{}";
  }

  if (node.type === "rule") {
    return graphqlRule(node);
  }

  const children = getNodeChildren(state, node.id).map((childId) =>
    graphqlNode(state, childId),
  );

  return `{ ${node.logic.toLowerCase()}: [${children.join(", ")}] }`;
}

export function generateQueryPreview(
  state: QueryState,
  schema: QuerySchema,
  format: QueryPreviewFormat,
) {
  if (format === "sql") {
    const where = generateWhereClause(state, state.rootId);
    return `SELECT *\nFROM ${schema.id}\nWHERE ${where || "1 = 1"};`;
  }

  if (format === "mongo") {
    return JSON.stringify(mongoNode(state, state.rootId), null, 2);
  }

  return `query ${schema.label.replaceAll(" ", "")}Query {\n  ${schema.id}(filter: ${graphqlNode(
    state,
    state.rootId,
  )}) {\n    nodes { id }\n  }\n}`;
}
