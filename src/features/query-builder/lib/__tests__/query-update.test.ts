import { describe, expect, it } from "vitest";
import { userSchema } from "../../data/schema";
import {
  addGroupToGroup,
  addRuleToGroup,
  createDefaultQueryState,
  getNodeChildren,
  moveNodeBefore,
  moveNodeToGroup,
  moveNodeWithinGroup,
  removeNode,
} from "../query-state";

describe("query state updates", () => {
  it("adds rules and groups to a target group", () => {
    const initial = createDefaultQueryState(userSchema);
    const withRule = addRuleToGroup(initial, initial.rootId, userSchema);
    const withGroup = addGroupToGroup(withRule, withRule.rootId, userSchema);

    expect(getNodeChildren(withRule, withRule.rootId)).toHaveLength(3);
    expect(getNodeChildren(withGroup, withGroup.rootId)).toHaveLength(4);

    const addedGroupId = getNodeChildren(withGroup, withGroup.rootId).at(-1);
    expect(addedGroupId).toBeDefined();
    expect(withGroup.nodes[addedGroupId!]?.type).toBe("group");
    expect(getNodeChildren(withGroup, addedGroupId!)).toHaveLength(1);
  });

  it("reorders nodes within a group and before another node", () => {
    const state = createDefaultQueryState(userSchema);
    const expanded = addRuleToGroup(state, state.rootId, userSchema);
    const [first, second, third] = getNodeChildren(expanded, expanded.rootId);

    const movedDown = moveNodeWithinGroup(expanded, expanded.rootId, first, 1);
    expect(getNodeChildren(movedDown, movedDown.rootId).slice(0, 2)).toEqual([
      second,
      first,
    ]);

    const movedBefore = moveNodeBefore(expanded, third, first);
    expect(getNodeChildren(movedBefore, movedBefore.rootId).slice(0, 2)).toEqual([
      third,
      first,
    ]);
  });

  it("moves nodes between groups and prevents moving a group into itself", () => {
    const rootState = createDefaultQueryState(userSchema);
    const withGroup = addGroupToGroup(rootState, rootState.rootId, userSchema);
    const rootChildren = getNodeChildren(withGroup, withGroup.rootId);
    const childRuleId = rootChildren[0];
    const groupId = rootChildren.at(-1)!;

    const moved = moveNodeToGroup(withGroup, childRuleId, groupId);
    expect(getNodeChildren(moved, groupId)).toContain(childRuleId);
    expect(getNodeChildren(moved, moved.rootId)).not.toContain(childRuleId);

    const blocked = moveNodeToGroup(moved, groupId, groupId);
    expect(blocked).toBe(moved);
  });

  it("removes a nested group and its descendants", () => {
    const rootState = createDefaultQueryState(userSchema);
    const withGroup = addGroupToGroup(rootState, rootState.rootId, userSchema);
    const groupId = getNodeChildren(withGroup, withGroup.rootId).at(-1)!;
    const nestedRuleId = getNodeChildren(withGroup, groupId)[0];

    const next = removeNode(withGroup, groupId);

    expect(next.nodes[groupId]).toBeUndefined();
    expect(next.nodes[nestedRuleId]).toBeUndefined();
    expect(getNodeChildren(next, next.rootId)).not.toContain(groupId);
  });
});
