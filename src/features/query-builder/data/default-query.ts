import { QueryGroup } from "../types/query";

export const defaultQuery: QueryGroup = {
  id: "root",
  type: "group",
  logic: "AND",
  children: [
    {
      id: crypto.randomUUID(),
      type: "rule",
      field: "age",
      operator: "greater_than",
      value: 18,
    },
  ],
};
