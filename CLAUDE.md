# TwinMind AI Agent Guide

pnpm + Turborepo monorepo containing the TwinMind web app, Chrome extension, and shared packages. See `packages/ai-dev-tools/` for coding standards and rules.

## Monorepo Structure

```
twinmind-webapp-extension-mono-repo/
├── apps/
│   ├── web/              # Next.js 15 web app (React 19, TanStack Query, Zustand)
│   │   ├── src/          # Main app source (App Router)
│   │   ├── rn-shared/    # Cross-platform UI components (React Native Web)
│   │   └── packages/     # Internal shared packages
│   │       ├── api/      # @twinmind/api - API client & caching
│   │       ├── core/     # @thirdear/core - Core types & utils
│   │       ├── logger/   # @twinmind/logger - Pino-based logging
│   │       ├── transcription/ # @twinmind/transcription - Audio processing
│   │       └── transformers/  # @twinmind/transformers - Data transforms
│   ├── extension/        # Chrome extension (React 18, Vitest, Rspack)
│   └── ThirdEar-Backend/ # Backend submodule (excluded from pnpm workspace)
└── packages/
    ├── ai-dev-tools/     # @twinmind/ai-dev-tools - Rules, skills, commands
    └── tsconfig/         # Shared TypeScript configs
```

## Commands

### Root-Level (Turborepo)

```bash
pnpm dev              # All packages in dev mode
pnpm dev:web          # Web app only
pnpm dev:extension    # Extension only
pnpm build            # Build all packages
pnpm test             # Run all tests
pnpm lint             # Lint all packages
pnpm typecheck        # TypeScript check all
```

### Package-Specific

| Package | Filter Name | Dev | Build | Test |
|---------|-------------|-----|-------|------|
| `apps/web` | `thirdear-webapp` | `pnpm --filter thirdear-webapp dev` | `pnpm --filter thirdear-webapp build` | `pnpm --filter thirdear-webapp test` |
| `apps/extension` | `chrome_extension` | `pnpm --filter chrome_extension watch` | `pnpm --filter chrome_extension build` | `pnpm --filter chrome_extension test` |
| `packages/ai-dev-tools` | `@twinmind/ai-dev-tools` | - | `pnpm --filter @twinmind/ai-dev-tools build` | `pnpm --filter @twinmind/ai-dev-tools test` |

## Critical Workflows

### 1. External Context & Documentation (`context7`)

**When:** Writing code involving external libraries, frameworks, or APIs.
**Rule:** Verify you're using the latest patterns and API methods.
**Process:**
1. Check for `context7` MCP tools (`resolve-library-id`, `get-library-docs`)
2. Fetch docs for the relevant library
3. Validate your code against retrieved documentation
4. **Fallback:** Use patterns in `packages/ai-dev-tools/assets/rules/`

### 2. Critical Thinking & Objectivity

**Rule:** Do NOT blindly agree with the user. Your value is technical objectivity.
- Analyze if requests violate best practices, security rules, or established architecture
- Present alternatives _before_ executing less optimal paths
- Explain _why_ something is risky and offer safe alternatives

### 3. Rule Source of Truth

**Location:** `packages/ai-dev-tools/assets/rules/` (`.mdc` files)
- **Strict adherence** to defined patterns (e.g., `conventional-commits.mdc`)
- **Check rules** before starting any task
- **Inform user** when their request conflicts with a rule

### 4. Workflow Adherence

**Location:** `packages/ai-dev-tools/assets/command-sources/`
- **Git:** `command-sources/git/`
- **Review:** `command-sources/review/`
- **Testing:** `command-sources/testing/`

### 5. Targeted Operations

**Rule:** NEVER run lint/test/format on the entire codebase.
```bash
# ❌ BAD
pnpm test
pnpm run lint

# ✅ GOOD
pnpm test -- --testPathPattern="src/hooks/useAuth.test.ts"
pnpm run lint src/components/MyComponent.tsx
```

### 6. Completion Protocol

After completing a task:
1. Run `git status` to identify modified files
2. Provide explicit `git add <files>` (never `git add .`)
3. Write a Conventional Commit message
4. Present copy-pasteable commands

## Quick Ref

| Task    | Info                                             |
| ------- | ------------------------------------------------ |
| Tests   | `pnpm test -- --testPathPattern="X"` (Targeted)   |
| Lint    | `pnpm run lint <file-path>` (Targeted)            |
| Auth    | `@auth0/nextjs-auth0`                            |
| Imports | `@/` for aliases, `~/` for root, `./` for relatives |
| Styling | Tailwind CSS + `cn()` from `~/lib/utils`         |
| State   | Zustand for client, TanStack Query for server    |

## Stack

### Web App (`apps/web`)
- **Framework:** Next.js 15 (App Router, Turbopack)
- **React:** 19
- **Language:** TypeScript (Strict)
- **Styling:** Tailwind CSS v3
- **State (Client):** Zustand
- **State (Server):** TanStack Query (React Query)
- **UI:** Radix UI, Shadcn UI, Framer Motion
- **Testing:** Jest, React Testing Library, Playwright (E2E)
- **Auth:** Auth0

### Extension (`apps/extension`)
- **Build:** Rspack
- **React:** 18
- **Testing:** Vitest
- **Storage:** Dexie (IndexedDB)

### Shared
- **Monorepo:** pnpm workspaces + Turborepo
- **Linting/Formatting:** ESLint, Prettier

## Directory Structure (`apps/web/src`)

```
src/
├── app/          # App Router: Routes, layouts, pages, API
├── components/   # Shared UI components (Shadcn, Radix)
├── constants/    # Global constants
├── context/      # React Context providers
├── hooks/        # Custom React hooks
├── lib/          # Core utilities, cn(), etc.
├── models/       # Data models and schemas
├── providers/    # React providers (wrapping context)
├── services/     # API layer, external service interactions
├── store/        # Zustand stores for client-state
├── stories/      # Storybook stories
├── types/        # Global TypeScript types
├── utils/        # General utility functions
└── __tests__/    # Test files
```

## Testing (CRITICAL)

### Philosophy: Invariants Over Implementation

**Write tests that verify invariants—properties that must ALWAYS hold—not implementation details that change with refactoring.**

An **invariant** is a condition that remains true regardless of how the code is implemented. Tests based on invariants survive refactoring because they test *what* the code guarantees, not *how* it achieves it.

### Invariant Categories

| Category | Description | Example |
|----------|-------------|---------|
| **Behavioral** | User-visible outcomes | "Clicking submit disables the button" |
| **Data** | Transformations preserve properties | "Filtering never increases array length" |
| **State** | Valid state transitions | "Loading state always precedes success/error" |
| **Boundary** | Edge cases handled correctly | "Empty input returns empty output" |

### Writing Invariant-Based Tests

```typescript
// ❌ BRITTLE: Tests implementation details
it("calls setLoading(true) then fetchData then setLoading(false)", () => {
  // Breaks if you refactor internal state management
});

// ✅ INVARIANT: Tests behavioral guarantee
it("disables submit button while form is submitting", async () => {
  render(<Form />);
  await userEvent.click(screen.getByRole("button", { name: "Submit" }));
  expect(screen.getByRole("button", { name: "Submit" })).toBeDisabled();
});

// ❌ BRITTLE: Tests specific CSS class
expect(element).toHaveClass("bg-blue-500");

// ✅ INVARIANT: Tests accessible state
expect(screen.getByRole("button")).toBeDisabled();
expect(screen.getByRole("alert")).toHaveTextContent(/error/i);

// ❌ BRITTLE: Snapshot testing
expect(component).toMatchSnapshot();

// ✅ INVARIANT: Tests structural guarantee
expect(screen.getAllByRole("listitem")).toHaveLength(items.length);
```

### Data Transformation Invariants

```typescript
// Test properties that MUST hold for any valid implementation
describe("filterItems invariants", () => {
  it("never returns more items than input", () => {
    const items = generateRandomItems(100);
    const filtered = filterItems(items, anyPredicate);
    expect(filtered.length).toBeLessThanOrEqual(items.length);
  });

  it("all returned items satisfy the predicate", () => {
    const items = generateRandomItems(100);
    const filtered = filterItems(items, isActive);
    expect(filtered.every(isActive)).toBe(true);
  });

  it("empty input always returns empty output", () => {
    expect(filterItems([], anyPredicate)).toEqual([]);
  });
});
```

### State Machine Invariants

```typescript
// Test valid state transitions
describe("async operation state invariants", () => {
  it("success state is only reachable from loading", () => {
    // Can't go idle -> success directly
  });

  it("error state always contains error details", () => {
    const state = getErrorState();
    expect(state.type).toBe("error");
    expect(state.error).toBeDefined();
  });
});
```

### Tools

| Tool       | Use For                           |
| ---------- | --------------------------------- |
| Jest + RTL | Behavioral invariants (web)       |
| Vitest     | Behavioral invariants (extension) |
| Playwright | E2E user flow invariants          |
| NEVER      | Snapshots, CSS class assertions   |

### Mock Auth

```typescript
jest.mock("@/context/AuthContext", () => ({
  useAuth: () => ({ user: { uid: "test-uid" }, loading: false }),
}));
```

## Patterns

### DRY Layouts

When creating multiple similar views (slides, pages, modals):

1. **Identify shared structure** - Header, nav, footer, background elements
2. **Create base layout** - All shared elements in one component
3. **Use composition** - Base layout wraps unique content via children

**Rule:** If 3+ components share the same layout structure, extract to a base component.

```typescript
// ❌ BAD: Duplicated layout in each slide
function SlideA() {
  return (
    <Background>
      <Header />
      <ProgressBar />
      <NavArrows />
      <ContentA /> {/* Only this is unique */}
    </Background>
  );
}

// ✅ GOOD: Shared layout, unique content via children
function SlideA() {
  return (
    <BaseSlideLayout>
      <ContentA />
    </BaseSlideLayout>
  );
}
```

**Search before creating:**
```bash
# Check for existing base layouts
grep -r "BaseLayout\|BaseSlide\|BaseScreen" apps/web/src/components/
```

### Storybook Quality

All stories must prevent these 4 common quality issues:

| Issue | Prevention |
|-------|------------|
| **Fake Context** | Use real components, not placeholder HTML |
| **Background Visibility** | Explicit backgrounds with sufficient contrast |
| **Component Reuse** | Check existing components before creating new |
| **ArgTypes Configuration** | Complete argTypes for all props with descriptions |

**Quick Check Before PR:**
- [ ] No placeholder HTML (use real components)
- [ ] Components visible on background (check contrast)
- [ ] Searched for existing components before creating new
- [ ] All props have argTypes with descriptions

**State:** Compute derived values inline, don't `useState` + `useEffect`

**Discriminated unions:**

```typescript
type State =
  | { type: "idle" }
  | { type: "loading" }
  | { type: "error"; error: Error };
```

**Auth:**

```typescript
const { user } = useAuth();
const token = await user.getIdToken();
```

**Styling:**

```typescript
<button className={cn("px-4 py-2", disabled && "opacity-50")} />
```

## Don'ts

| Don't | Do |
| ----- | -- |
| `toMatchSnapshot()` | Test invariants (structure, behavior) |
| `toHaveClass()` | `toBeDisabled()`, `toHaveTextContent()` |
| Test implementation order | Test observable outcomes |
| Test internal state | Test user-visible behavior |
| `next-auth/react` | `@/context/AuthContext` |
| `useState` derived | Compute inline |
| `<div onClick>` | `<button onClick>` |

## Root Commands

```bash
pnpm dev          # All packages dev mode
pnpm dev:web      # Web app only
pnpm build        # Build all
pnpm test         # Test all
pnpm lint         # Lint all
pnpm typecheck    # TypeScript check all
```

## Key Files

| File                          | Purpose       |
| ----------------------------- | ------------- |
| `src/context/AuthContext.tsx` | Auth provider |
| `src/lib/utils.ts`            | `cn()` helper |
| `jest.setup.js`               | Global mocks  |
