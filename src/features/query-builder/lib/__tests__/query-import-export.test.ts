import { describe, expect, it } from "vitest";
import { userSchema } from "../../data/schema";
import { createDefaultQueryState } from "../query-state";
import { exportQueryJson, importQueryJson } from "../query-import-export";

describe("query import/export", () => {
  it("exports schema metadata and imports the same query tree", () => {
    const state = createDefaultQueryState(userSchema);
    const json = exportQueryJson(state, userSchema.id);
    const parsed = JSON.parse(json);
    const imported = importQueryJson(json);

    expect(parsed.schemaId).toBe("users");
    expect(parsed.version).toBe(1);
    expect(imported.ok).toBe(true);

    if (imported.ok) {
      expect(imported.schemaId).toBe("users");
      expect(imported.state.rootId).toBe(state.rootId);
      expect(Object.keys(imported.state.nodes)).toHaveLength(
        Object.keys(state.nodes).length,
      );
    }
  });

  it("rejects malformed JSON and non-query payloads", () => {
    expect(importQueryJson("{")).toEqual({
      ok: false,
      error: "Imported JSON is malformed.",
    });

    expect(importQueryJson(JSON.stringify({ hello: "world" }))).toEqual({
      ok: false,
      error: "Imported JSON is not a query group.",
    });
  });
});
