import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { userSchema } from "../../data/schema";
import { QueryState } from "../../types/query";
import { QueryBuilder } from "../QueryBuilder";
import { QueryGroup } from "../QueryGroup";

function noopHandlers() {
  return {
    onAddRule: vi.fn(),
    onAddGroup: vi.fn(),
    onUpdateRule: vi.fn(),
    onUpdateGroupLogic: vi.fn(),
    onToggleGroup: vi.fn(),
    onRemoveNode: vi.fn(),
    onMoveNode: vi.fn(),
    onMoveToGroup: vi.fn(),
    onMoveBeforeNode: vi.fn(),
    onDragStart: vi.fn(),
    onDragEnd: vi.fn(),
    onSelectNode: vi.fn(),
  };
}

describe("query builder UI", () => {
  it("recursively renders nested condition groups and child rules", () => {
    const nestedState: QueryState = {
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
        inner: { id: "inner", type: "group", logic: "OR", collapsed: false },
        status: {
          id: "status",
          type: "rule",
          field: "status",
          operator: "equals",
          value: "active",
        },
      },
      childrenByGroupId: {
        root: ["age", "inner"],
        inner: ["status"],
      },
    };

    render(
      <QueryGroup
        groupId="root"
        state={nestedState}
        schema={userSchema}
        issues={[]}
        draggingNodeId={null}
        selectedNodeId="root"
        {...noopHandlers()}
      />,
    );

    expect(screen.getByText("Root group")).toBeInTheDocument();
    expect(screen.getByText("Group")).toBeInTheDocument();
    expect(screen.getByText("Age")).toBeInTheDocument();
    expect(screen.getByText("Status")).toBeInTheDocument();
    expect(screen.getAllByText("OR").length).toBeGreaterThan(0);
  });

  it("runs the query simulator from the UI and updates execution feedback", async () => {
    const user = userEvent.setup();
    render(<QueryBuilder />);

    await user.click(screen.getByRole("button", { name: /run query/i }));

    expect(screen.getByText("Running")).toBeInTheDocument();

    await waitFor(
      () => {
        expect(screen.getByText(/success \d+ms/i)).toBeInTheDocument();
      },
      { timeout: 1000 },
    );

    expect(screen.getByText("3 matches")).toBeInTheDocument();
    expect(screen.getByText("Ada Johnson")).toBeInTheDocument();
  });

  it("updates schema-driven controls when the dataset changes", async () => {
    const user = userEvent.setup();
    render(<QueryBuilder />);

    await user.click(screen.getByRole("button", { name: "Dataset" }));
    await user.click(screen.getByRole("option", { name: "Orders" }));

    expect(screen.getByText("Mock dataset: orders")).toBeInTheDocument();
    expect(screen.getAllByText("Total").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Region").length).toBeGreaterThan(0);
  });

  it("handles critical builder interactions for theme switching and adding rules", async () => {
    const user = userEvent.setup();
    const { container } = render(<QueryBuilder />);

    await user.click(screen.getByRole("button", { name: "Dark" }));
    expect(container.querySelector("main")).toHaveClass("buildq-theme-dark");

    expect(screen.getAllByTitle("Drag rule")).toHaveLength(2);

    await user.click(screen.getByRole("button", { name: "+ Add condition" }));

    expect(screen.getAllByTitle("Drag rule")).toHaveLength(3);
  });
});
