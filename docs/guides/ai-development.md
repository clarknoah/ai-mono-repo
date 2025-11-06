# AI-Assisted Development Guide

This guide explains how to work with AI coding agents in the iAm monorepo.

## Philosophy

This monorepo is designed with **AI-first principles**:

1. **Spec-Driven Development**: Every component has a SPEC.md that AI can read to understand purpose and boundaries
2. **Consistent Patterns**: Uniform structure makes AI predictions more accurate
3. **Token Efficiency**: Minimize context needed for AI to understand code
4. **Self-Documenting**: Code structure and naming conventions tell the story

## Workflow: Spec → Plan → Execute

### 1. Intent Phase

Start by clearly stating your goal:

```
"Add password reset functionality to the auth domain"
```

### 2. Spec Phase

AI should:
1. Read `packages/domains/auth/SPEC.md`
2. Review related STANDARDS.md files
3. Propose changes to the spec

Example:
```markdown
## Changes to Auth Domain Spec

### New Procedures
- auth.requestPasswordReset (public)
- auth.resetPassword (public)

### New Services
- PasswordResetService

### Database Changes
- Add password_reset_tokens table

### External Dependencies
- Email service (send reset link)
```

### 3. Plan Phase

AI creates detailed implementation plan:

```markdown
## Implementation Plan

1. Database Schema
   - [ ] Add PasswordResetToken model to schema.prisma
   - [ ] Create migration

2. Entities
   - [ ] Create passwordResetToken.entity.ts

3. Repository
   - [ ] Create passwordResetToken.repository.ts
   - [ ] Add methods: create, findByToken, invalidate

4. Service
   - [ ] Create passwordReset.service.ts
   - [ ] Method: requestReset(email)
   - [ ] Method: resetPassword(token, newPassword)

5. Validators
   - [ ] Create requestPasswordResetInput.validator.ts
   - [ ] Create resetPasswordInput.validator.ts

6. Procedures
   - [ ] Create requestPasswordReset.procedure.ts
   - [ ] Create resetPassword.procedure.ts

7. Tests
   - [ ] Unit tests for PasswordResetService
   - [ ] Integration tests for reset flow

8. Documentation
   - [ ] Update auth domain SPEC.md
   - [ ] Add usage examples to README
```

### 4. Execute Phase

AI implements following STANDARDS.md:
- Generate code matching existing patterns
- Write comprehensive tests
- Update documentation

## Best Practices for AI Agents

### Reading Context

**Efficient Context Loading**:
```
1. Read SPEC.md first (understand purpose)
2. Read STANDARDS.md (understand patterns)
3. Read 1-2 example files (understand style)
4. Implement new feature
```

**Inefficient Context Loading** ❌:
```
1. Read entire domain directory
2. Read all similar files
3. Read tests
4. Read docs
5. Finally implement
```

### Following Standards

Always check standards before generating code:

```bash
# For domain packages
Read: docs/standards/packages/DOMAIN-STANDARDS.md
Read: docs/standards/ROOT-STANDARDS.md

# For specific layer
Read: packages/domains/[domain]/src/services/STANDARDS.md
```

### Naming Conventions

AI should follow these exact patterns:

```typescript
// ✅ Correct
userAuthentication.service.ts
user.entity.ts
loginInput.validator.ts
login.procedure.ts
userAuthentication.service.unit.test.ts

// ❌ Incorrect
authService.ts
userEntity.ts
loginValidator.ts
loginProc.ts
authService.test.ts
```

### Code Patterns

AI should match existing patterns:

**Services**:
```typescript
export class UserAuthenticationService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly config: AuthConfig
  ) {}

  public async authenticate(
    email: string,
    password: string
  ): Promise<AuthenticatedUser> {
    // Implementation
  }

  private validatePassword(password: string): boolean {
    // Helper
  }
}
```

**tRPC Procedures**:
```typescript
export const loginProcedure = publicProcedure
  .input(loginInputValidator)
  .output(authenticatedUserSchema)
  .mutation(async ({ input, ctx }) => {
    // Implementation
  });
```

**Error Handling**:
```typescript
try {
  // Operation
} catch (error) {
  if (error instanceof DomainError) {
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message: error.message,
      cause: error,
    });
  }
  throw new TRPCError({
    code: 'INTERNAL_SERVER_ERROR',
    message: 'Operation failed',
    cause: error,
  });
}
```

## AI Agent Instructions

### For Claude, ChatGPT, etc.

When working on this codebase:

1. **Read specifications first**
   - Always check SPEC.md before making changes
   - Understand domain boundaries

2. **Follow standards exactly**
   - Read relevant STANDARDS.md files
   - Match existing patterns precisely

3. **Be explicit**
   - Use descriptive names
   - Add types to everything
   - Document non-obvious code

4. **Test everything**
   - Write unit tests for services
   - Write integration tests for procedures
   - Include edge cases

5. **Commit atomically**
   - One feature per commit
   - Follow commit message format
   - Update documentation

### Example AI Session

**User**: "Add user profile update functionality"

**AI**:
```
I'll implement user profile update functionality. Let me start by reading the specs.

[Reads packages/domains/auth/SPEC.md]
[Reads docs/standards/packages/DOMAIN-STANDARDS.md]

Here's my plan:

1. Add updateProfile method to UserService
2. Create updateProfileInput.validator.ts
3. Create updateProfile.procedure.ts
4. Write tests
5. Update SPEC.md

Let me implement step by step...

[Implements each step]

Done! I've added:
- UserService.updateProfile() method
- Input validation with Zod
- tRPC procedure
- Unit and integration tests
- Updated documentation

All tests pass and type checking succeeds.
```

## Token Optimization

### Minimize Context

**Bad** (reading too much):
```
- Read entire domain directory (1000+ lines)
- Read all test files (500+ lines)
- Read all related domains (2000+ lines)
```

**Good** (targeted reading):
```
- Read SPEC.md (50 lines)
- Read STANDARDS.md (100 lines)
- Read one example service (50 lines)
- Implement (100 lines)
```

### Use grep/search

Instead of reading whole files:

```bash
# Find specific patterns
grep -r "class.*Service" packages/domains/auth/src/services/

# Find tRPC procedures
grep -r "Procedure = " packages/domains/*/src/procedures/

# Find validators
grep -r "z.object" packages/domains/*/src/validators/
```

## Common Mistakes to Avoid

### 1. Ignoring SPEC.md

❌ **Bad**: Implement feature without reading spec
✅ **Good**: Read spec, understand boundaries, then implement

### 2. Inconsistent Naming

❌ **Bad**: `authService.ts`, `userSvc.ts`, `loginService.ts`
✅ **Good**: `userAuthentication.service.ts`, `userRegistration.service.ts`

### 3. Missing Type Annotations

❌ **Bad**:
```typescript
export function authenticate(email, password) {
  // ...
}
```

✅ **Good**:
```typescript
export async function authenticate(
  email: string,
  password: string
): Promise<AuthenticatedUser> {
  // ...
}
```

### 4. Not Following Standards

❌ **Bad**: Implement in your own style
✅ **Good**: Match existing patterns exactly

### 5. No Tests

❌ **Bad**: Implement feature without tests
✅ **Good**: Write tests for all new code

## Verification Checklist

Before considering a task complete, verify:

- [ ] Read relevant SPEC.md files
- [ ] Followed STANDARDS.md patterns
- [ ] Added type annotations everywhere
- [ ] Wrote unit tests (80%+ coverage)
- [ ] Wrote integration tests for procedures
- [ ] Updated documentation
- [ ] Ran `pnpm lint` (no errors)
- [ ] Ran `pnpm test` (all pass)
- [ ] Ran `pnpm typecheck` (no errors)
- [ ] Ran `pnpm build` (builds successfully)

## Advanced: Working with Multiple Domains

When a feature spans multiple domains:

1. **Identify boundaries**
   - What belongs in each domain?
   - How should domains communicate?

2. **Use events for loose coupling**
   - Domain A emits event
   - Domain B listens to event
   - No direct dependencies

3. **Share through platform**
   - Use @iam/database for shared data
   - Use @iam/cache for shared cache
   - Use @iam/jobs for async operations

4. **Document cross-domain interactions**
   - Update both domain SPEC.md files
   - Document event contracts
   - Add integration tests

## Resources

- [Architecture Overview](../../ARCHITECTURE.md)
- [Root Standards](../standards/ROOT-STANDARDS.md)
- [Domain Standards](../standards/packages/DOMAIN-STANDARDS.md)
- [ADRs](../adr/)

---

**Remember**: This codebase is designed for AI. Trust the structure, follow the patterns, and you'll be productive quickly!
