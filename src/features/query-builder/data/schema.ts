import { FieldType, QueryOperator } from "../types/query";

export type SchemaField = {
  label: string;
  type: FieldType;
  operators: QueryOperator[];
  options?: string[];
};

export const userSchema: Record<string, SchemaField> = {
  name: {
    label: "Name",
    type: "string",
    operators: ["equals", "not_equals", "contains", "starts_with"],
  },
  age: {
    label: "Age",
    type: "number",
    operators: ["equals", "not_equals", "greater_than", "less_than", "between"],
  },
  country: {
    label: "Country",
    type: "string",
    operators: ["equals", "not_equals", "contains"],
  },
  status: {
    label: "Status",
    type: "enum",
    operators: ["equals", "not_equals", "in_array"],
    options: ["active", "inactive", "pending"],
  },
  createdAt: {
    label: "Created At",
    type: "date",
    operators: ["equals", "greater_than", "less_than", "between"],
  },
};
