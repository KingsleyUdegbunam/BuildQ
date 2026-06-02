import { QuerySchema } from "../types/query";

export const userSchema: QuerySchema = {
  id: "users",
  label: "Users",
  description: "Customer profile and purchasing activity.",
  fields: {
    name: {
      label: "Name",
      type: "string",
      operators: [
        "equals",
        "not_equals",
        "contains",
        "starts_with",
        "in_array",
        "regex",
        "is_null",
        "is_not_null",
      ],
    },
    age: {
      label: "Age",
      type: "number",
      operators: [
        "equals",
        "not_equals",
        "greater_than",
        "less_than",
        "between",
        "in_array",
        "is_null",
        "is_not_null",
      ],
    },
    country: {
      label: "Country",
      type: "string",
      operators: [
        "equals",
        "not_equals",
        "contains",
        "starts_with",
        "in_array",
      ],
    },
    status: {
      label: "Status",
      type: "enum",
      operators: ["equals", "not_equals", "in_array", "is_null", "is_not_null"],
      options: ["active", "inactive", "pending", "blocked"],
    },
    purchases: {
      label: "Purchases",
      type: "number",
      operators: ["equals", "greater_than", "less_than", "between"],
    },
    verified: {
      label: "Verified",
      type: "boolean",
      operators: ["equals", "not_equals"],
    },
    createdAt: {
      label: "Created At",
      type: "date",
      operators: [
        "equals",
        "greater_than",
        "less_than",
        "between",
        "is_null",
        "is_not_null",
      ],
    },
  },
};

export const orderSchema: QuerySchema = {
  id: "orders",
  label: "Orders",
  description: "Transaction records for simulated execution.",
  fields: {
    orderId: {
      label: "Order ID",
      type: "string",
      operators: ["equals", "contains", "starts_with"],
    },
    total: {
      label: "Total",
      type: "number",
      operators: ["equals", "greater_than", "less_than", "between"],
    },
    region: {
      label: "Region",
      type: "enum",
      operators: ["equals", "not_equals", "in_array"],
      options: ["Africa", "Europe", "North America", "Asia"],
    },
    paid: {
      label: "Paid",
      type: "boolean",
      operators: ["equals", "not_equals"],
    },
    createdAt: {
      label: "Created At",
      type: "date",
      operators: ["equals", "greater_than", "less_than", "between"],
    },
  },
};

export const querySchemas = [userSchema, orderSchema];
