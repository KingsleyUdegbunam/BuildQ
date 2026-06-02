import { QueryGroup, QueryRule, QuerySchema, QueryState } from "../types/query";
import { createGroup, createRule } from "./query-factory";

export function getNodeChildren(state: QueryState, groupId: string) {
  return state.childrenByGroupId[groupId] ?? [];
}

export function addRuleToGroup(
  state: QueryState,
  groupId: string,
  schema: QuerySchema,
) {
  const rule = createRule(schema);
  return {
    ...state,
    nodes: { ...state.nodes, [rule.id]: rule },
    childrenByGroupId: {
      ...state.childrenByGroupId,
      [groupId]: [...getNodeChildren(state, groupId), rule.id],
    },
  };
}

export function addGroupToGroup(
  state: QueryState,
  groupId: string,
  schema: QuerySchema,
  logic: "AND" | "OR" = "AND",
) {
  const group = createGroup(logic);
  const rule = createRule(schema);
  return {
    ...state,
    nodes: { ...state.nodes, [group.id]: group, [rule.id]: rule },
    childrenByGroupId: {
      ...state.childrenByGroupId,
      [groupId]: [...getNodeChildren(state, groupId), group.id],
      [group.id]: [rule.id],
    },
  };
}

export function updateRule(
  state: QueryState,
  ruleId: string,
  updates: Partial<Omit<QueryRule, "id" | "type">>,
) {
  const node = state.nodes[ruleId];
  if (!node || node.type !== "rule") return state;
  return { ...state, nodes: { ...state.nodes, [ruleId]: { ...node, ...updates } } };
}

export function updateGroup(
  state: QueryState,
  groupId: string,
  updates: Partial<Omit<QueryGroup, "id" | "type">>,
) {
  const node = state.nodes[groupId];
  if (!node || node.type !== "group") return state;
  return { ...state, nodes: { ...state.nodes, [groupId]: { ...node, ...updates } } };
}

export function toggleGroupCollapsed(state: QueryState, groupId: string) {
  const node = state.nodes[groupId];
  return !node || node.type !== "group"
    ? state
    : updateGroup(state, groupId, { collapsed: !node.collapsed });
}

function collectDescendantIds(state: QueryState, nodeId: string): string[] {
  const node = state.nodes[nodeId];
  if (!node) return [];
  if (node.type === "rule") return [nodeId];
  return [
    nodeId,
    ...getNodeChildren(state, nodeId).flatMap((childId) =>
      collectDescendantIds(state, childId),
    ),
  ];
}

export function removeNode(state: QueryState, nodeId: string) {
  if (nodeId === state.rootId) return state;
  const idsToRemove = new Set(collectDescendantIds(state, nodeId));
  const nodes = Object.fromEntries(
    Object.entries(state.nodes).filter(([id]) => !idsToRemove.has(id)),
  );
  const childrenByGroupId = Object.fromEntries(
    Object.entries(state.childrenByGroupId)
      .filter(([groupId]) => !idsToRemove.has(groupId))
      .map(([groupId, children]) => [
        groupId,
        children.filter((childId) => !idsToRemove.has(childId)),
      ]),
  );
  return { ...state, nodes, childrenByGroupId };
}

export function moveNodeWithinGroup(
  state: QueryState,
  groupId: string,
  nodeId: string,
  direction: -1 | 1,
) {
  const children = getNodeChildren(state, groupId);
  const index = children.indexOf(nodeId);
  const nextIndex = index + direction;
  if (index < 0 || nextIndex < 0 || nextIndex >= children.length) return state;

  const nextChildren = [...children];
  const [removed] = nextChildren.splice(index, 1);
  nextChildren.splice(nextIndex, 0, removed);
  return {
    ...state,
    childrenByGroupId: { ...state.childrenByGroupId, [groupId]: nextChildren },
  };
}

export function moveNodeToGroup(
  state: QueryState,
  nodeId: string,
  targetGroupId: string,
) {
  if (nodeId === state.rootId || nodeId === targetGroupId || state.nodes[targetGroupId]?.type !== "group") return state;
  if (collectDescendantIds(state, nodeId).includes(targetGroupId)) return state;

  const sourceEntry = Object.entries(state.childrenByGroupId).find(([, ids]) =>
    ids.includes(nodeId),
  );
  if (!sourceEntry || sourceEntry[0] === targetGroupId) return state;
  const [sourceGroupId, sourceChildren] = sourceEntry;

  return {
    ...state,
    childrenByGroupId: {
      ...state.childrenByGroupId,
      [sourceGroupId]: sourceChildren.filter((id) => id !== nodeId),
      [targetGroupId]: [...getNodeChildren(state, targetGroupId), nodeId],
    },
  };
}

export function moveNodeBefore(
  state: QueryState,
  nodeId: string,
  targetNodeId: string,
) {
  if (nodeId === state.rootId || nodeId === targetNodeId) return state;
  const node = state.nodes[nodeId];
  const targetNode = state.nodes[targetNodeId];
  if (!node || !targetNode) return state;
  if (node.type === "group" && collectDescendantIds(state, nodeId).includes(targetNodeId)) return state;

  const sourceEntry = Object.entries(state.childrenByGroupId).find(([, ids]) => ids.includes(nodeId));
  const targetEntry = Object.entries(state.childrenByGroupId).find(([, ids]) => ids.includes(targetNodeId));
  if (!sourceEntry || !targetEntry) return state;

  const [sourceGroupId, sourceChildren] = sourceEntry;
  const [targetGroupId, targetChildren] = targetEntry;
  const nextChildrenByGroupId = { ...state.childrenByGroupId };

  if (sourceGroupId === targetGroupId) {
    const withoutMoved = sourceChildren.filter((id) => id !== nodeId);
    const targetIndex = withoutMoved.indexOf(targetNodeId);
    if (targetIndex < 0) return state;
    nextChildrenByGroupId[sourceGroupId] = [
      ...withoutMoved.slice(0, targetIndex),
      nodeId,
      ...withoutMoved.slice(targetIndex),
    ];
  } else {
    const targetIndex = targetChildren.indexOf(targetNodeId);
    if (targetIndex < 0) return state;
    nextChildrenByGroupId[sourceGroupId] = sourceChildren.filter((id) => id !== nodeId);
    nextChildrenByGroupId[targetGroupId] = [
      ...targetChildren.slice(0, targetIndex),
      nodeId,
      ...targetChildren.slice(targetIndex),
    ];
  }

  return { ...state, childrenByGroupId: nextChildrenByGroupId };
}
