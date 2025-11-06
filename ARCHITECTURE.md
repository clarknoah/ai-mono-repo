# iAm AI-Native Monorepo Architecture

## Vision

This monorepo is designed with **AI-first principles** to maximize the effectiveness of AI coding agents while maintaining human-readable, maintainable code. Every architectural decision prioritizes:

1. **Context Clarity**: AI agents can quickly understand what code does and where it lives
2. **Spec-Driven Development**: Explicit specifications guide AI implementation
3. **Token Efficiency**: Minimize tokens needed for AI to process and understand code
4. **Type Safety**: Full end-to-end type safety from database to UI
5. **Consistency**: Uniform patterns make AI predictions more accurate

## Core Principles

### 1. Spec-Driven Development (SDD)

Every significant component follows the **Intent → Spec → Plan → Execute** workflow:

- **SPEC.md**: Defines purpose, interface, constraints, and success criteria
- **STANDARDS.md**: Provides implementation patterns and conventions
- **ADR**: Records architectural decisions and their rationale

### 2. Vertical Slice Architecture

Organize by **domain/feature**, not by technical layer:

```
✅ Good: packages/domains/auth/ (contains all auth-related code)
❌ Bad: packages/services/authService.ts, packages/controllers/authController.ts
```

**Benefits for AI**:
- Self-contained context
- Clear boundaries
- Easier to understand scope of changes

### 3. Token-Optimized Structure

**File Naming**:
- Explicit, descriptive names: `userAuthentication.service.ts` not `auth.ts`
- Clear test naming: `userAuthentication.service.unit.test.ts`

**Imports**:
- Explicit imports from source files
- Avoid deep barrel exports initially

**Documentation**:
- Strategic placement at decision points
- Inline for complex logic only

### 4. Single Source of Truth

- **One TypeScript version** across all packages
- **One Node version** for all runtimes
- **Shared ESLint/Prettier** configurations
- **Centralized types** in `@iam/shared-types`

## Technology Stack

### Core Technologies

- **Monorepo**: NX (build system optimization, dependency graph)
- **Language**: TypeScript 5.7+
- **Runtime**: Node 20 LTS
- **Package Manager**: pnpm (efficient, supports workspaces)

### Backend

- **API Framework**: tRPC (end-to-end type safety)
- **Database ORM**: Prisma (type-safe database access)
- **Graph Database**: Neo4j (relationships, sessions)
- **Cache**: Redis (with ioredis client)
- **Jobs/Queue**: BullMQ (Redis-backed job queue)
- **Validation**: Zod (runtime type validation, integrates with tRPC)

### Frontend

- **Web**: React 18+ with Next.js 15
- **Mobile**: React Native with Expo
- **State Management**: TanStack Query (integrates with tRPC)
- **UI Components**: Shared component library

### Testing

- **Unit Tests**: Vitest (fast, ESM-native)
- **E2E Tests**: Playwright
- **Integration Tests**: Testcontainers
- **Performance**: k6

## Directory Structure

```
iam/
├── .github/                    # GitHub workflows, templates
│   ├── workflows/
│   │   ├── ci.yml
│   │   ├── e2e.yml
│   │   └── deploy.yml
│   └── PULL_REQUEST_TEMPLATE.md
│
├── docs/                       # Documentation root
│   ├── adr/                   # Architecture Decision Records
│   │   ├── 001-monorepo-structure.md
│   │   ├── 002-vertical-slice-architecture.md
│   │   └── 003-trpc-over-rest.md
│   ├── specs/                 # Component specifications
│   │   ├── packages/
│   │   ├── runtimes/
│   │   └── platform/
│   ├── standards/             # Standards by layer
│   │   ├── ROOT-STANDARDS.md
│   │   ├── packages/
│   │   ├── runtimes/
│   │   └── tests/
│   └── guides/                # Developer guides
│       ├── getting-started.md
│       ├── adding-domain.md
│       └── ai-development.md
│
├── packages/                   # Reusable packages
│   ├── domains/               # Business domains (Vertical Slices)
│   │   ├── auth/
│   │   │   ├── SPEC.md
│   │   │   ├── src/
│   │   │   │   ├── entities/
│   │   │   │   ├── services/
│   │   │   │   ├── repositories/
│   │   │   │   ├── procedures/    # tRPC procedures
│   │   │   │   ├── validators/    # Zod schemas
│   │   │   │   ├── types/
│   │   │   │   └── index.ts
│   │   │   ├── tests/
│   │   │   └── package.json
│   │   ├── project/
│   │   ├── survey/
│   │   ├── session/
│   │   ├── sequence/
│   │   └── [each domain follows same structure]
│   │
│   ├── platform/              # Platform services
│   │   ├── graph/             # Neo4j integration
│   │   │   ├── SPEC.md
│   │   │   ├── src/
│   │   │   │   ├── client.ts
│   │   │   │   ├── migrations/
│   │   │   │   └── types/
│   │   │   └── package.json
│   │   ├── cache/             # Redis integration
│   │   ├── database/          # Prisma setup
│   │   ├── email/             # Email service
│   │   ├── object-store/      # S3-compatible storage
│   │   └── jobs/              # BullMQ setup
│   │
│   ├── shared/                # Shared utilities
│   │   ├── types/             # Shared TypeScript types
│   │   ├── utils/             # Utility functions
│   │   ├── constants/         # App constants
│   │   └── config/            # Shared configuration
│   │
│   ├── integrations/          # External integrations
│   │   ├── hubspot/
│   │   └── [other-services]/
│   │
│   └── ui/                    # UI packages
│       ├── web/               # Next.js web app
│       ├── mobile/            # React Native app
│       ├── core/              # Core UI logic
│       └── components/        # Shared components
│
├── runtimes/                  # Executable applications
│   ├── api/                   # tRPC API server
│   │   ├── SPEC.md
│   │   ├── src/
│   │   │   ├── server.ts
│   │   │   ├── router.ts      # Root tRPC router
│   │   │   ├── context.ts     # tRPC context
│   │   │   └── middleware/
│   │   └── package.json
│   ├── message-worker/        # BullMQ message worker
│   └── time-worker/           # Scheduled jobs worker
│
├── databases/                 # Database schemas and migrations
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── migrations/
│   └── neo4j/
│       ├── constraints.cypher
│       └── migrations/
│
├── tests/                     # Cross-cutting tests
│   ├── e2e/                   # End-to-end tests
│   ├── integration/           # Integration tests
│   └── performance/           # Performance tests (k6)
│
├── tools/                     # Build tools and scripts
│   ├── generators/            # NX generators for scaffolding
│   └── scripts/               # Utility scripts
│
├── infrastructure/            # Infrastructure as Code
│   ├── docker/
│   │   ├── docker-compose.yml
│   │   └── Dockerfile.*
│   └── pulumi/                # Cloud infrastructure
│
├── .vscode/                   # VS Code settings
│   ├── settings.json
│   └── extensions.json
│
├── nx.json                    # NX configuration
├── package.json               # Root package.json
├── pnpm-workspace.yaml        # pnpm workspace config
├── tsconfig.base.json         # Base TypeScript config
├── .eslintrc.json             # ESLint config
├── .prettierrc                # Prettier config
├── .nvmrc                     # Node version
└── README.md                  # Getting started
```

## Domain Package Structure

Each domain follows a **consistent, AI-friendly pattern**:

```
packages/domains/[domain-name]/
├── SPEC.md                    # Domain specification
├── README.md                  # Usage examples
├── package.json
├── tsconfig.json
├── src/
│   ├── entities/              # Domain entities
│   │   ├── user.entity.ts
│   │   └── STANDARDS.md
│   ├── services/              # Business logic
│   │   ├── userAuthentication.service.ts
│   │   └── STANDARDS.md
│   ├── repositories/          # Data access
│   │   ├── user.repository.ts
│   │   └── STANDARDS.md
│   ├── procedures/            # tRPC procedures
│   │   ├── login.procedure.ts
│   │   ├── register.procedure.ts
│   │   └── STANDARDS.md
│   ├── validators/            # Zod schemas
│   │   ├── loginInput.validator.ts
│   │   └── STANDARDS.md
│   ├── types/                 # Domain types
│   │   └── index.ts
│   ├── errors/                # Domain-specific errors
│   │   └── AuthenticationError.ts
│   └── index.ts               # Public API
└── tests/
    ├── unit/
    │   └── userAuthentication.service.unit.test.ts
    ├── integration/
    │   └── login.integration.test.ts
    └── fixtures/
        └── userData.ts
```

## AI Development Workflow

### 1. Intent Phase
Developer states what they want to achieve:
> "Add password reset functionality to auth domain"

### 2. Spec Phase
AI reads existing SPEC.md and proposes changes:
- New procedures needed
- Database schema changes
- Integration points

### 3. Plan Phase
AI creates detailed implementation plan:
- Files to create/modify
- Tests to write
- Migration scripts needed

### 4. Execute Phase
AI implements following STANDARDS.md:
- Generates code matching existing patterns
- Writes tests
- Updates documentation

## Type Safety Flow

```
Database (Prisma)
    ↓ (generated types)
Repository Layer
    ↓ (domain entities)
Service Layer
    ↓ (business logic)
tRPC Procedures (Zod validators)
    ↓ (API types)
Frontend (TanStack Query)
    ↓ (React components)
UI
```

**Key**: Types flow from database to UI with **zero type assertions** needed.

## Testing Strategy

### Unit Tests
- Test individual services, utilities
- Mock external dependencies
- Fast feedback loop

### Integration Tests
- Test domain slices end-to-end
- Use Testcontainers for real databases
- Verify integration points

### E2E Tests
- Test critical user journeys
- Use Playwright for web
- Test API + UI together

### Performance Tests
- k6 scripts for load testing
- Monitor key endpoints
- Catch performance regressions

## Development Experience

### For Humans
- Clear, predictable structure
- Easy to navigate
- Comprehensive documentation
- Fast feedback (NX caching)

### For AI Agents
- Consistent patterns across codebase
- STANDARDS.md at every level
- SPEC.md for component contracts
- Clear naming conventions
- Minimal token usage for context

## Next Steps

1. Initialize NX workspace
2. Set up base configurations (TypeScript, ESLint, Prettier)
3. Create domain package template
4. Implement first domain (auth) as reference
5. Create NX generators for scaffolding
6. Document AI development workflows

---

**Last Updated**: 2025-11-06
**Status**: Initial Design
**Next Review**: After first domain implementation
