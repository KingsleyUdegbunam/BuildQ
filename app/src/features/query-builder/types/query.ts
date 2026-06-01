export type FieldType = "string" | "number" | "date" | "enum" | "boolean";
export type QueryLogic = "AND" | "OR";
export type QueryOperator =
  | "equals"
  | "not_equals"
  | "contains"
  | "starts_with"
  | "greater_than"
  | "less_than"
  | "between"
  | "in_array"
  | "is_null"
  | "is_not_null";

export type QueryRule = {
  id: string;
  type: "rule";
  field: string;
  operator: QueryOperator;
  value: unknown;
};

export type QueryGroup = {
  id: string;
  type: "group";
  logic: QueryLogic;
  children: QueryNode[];
  collapsed?: boolean;
};

export type QueryNode = QueryGroup | QueryRule;
