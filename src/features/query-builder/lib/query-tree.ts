import { QueryGroup, QueryLogic, QueryNode, QueryRule } from "../types/query";

export function createRule(): QueryRule {
  return {
    id: crypto.randomUUID(),
    type: "rule",
    field: "age",
    operator: "greater_than",
    value: 18,
  };
}

export function createGroup(logic: QueryLogic = "AND"): QueryGroup {
  return {
    id: crypto.randomUUID(),
    type: "group",
    logic,
    children: [createRule()],
  };
}

export function addNodeToGroup(
  group: QueryGroup,
  groupId: string,
  node: QueryNode,
): QueryGroup {
  if (group.id === groupId) {
    return {
      ...group,
      children: [...group.children, node],
    };
  }
  return {
    ...group,
    children: group.children.map((child) => {
      if (child.type === "group") {
        return addNodeToGroup(child, groupId, node);
      }
      return child;
    }),
  };
}
