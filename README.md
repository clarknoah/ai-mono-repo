# iAm - AI-Native Monorepo

[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue.svg)](https://www.typescriptlang.org/)
[![NX](https://img.shields.io/badge/NX-20.2-blue.svg)](https://nx.dev/)
[![Node](https://img.shields.io/badge/Node-20.18-green.svg)](https://nodejs.org/)

> **An AI-first, spec-driven monorepo designed to maximize AI agent effectiveness while maintaining exceptional developer experience.**

## 🎯 Philosophy

This monorepo is architected with **AI-native principles**:

- **Spec-Driven Development**: Every component has explicit specifications (SPEC.md) that guide AI implementation
- **Token Efficiency**: Minimize context needed for AI to understand and modify code
- **Vertical Slice Architecture**: Self-contained domains that AI can reason about independently
- **Type Safety**: End-to-end type safety from database to UI with zero type assertions
- **Consistency**: Uniform patterns make AI predictions more accurate

## 🤖 For AI Agents

**If you're an AI agent working on this codebase, start here**: [**CLAUDE.md**](./CLAUDE.md)

This file provides optimal context, quick reference, common patterns, and workflows specifically designed for AI comprehension. It will help you navigate the codebase efficiently and follow the correct patterns.

## 🚀 Quick Start

### Prerequisites

- **Node.js**: 20.18+ (use `nvm use` to switch)
- **pnpm**: 9.0+ (`npm install -g pnpm`)

### Installation

```bash
# Install dependencies
pnpm install

# Build all packages
pnpm build

# Run tests
pnpm test

# Start development
pnpm dev
```

## 📁 Project Structure

```
iam/
├── packages/              # Reusable packages
│   ├── domains/          # Business domains (auth, project, survey, etc.)
│   ├── platform/         # Platform services (graph, cache, database, etc.)
│   ├── shared/           # Shared utilities, types, constants
│   ├── integrations/     # External service integrations
│   └── ui/               # UI packages (web, mobile, core)
├── runtimes/             # Executable applications
│   ├── api/              # tRPC API server
│   ├── message-worker/   # BullMQ message worker
│   └── time-worker/      # Scheduled jobs worker
├── databases/            # Database schemas and migrations
├── tests/                # Cross-cutting tests (e2e, integration, performance)
├── tools/                # Build tools and generators
├── infrastructure/       # Infrastructure as Code
└── docs/                 # Documentation, ADRs, specs, standards
```

## 🛠️ Technology Stack

### Core
- **Monorepo**: NX for build optimization and dependency management
- **Language**: TypeScript 5.7+ with strict mode
- **Runtime**: Node.js 20 LTS
- **Package Manager**: pnpm

### Backend
- **API**: tRPC for end-to-end type safety
- **ORM**: Prisma for type-safe database access
- **Graph DB**: Neo4j for relationships and sessions
- **Cache**: Redis with ioredis
- **Jobs**: BullMQ for background job processing
- **Validation**: Zod for runtime type validation

### Frontend
- **Web**: Next.js 15 with React 18
- **Mobile**: React Native with Expo
- **State**: TanStack Query (integrates with tRPC)
- **UI**: Shared component library

### Testing
- **Unit**: Vitest
- **E2E**: Playwright
- **Integration**: Testcontainers
- **Performance**: k6

## 📚 Documentation

- **[Architecture](./ARCHITECTURE.md)**: Detailed architectural decisions and patterns
- **[ADRs](./docs/adr/)**: Architecture Decision Records
- **[Specs](./docs/specs/)**: Component specifications
- **[Standards](./docs/standards/)**: Coding standards by layer

## 🤖 AI Development Workflow

This monorepo follows a **Spec-Driven Development** workflow optimized for AI agents:

### 1. Intent Phase
Developer states the goal:
```
"Add password reset functionality to auth domain"
```

### 2. Spec Phase
AI reads `packages/domains/auth/SPEC.md` and proposes changes:
- New tRPC procedures needed
- Database schema modifications
- Integration points

### 3. Plan Phase
AI creates detailed implementation plan:
- Files to create/modify
- Tests to write
- Migration scripts

### 4. Execute Phase
AI implements following `STANDARDS.md`:
- Generates code matching existing patterns
- Writes comprehensive tests
- Updates documentation

## 📦 Creating New Packages

### Domain Package

```bash
# Generate new domain (future: will use NX generator)
mkdir -p packages/domains/my-domain/src
cp packages/domains/auth/SPEC.md packages/domains/my-domain/SPEC.md
# Edit SPEC.md with domain details
```

Each domain follows a consistent structure:
```
my-domain/
├── SPEC.md              # Domain specification
├── src/
│   ├── entities/        # Domain entities
│   ├── services/        # Business logic
│   ├── repositories/    # Data access
│   ├── procedures/      # tRPC procedures
│   ├── validators/      # Zod schemas
│   └── types/           # TypeScript types
└── tests/               # Tests (unit, integration)
```

## 🧪 Testing

```bash
# Run all tests
pnpm test

# Run unit tests only
pnpm test:unit

# Run integration tests
pnpm test:integration

# Run e2e tests
pnpm test:e2e

# Run tests for specific package
pnpm nx test @iam/auth
```

## 🏗️ Building

```bash
# Build all packages
pnpm build

# Build specific package
pnpm nx build @iam/auth

# Build with dependencies
pnpm nx build @iam/api
```

## 🔍 Type Checking

```bash
# Type check all packages
pnpm typecheck

# Type check specific package
pnpm nx typecheck @iam/auth
```

## 📊 Dependency Graph

```bash
# View project dependency graph
pnpm graph
```

## 🎨 Code Style

```bash
# Format all files
pnpm format

# Check formatting
pnpm format:check

# Lint all files
pnpm lint
```

## 🔒 Environment Variables

Each runtime has its own `.env` file. See `runtimes/*/README.md` for details.

## 🤝 Contributing

1. Read the [Architecture](./ARCHITECTURE.md) document
2. Review relevant [STANDARDS.md](./docs/standards/) files
3. Check existing [ADRs](./docs/adr/)
4. Follow the spec-driven workflow
5. Write tests for all changes
6. Ensure `pnpm build`, `pnpm test`, and `pnpm lint` pass

## 📝 License

UNLICENSED - Private project

## 🌟 Key Features

- ✅ **Full Type Safety**: From database to UI with zero runtime type assertions
- ✅ **AI-Optimized**: Structure designed for AI agent comprehension and modification
- ✅ **Fast Builds**: NX computational caching for instant rebuilds
- ✅ **Spec-Driven**: Explicit specifications guide development
- ✅ **Vertical Slices**: Self-contained domains with clear boundaries
- ✅ **Modern Stack**: Latest versions of TypeScript, Node, React
- ✅ **Comprehensive Testing**: Unit, integration, e2e, and performance tests
- ✅ **Developer Experience**: Excellent tooling, clear patterns, helpful documentation

---

**Built with ❤️ for the AI-native development era**
