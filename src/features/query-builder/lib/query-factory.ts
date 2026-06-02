import {
  QueryGroup,
  QueryLogic,
  QueryOperator,
  QueryRule,
  QuerySchema,
  QueryState,
  QueryValue,
  SchemaField,
} from "../types/query";

const fallbackIds = { current: 0 };

export function createId(prefix: "group" | "rule" = "rule") {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `${prefix}_${crypto.randomUUID()}`;
  }

  fallbackIds.current += 1;
  return `${prefix}_${Date.now()}_${fallbackIds.current}`;
}

export function defaultValueForField(field: SchemaField): QueryValue {
  if (field.type === "number") return 0;
  if (field.type === "boolean") return true;
  if (field.type === "enum") return field.options?.[0] ?? "";
  if (field.type === "date") return new Date().toISOString().slice(0, 10);
  return "";
}

export function defaultOperatorForField(field: SchemaField): QueryOperator {
  return field.operators[0] ?? "equals";
}

export function createRule(schema: QuerySchema, fieldKey?: string): QueryRule {
  const fallbackFieldKey = Object.keys(schema.fields)[0];
  const selectedField =
    fieldKey && schema.fields[fieldKey] ? fieldKey : fallbackFieldKey;
  const field = schema.fields[selectedField];

  return {
    id: createId("rule"),
    type: "rule",
    field: selectedField,
    operator: defaultOperatorForField(field),
    value: defaultValueForField(field),
  };
}

export function createGroup(logic: QueryLogic = "AND"): QueryGroup {
  return {
    id: createId("group"),
    type: "group",
    logic,
    collapsed: false,
  };
}

export function createDefaultQueryState(schema: QuerySchema): QueryState {
  const root = createGroup("AND");
  const fieldKeys = Object.keys(schema.fields);
  const numericField =
    fieldKeys.find((key) => schema.fields[key].type === "number") ?? fieldKeys[0];
  const secondaryField =
    fieldKeys.find((key) => schema.fields[key].type === "enum") ??
    fieldKeys.find((key) => key !== numericField) ??
    numericField;
  const firstRule = createRule(schema, numericField);
  const firstField = schema.fields[firstRule.field];

  if (firstField.operators.includes("greater_than")) {
    firstRule.operator = "greater_than";
    firstRule.value =
      firstField.type === "number" ? 18 : defaultValueForField(firstField);
  }

  const secondRule = createRule(schema, secondaryField);
  const secondField = schema.fields[secondRule.field];
  secondRule.operator = secondField.operators.includes("equals")
    ? "equals"
    : defaultOperatorForField(secondField);

  return {
    rootId: root.id,
    nodes: { [root.id]: root, [firstRule.id]: firstRule, [secondRule.id]: secondRule },
    childrenByGroupId: { [root.id]: [firstRule.id, secondRule.id] },
  };
}
