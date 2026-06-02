import { describe, expect, it } from "vitest";
import { userSchema } from "../../data/schema";
import { QueryState } from "../../types/query";
import { validateQuery } from "../query-validation";

function stateWithRule(rule: QueryState["nodes"][string]): QueryState {
  return {
    rootId: "root",
    nodes: {
      root: { id: "root", type: "group", logic: "AND", collapsed: false },
      [rule.id]: rule,
    },
    childrenByGroupId: { root: [rule.id] },
  };
}

describe("validateQuery", () => {
  it("accepts a valid rule tree", () => {
    const issues = validateQuery(
      stateWithRule({
        id: "rule_age",
        type: "rule",
        field: "age",
        operator: "greater_than",
        value: 18,
      }),
      userSchema,
    );

    expect(issues).toEqual([]);
  });

  it("rejects empty groups", () => {
    const issues = validateQuery(
      {
        rootId: "root",
        nodes: {
          root: { id: "root", type: "group", logic: "AND", collapsed: false },
        },
        childrenByGroupId: { root: [] },
      },
      userSchema,
    );

    expect(issues).toContainEqual(
      expect.objectContaining({ message: "Group cannot be empty." }),
    );
  });

  it("rejects invalid ranges and regex patterns", () => {
    expect(
      validateQuery(
        stateWithRule({
          id: "rule_range",
          type: "rule",
          field: "age",
          operator: "between",
          value: [40, 20],
        }),
        userSchema,
      ),
    ).toContainEqual(
      expect.objectContaining({
        message: "Number range start cannot be greater than end.",
      }),
    );

    expect(
      validateQuery(
        stateWithRule({
          id: "rule_regex",
          type: "rule",
          field: "name",
          operator: "regex",
          value: "[",
        }),
        userSchema,
      ),
    ).toContainEqual(
      expect.objectContaining({ message: "Regex pattern is invalid." }),
    );
  });
});
