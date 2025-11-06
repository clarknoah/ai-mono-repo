# ADR 003: tRPC for API Development

**Status**: Accepted
**Date**: 2025-11-06
**Deciders**: Architecture Team

## Context

We need an API layer that:
- Provides end-to-end type safety from backend to frontend
- Minimizes boilerplate and duplication
- Integrates well with our TypeScript monorepo
- Is easy for AI agents to understand and generate
- Supports real-time communication

## Decision

We will use **tRPC** as our primary API layer instead of REST or GraphQL.

### Architecture

```
Frontend (TanStack Query)
    ↓ (typed procedures)
tRPC Client
    ↓ (HTTP/WebSocket)
tRPC Server
    ↓ (router)
Domain Procedures
    ↓ (services)
Domain Services
    ↓ (repositories)
Database
```

### Key Benefits

1. **End-to-End Type Safety**
   - Backend types automatically available in frontend
   - No code generation step needed
   - Catch errors at compile time

2. **Zero Boilerplate**
   - No need to write API types, DTOs, or interfaces
   - No OpenAPI/Swagger spec to maintain
   - AI can generate procedures without extra metadata

3. **Excellent DX**
   - Auto-complete for all API calls
   - Inline documentation
   - Instant feedback on breaking changes

4. **AI-Friendly**
   - Clear procedure definitions
   - Zod validators are self-documenting
   - Pattern is consistent and predictable

## Example

### Backend Procedure
```typescript
// packages/domains/auth/src/procedures/login.procedure.ts
import { z } from 'zod';
import { publicProcedure } from '@iam/api-context';
import { loginInputValidator } from '../validators/loginInput.validator';

export const loginProcedure = publicProcedure
  .input(loginInputValidator)
  .output(z.object({
    accessToken: z.string(),
    refreshToken: z.string(),
    user: userSchema,
  }))
  .mutation(async ({ input, ctx }) => {
    // Implementation
    return authService.login(input);
  });
```

### Frontend Usage
```typescript
// packages/ui/web/src/hooks/useLogin.ts
import { trpc } from '@/lib/trpc';

export function useLogin() {
  return trpc.auth.login.useMutation({
    onSuccess: (data) => {
      // data is fully typed!
      console.log(data.user.email);
    },
  });
}
```

## Alternatives Considered

### REST API
- **Pros**: Well-understood, standard
- **Cons**: No type safety, requires OpenAPI maintenance, more boilerplate
- **Reason not chosen**: Doesn't leverage TypeScript monorepo

### GraphQL
- **Pros**: Flexible queries, strong type system
- **Cons**: Requires schema maintenance, more complex, steeper learning curve
- **Reason not chosen**: Over-engineered for our needs, harder for AI to generate

### gRPC
- **Pros**: Performant, strong types
- **Cons**: Requires protobuf, not web-native, complex setup
- **Reason not chosen**: Not suitable for web clients

## Consequences

### Positive
- **Type Safety**: Catch API errors at compile time
- **Developer Productivity**: No manual type definitions or API clients
- **Refactoring**: Rename/change types and see all usages immediately
- **AI Generation**: Simple pattern for AI to follow
- **Integration**: Works perfectly with TanStack Query

### Negative
- **Vendor Lock-in**: Tightly coupled to tRPC
- **Learning Curve**: Team needs to learn tRPC patterns
- **Public API**: Not suitable for third-party API consumers (use REST wrapper)

### Neutral
- **Monorepo Required**: Only works well in monorepo (which we have)
- **TypeScript Only**: Only works with TypeScript clients (which we use)

## Implementation Notes

### Structure

1. **Procedures in Domains**
   - Each domain exports its tRPC procedures
   - Procedures live in `packages/domains/*/src/procedures/`

2. **Router in Runtime**
   - Root router in `runtimes/api/src/router.ts`
   - Combines all domain procedures

3. **Client in UI**
   - tRPC client setup in UI packages
   - TanStack Query integration

### Validation

- Use Zod for input/output validation
- Validators live in `packages/domains/*/src/validators/`
- Share validators between procedures

### Error Handling

- Use tRPC error codes (BAD_REQUEST, UNAUTHORIZED, etc.)
- Custom error classes in domains
- Error mapping in procedures

## Migration Path

1. Start with tRPC for internal APIs
2. If public API needed, create REST wrapper around tRPC procedures
3. Use same validation and business logic

## References

- [tRPC Documentation](https://trpc.io)
- [tRPC with NX](https://trpc.io/docs/nx)
- [End-to-End Type Safety](https://trpc.io/docs/concepts)
