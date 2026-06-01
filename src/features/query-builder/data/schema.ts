import { FieldType, QueryOperator } from "../types/query";

export type SchemaField = {
  label: string;
  type: FieldType;
  operators: QueryOperator[];
  options?: string[];
};

export const userSchema: Record<string, SchemaField>;
