<!--
SYNC IMPACT REPORT
==================
Version Change: Initial → 1.0.0
Modified Principles: N/A (initial creation)
Added Sections:
  - Core Principles (5 principles)
  - Development Workflow
  - Quality Gates
  - Technology Standards
Removed Sections: N/A (initial creation)
Templates Requiring Updates:
  ✅ plan-template.md: Constitution Check section needs specific gates aligned with new principles
  ✅ tasks-template.md: Test-first enforcement and Storybook story tasks for all components
  ✅ spec-template.md: Add TDD and component story requirements to acceptance criteria
Follow-up TODOs: N/A
-->

# AI Nexus Constitution

## Core Principles

### I. Test-Driven Development (TDD)

TDD is NON-NEGOTIABLE. All development follows the strict Red-Green-Refactor cycle:

- **Red**: Write a failing test that defines desired behavior before any implementation code
- **Green**: Write the minimal implementation to make the test pass
- **Refactor**: Improve code quality without changing behavior, keeping tests green

**Frontend Tests**: Use `bun test` for React component tests. Every component MUST have unit tests covering rendering, props variations, user interactions, and edge cases.

**Backend Tests**: Use `pytest` for Python tests. Write unit tests for all services, integration tests for API endpoints, and contract tests for external interfaces.

**Rationale**: TDD produces better-designed code, serves as living documentation, catches regressions early, and enables fearless refactoring. Tests are the safety net that allows rapid development without breaking existing functionality.

### II. Human-Written Code

All code MUST be written by humans. AI-assisted suggestions from LLMs, IDE completions, or code generation tools are PROHIBITED.

- Code reviews must verify human authorship and understanding
- Developers must be able to explain every line of code they submit
- Copy-pasting from AI-generated code blocks is forbidden
- Use AI only for documentation, learning, and conceptual understanding—never for direct code insertion

**Rationale**: Human-written code ensures deep understanding, maintainability, and avoids hidden complexity or subtle bugs that AI-generated code may introduce. This project is a practice ground for building genuine engineering skills.

### III. Component Documentation (Storybook)

Every React component MUST have comprehensive Storybook stories demonstrating all variants, states, and interactions.

- Stories cover default state, all props combinations, edge cases, and user interactions
- Use stories as living documentation during development
- Storybook serves as the single source of truth for component behavior
- Component APIs are documented through story metadata and controls

**Storybook Stories**:
- Install Storybook: `bunx storybook@latest init`
- Write stories in `.stories.tsx` files alongside components
- Run with: `bun run storybook`

**Rationale**: Storybook provides visual documentation, enables isolated component development, facilitates design system consistency, and serves as automated component regression testing.

### IV. Modern Technology Stack

Use cutting-edge tools and practices that represent industry best practices for 2025+.

**Runtime & Tooling**:
- Bun for all JavaScript/TypeScript execution (no Node.js, no npm)
- `bun test` for frontend testing (no Jest, no Vitest)
- `bun build` for bundling (no webpack, no esbuild)
- `bun install` for package management
- Python 3.13+ with `uv` for backend package management

**Frontend**:
- Next.js 16+ with App Router and React Server Components
- React 19+ with concurrent features
- Tailwind CSS v4+ for styling (no custom CSS files when possible)
- shadcn/ui components as the base component library
- TypeScript 5+ with strict mode enabled

**Backend**:
- Python 3.13+ with FastAPI for REST APIs
- Async/await patterns throughout
- Type hints on all function signatures
- Pydantic v2+ for data validation
- SQLAlchemy 2.0+ with async support for database access

**Rationale**: Modern tools provide better performance, developer experience, and reflect current industry standards. Using the latest versions ensures this project remains relevant for learning and demonstration purposes.

### V. Type Safety & Validation

Strong typing is mandatory across the entire stack.

- TypeScript strict mode in frontend—all `any` types are forbidden
- Python type hints on all functions, classes, and method signatures
- Pydantic models for all API request/response schemas
- Runtime validation at all external boundaries (API endpoints, webhooks, etc.)
- Database schema validation through ORM migrations

**Rationale**: Type safety catches bugs at compile/build time, serves as inline documentation, enables better IDE autocomplete and refactoring, and reduces runtime errors in production.

## Development Workflow

### Test-First Discipline

1. Write failing tests (unit, integration, or contract tests)
2. Verify tests fail (`bun test` or `pytest`)
3. Implement minimal code to pass tests
4. Run tests again to confirm green state
5. Refactor while maintaining green tests
6. Commit with tests and implementation together

### Component Development

1. Create component file with TypeScript interface for props
2. Write unit tests covering all scenarios
3. Create Storybook stories demonstrating all variants
4. Implement component following TDD cycle
5. Verify Storybook renders all stories correctly
6. Run type check and tests
7. Submit for review

### Git Workflow

- Feature branches from `main` with descriptive names: `feature/tdd-user-authentication`
- Commit messages follow Conventional Commits: `feat: add login form`, `fix: resolve type error in user service`
- Each commit must pass tests and type checking locally
- Pull requests must include tests, Storybook stories, and pass all CI checks

## Quality Gates

### Pre-Commit Checks (Mandatory)

Every commit MUST pass the following checks locally:

**Frontend**:
```bash
bun test                    # All tests pass
bun run typecheck          # TypeScript compilation succeeds
bun run lint               # ESLint passes (if configured)
```

**Backend**:
```bash
pytest                     # All tests pass
mypy backend/              # Type checking succeeds
ruff check backend/        # Linting passes
```

### Pull Request Requirements

PRs MUST include:
- Tests that verify the new behavior
- Storybook stories for new/modified React components
- Type-safe implementation with no `any` or type ignores
- Clear commit history with logical grouping
- Passing all quality gate checks

### Blocked Violations

PRs will be rejected if they:
- Skip test writing before implementation
- Include AI-generated code without thorough human review
- Add components without Storybook stories
- Use deprecated or non-modern tooling
- Introduce type errors or suppress type warnings

## Technology Standards

### Frontend Stack

- **Runtime**: Bun 1.2+
- **Framework**: Next.js 16.1+ with App Router
- **UI**: React 19.2.3+, shadcn/ui components
- **Styling**: Tailwind CSS 4+
- **Testing**: Bun test (`bun test`)
- **Language**: TypeScript 5+ with strict mode
- **Components**: Radix UI primitives, lucide-react icons

### Backend Stack

- **Language**: Python 3.13+
- **Framework**: FastAPI 0.127+ with async support
- **ORM**: SQLAlchemy 2.0+ with async
- **Validation**: Pydantic 2.12+
- **Testing**: pytest with async support
- **Type Checking**: mypy with strict mode
- **Linting**: ruff
- **Package Management**: uv

### Development Tools

- **Version Control**: Git with conventional commits
- **Component Docs**: Storybook 8+
- **Code Editor**: Any editor with TypeScript and Python language servers
- **API Testing**: Built-in FastAPI docs at `/docs`
- **Database**: SQLite via `bun:sqlite` for local dev, PostgreSQL for production

## Governance

### Constitution Authority

This constitution supersedes all other development practices and conventions in this repository. All code reviews, feature planning, and development decisions must verify compliance with these principles.

### Amendment Process

1. Proposed amendments must be documented with clear rationale
2. Amendments require approval via a governance PR with discussion
3. All dependent templates and documentation must be updated
4. Existing code violating new principles must be flagged for remediation
5. Version must be incremented following semantic versioning rules

### Versioning Policy

- **MAJOR** (X.0.0): Backward-incompatible principle removal or redefinition that requires code changes
- **MINOR** (0.X.0): New principle or section added, material expansion of existing principles
- **PATCH** (0.0.X): Clarifications, wording fixes, non-semantic refinements

### Compliance Review

- All PRs must verify constitution compliance in the review checklist
- Violations must be justified with documented reasoning
- Complexity must be explicitly justified in the implementation plan
- Use `CLAUDE.md` for runtime development guidance aligned with this constitution

### Enforcement

- PR reviewers are responsible for constitution compliance verification
- Repeated violations trigger mandatory developer training
- Critical violations (TDD violations, AI-generated code) result in PR rejection
- Quarterly audits to identify systemic compliance issues

**Version**: 1.0.0 | **Ratified**: 2025-12-24 | **Last Amended**: 2025-12-24
