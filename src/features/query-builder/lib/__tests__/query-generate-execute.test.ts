import { describe, expect, it } from "vitest";
import { userSchema } from "../../data/schema";
import { QueryState } from "../../types/query";
import { executeQuery } from "../query-execute";
import { generateQueryPreview } from "../query-generate";

const activeAdultsState: QueryState = {
  rootId: "root",
  nodes: {
    root: { id: "root", type: "group", logic: "AND", collapsed: false },
    age: {
      id: "age",
      type: "rule",
      field: "age",
      operator: "greater_than",
      value: 18,
    },
    status: {
      id: "status",
      type: "rule",
      field: "status",
      operator: "equals",
      value: "active",
    },
  },
  childrenByGroupId: { root: ["age", "status"] },
};

describe("query preview and execution", () => {
  it("generates SQL, Mongo and GraphQL previews from the same query tree", () => {
    expect(generateQueryPreview(activeAdultsState, userSchema, "sql")).toContain(
      "WHERE (age > 18 AND status = 'active');",
    );

    expect(generateQueryPreview(activeAdultsState, userSchema, "mongo")).toContain(
      '"$and"',
    );

    expect(generateQueryPreview(activeAdultsState, userSchema, "graphql")).toContain(
      "users(filter:",
    );
  });

  it("executes nested query logic against mock rows", () => {
    const rows = [
      { id: 1, name: "Ada", age: 24, status: "active" },
      { id: 2, name: "Ben", age: 16, status: "active" },
      { id: 3, name: "Chi", age: 31, status: "pending" },
    ];

    expect(executeQuery(activeAdultsState, userSchema, rows)).toEqual([
      rows[0],
    ]);
  });
});
