import {
  NestedQueryGroup,
  NestedQueryNode,
  QueryNode,
  QueryState,
} from "../types/query";
import { getNodeChildren } from "./query-update";

export function nestedFromState(
  state: QueryState,
  nodeId = state.rootId,
): NestedQueryNode | null {
  const node = state.nodes[nodeId];
  if (!node) return null;
  if (node.type === "rule") return node;

  return {
    ...node,
    children: getNodeChildren(state, node.id)
      .map((childId) => nestedFromState(state, childId))
      .filter((child): child is NestedQueryNode => Boolean(child)),
  };
}

export function stateFromNested(root: NestedQueryGroup): QueryState {
  const nodes: Record<string, QueryNode> = {};
  const childrenByGroupId: Record<string, string[]> = {};

  function visit(node: NestedQueryNode) {
    if (node.type === "rule") {
      nodes[node.id] = node;
      return;
    }

    const { children, ...group } = node;
    nodes[group.id] = group;
    childrenByGroupId[group.id] = children.map((child) => child.id);
    children.forEach(visit);
  }

  visit(root);
  return { rootId: root.id, nodes, childrenByGroupId };
}

export function cloneQueryState(state: QueryState): QueryState {
  return {
    rootId: state.rootId,
    nodes: Object.fromEntries(
      Object.entries(state.nodes).map(([id, node]) => [id, { ...node }]),
    ),
    childrenByGroupId: Object.fromEntries(
      Object.entries(state.childrenByGroupId).map(([id, children]) => [
        id,
        [...children],
      ]),
    ),
  };
}
