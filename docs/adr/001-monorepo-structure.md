# ADR 001: Monorepo Structure with NX

**Status**: Accepted
**Date**: 2025-11-06
**Deciders**: Architecture Team

## Context

We need to structure our codebase to support:
- Multiple related applications (web, mobile, API, workers)
- Shared business logic and platform services
- Efficient builds and testing
- AI agent comprehension and modification
- Team collaboration at scale

## Decision

We will use **NX** as our monorepo build system with **pnpm** as the package manager.

### Directory Organization

```
iam/
├── packages/      # Reusable libraries
├── runtimes/      # Executable applications
├── databases/     # Database schemas
├── tests/         # Cross-cutting tests
├── tools/         # Build tools
├── infrastructure/# IaC
└── docs/          # Documentation
```

### Key Principles

1. **Separation of Libraries and Applications**
   - `packages/` contains reusable code
   - `runtimes/` contains executable applications

2. **Domain-Driven Organization**
   - Business logic organized by domain (auth, project, survey)
   - Platform services separated (graph, cache, database)

3. **Explicit Dependencies**
   - Use NX module boundaries to enforce dependency rules
   - Clear dependency graph visible via `nx graph`

4. **Build Optimization**
   - NX computational caching for fast rebuilds
   - Parallel execution of independent tasks
   - Only rebuild affected projects

## Alternatives Considered

### Turborepo
- **Pros**: Simpler, faster initial setup
- **Cons**: Less mature plugin ecosystem, fewer features
- **Reason not chosen**: NX offers better TypeScript support and more powerful dependency management

### Lerna
- **Pros**: Well-established, simple
- **Cons**: Slower builds, less caching, limited task orchestration
- **Reason not chosen**: NX is more modern and performant

### Rush
- **Pros**: Excellent for large teams, strict dependency management
- **Cons**: Steeper learning curve, more complex
- **Reason not chosen**: Over-engineered for our current scale

## Consequences

### Positive
- Fast builds with computational caching
- Clear dependency boundaries enforced by tooling
- Excellent TypeScript support
- Easy to run tasks across multiple projects
- Great visualization of project dependencies

### Negative
- Initial setup complexity
- NX-specific knowledge required
- Some overhead for small projects

### Neutral
- Need to maintain NX configuration
- Team needs to learn NX commands

## Implementation Notes

1. Use `nx.json` to configure caching and task pipelines
2. Use `tsconfig.base.json` for path mappings
3. Use `pnpm-workspace.yaml` to define package locations
4. Enforce module boundaries via ESLint rules

## References

- [NX Documentation](https://nx.dev)
- [Why NX](https://nx.dev/getting-started/why-nx)
- [NX vs Turborepo](https://nx.dev/concepts/more-concepts/turbo-and-nx)
