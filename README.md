# BuildQ Visual Query Builder

BuildQ is a schema-driven visual query builder for constructing complex filters without writing raw query syntax. It supports nested condition groups, live query previews, simulated execution against mock datasets, validation feedback, saved presets, JSON import/export, query history, drag-and-drop reordering, and light/dark mode.

## Live Demo

- GitHub repository: `https://github.com/KingsleyUdegbunam/BuildQ`
- Live deployed URL: `https://myquerybuddy.netlify.app/`
- Demo video: `TBD`

## Objective

The application allows users to visually build database/API-style queries through a graphical interface. Instead of typing SQL, Mongo, or GraphQL filter syntax manually, users can select fields, operators, and values, then group rules recursively with `AND` / `OR` logic.

The core experience is designed around:

- Visual rule creation
- Nested condition groups
- Schema-aware controls
- Real-time query preview
- Simulated query execution
- Dynamic result inspection
- Recursive state and UI handling

## Tech Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Vitest

## Getting Started

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

Run validation commands:

```bash
npm run lint
npm test
npm run build
```

## Feature Coverage

### Dynamic Query Rule Builder

Users can create rules visually with:

- Field selector
- Operator selector
- Value input

The available operators are driven by the selected field type. For example, numeric fields expose comparison operators, enum fields expose dropdown values, boolean fields expose boolean choices, and date fields use date-compatible inputs.

Supported operators include:

- equals
- not equals
- contains
- starts with
- greater than
- less than
- in array
- between
- null checks

### Nested Condition Groups

Users can create nested groups using `AND` and `OR` logic. Groups can contain rules or other groups, which allows query trees such as:

```text
(age > 18 AND country = "Nigeria")
OR
(status = "active" AND purchases > 10)
```

Groups support:

- Unlimited nesting through recursive data structures
- Collapsing and expanding
- Adding conditions dynamically
- Adding inner groups dynamically
- Removing rules and groups
- Reordering rules and groups
- Drag-and-drop movement between compatible groups

### Schema-Driven Query System

The query builder is powered by schema definitions in:

```text
src/features/query-builder/data/schema.ts
```

Each schema defines fields, labels, data types, operators, and enum options. The UI reads that schema to render the correct controls and prevent invalid query combinations.

Current schemas include:

- Users
- Orders

### Live Query Preview

The preview updates whenever the query tree changes. Users can switch between:

- SQL-like syntax
- Mongo-style query objects
- GraphQL-style filters

Preview generation lives in:

```text
src/features/query-builder/lib/query-generate.ts
```

### Query Execution Simulator

Users can run the visual query against local mock datasets. The simulator filters records dynamically and displays:

- Loading state
- Result count
- Matching rows
- Empty state
- Execution timing

Execution logic lives in:

```text
src/features/query-builder/lib/query-execute.ts
```

## Architecture Explanation

The project is organized by feature instead of by generic file type. The query builder owns its components, data, hooks, logic, tests, and types inside:

```text
src/features/query-builder/
```

Important folders:

- `components/` - visual query builder UI
- `data/` - schemas, mock data, presets, default query
- `hooks/` - import/export, shortcuts, theme persistence
- `lib/` - state updates, validation, preview generation, execution
- `types/` - typed query models
- `lib/__tests__/` - unit tests for critical query behavior

This keeps the query builder modular, reusable, and easier to extend.

## Recursive Rendering Strategy

The query UI is rendered recursively through `QueryGroup`.

Each group:

- Looks up its children from the normalized query state
- Renders child rules directly
- Calls `QueryGroup` again for child groups
- Draws visual connectors between related nodes
- Passes update, movement, selection, and drag handlers downward

This allows the interface to support deeply nested logic without hardcoding depth-specific UI.

Relevant files:

```text
src/features/query-builder/components/QueryGroup.tsx
src/features/query-builder/components/QueryRule.tsx
src/features/query-builder/components/QueryCanvasPanel.tsx
```

## State Management Decisions

The query state uses a normalized tree structure instead of deeply nested objects.

The model separates:

- `nodes` - rules and groups by ID
- `childrenByGroupId` - child ordering for each group
- `rootId` - root query group

This structure makes recursive updates safer and more scalable because operations can target node IDs directly while preserving child order.

State updates are immutable and centralized in:

```text
src/features/query-builder/lib/query-update.ts
src/features/query-builder/lib/query-state.ts
```

The UI also supports:

- Undo history
- Redo history
- Selected node inspection
- Dragging state
- Schema switching
- Theme persistence

## Query Engine Design

The query engine is split into focused modules:

- `query-validation.ts` validates query correctness
- `query-generate.ts` creates SQL, Mongo, and GraphQL previews
- `query-execute.ts` filters mock datasets
- `query-import-export.ts` validates imported JSON and exports saved query files
- `query-serialize.ts` prepares query structures for persistence
- `query-factory.ts` creates safe default rules and groups

This separation keeps rendering concerns out of the query logic and makes the behavior easier to test.

## Validation Engine

The validation layer checks query tree correctness before execution.

It handles:

- Empty groups
- Missing rule values
- Invalid field references
- Invalid operators for field types
- Invalid `between` values
- Imported JSON shape safety

Validation issues are surfaced in the UI and block execution when they are errors.

## Performance Optimization Techniques

The application is designed to remain stable with nested conditions and larger datasets.

Current techniques include:

- Normalized state to avoid fragile deep object updates
- Immutable update helpers for predictable state transitions
- Derived values with `useMemo`
- Component isolation between canvas, inspector, preview, toolbar, and results
- Stable node IDs for recursive rendering
- Localized validation and preview generation
- Scroll-contained canvas for large visual trees

## Advanced Interactions

BuildQ includes:

- Drag-and-drop condition reordering
- Drag-and-drop movement between groups
- Keyboard shortcuts for run, undo, and redo
- Collapsible groups
- Query history with undo/redo
- Saved query presets
- Export query JSON to local device
- Import query JSON from local device
- Light/dark mode
- Responsive layout down to 320px

## Testing

Tests focus on the most important system behavior rather than snapshot volume.

Covered areas:

- Query state updates
- Recursive add/update behavior
- Validation behavior
- Query preview generation
- Mock execution
- Import/export validation

Test files:

```text
src/features/query-builder/lib/__tests__/query-update.test.ts
src/features/query-builder/lib/__tests__/query-validation.test.ts
src/features/query-builder/lib/__tests__/query-generate-execute.test.ts
src/features/query-builder/lib/__tests__/query-import-export.test.ts
src/features/query-builder/components/__tests__/query-builder-ui.test.tsx
```

Run tests:

```bash
npm test
```

Current local result:

```text
5 test files passed
15 tests passed
```

## Security and Stability

The implementation avoids executing generated query strings. Query previews are display output only, while execution uses local typed filtering logic.

Stability measures include:

- Schema-driven operator restrictions
- Imported JSON validation
- Safe default query creation
- Guarded node lookup during recursive rendering
- Execution blocked when validation errors exist
- No raw database/API execution

## Responsive UI

The interface supports desktop and mobile layouts.

Desktop:

- Full-width application shell
- Collapsible schema sidebar
- Canvas and inspector/preview side by side
- Execution results pinned below the builder

Mobile:

- Schema panel becomes a compact top row
- Toolbar stacks cleanly
- Canvas becomes a contained scroll surface
- Inspector and preview stack below the canvas
- Page remains readable down to 320px

## Trade-Offs Made

- The simulator uses local mock data instead of a real API so the query engine can be reviewed without backend setup.
- Drag-and-drop is implemented with native browser drag events to keep dependencies light.
- Generated SQL, Mongo, and GraphQL outputs are previews, not executable remote queries.
- Result tables use contained scrolling instead of virtualization because the current mock datasets are small.
- The visual graph favors compact connected nodes over full-width form rows to preserve space for nested conditions.

## Continuous Deployment

The requirement expects deployment through Vercel or Netlify with preview deployments for pull requests and a stable production URL.

Deployment status:

```text
https://myquerybuddy.netlify.app/
```

Once deployed, update the Live Demo section with the production URL.

## Git Workflow

Implementation followed a feature-branch and pull-request workflow. Work was split into meaningful PRs covering:

- Query data model
- State operations
- Query logic
- UI primitives
- Shell panels
- Inspector, preview, and hooks
- Compact graph canvas
- Application wiring
- Core tests
- Preview, execution, and import tests

This satisfies the requirement for multiple meaningful pull requests instead of a single large main-branch change.

## Acceptance Criteria Mapping

- Recursive UI engineering: `QueryGroup` recursively renders nested groups
- Query architecture quality: query logic is isolated in `lib/`
- State management design: normalized query tree with immutable helpers
- Dynamic schema handling: schema-driven controls and operator restrictions
- Query generation correctness: SQL, Mongo, and GraphQL preview generation
- Performance optimization: memoized derived state and component isolation
- UX quality: compact canvas, inspector, preview, presets, responsive layout
- Validation system: centralized validation engine with UI feedback
- Scalability: normalized tree and recursive traversal helpers
- Code quality: modular feature structure with TypeScript
- Unit testing: Vitest coverage for query logic and state behavior
