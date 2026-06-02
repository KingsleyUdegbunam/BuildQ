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
  | "is_not_null"
  | "regex";

export type QueryValue =
  | string
  | number
  | boolean
  | null
  | string[]
  | number[]
  | Array<string | number>;

export type QueryRule = {
  id: string;
  type: "rule";
  field: string;
  operator: QueryOperator;
  value: QueryValue;
};

export type QueryGroup = {
  id: string;
  type: "group";
  logic: QueryLogic;
  collapsed: boolean;
};

export type QueryNode = QueryGroup | QueryRule;

export type QueryState = {
  rootId: string;
  nodes: Record<string, QueryNode>;
  childrenByGroupId: Record<string, string[]>;
};

export type NestedQueryGroup = QueryGroup & {
  children: NestedQueryNode[];
};

export type NestedQueryNode = NestedQueryGroup | QueryRule;

export type SchemaField = {
  label: string;
  type: FieldType;
  operators: QueryOperator[];
  options?: string[];
};

export type QuerySchema = {
  id: string;
  label: string;
  description: string;
  fields: Record<string, SchemaField>;
};

export type ValidationSeverity = "error" | "warning";

export type ValidationIssue = {
  id: string;
  nodeId: string;
  severity: ValidationSeverity;
  message: string;
};

export type QueryPreviewFormat = "sql" | "mongo" | "graphql";

export type QueryPreset = {
  id: string;
  name: string;
  description: string;
  query: QueryState;
};
