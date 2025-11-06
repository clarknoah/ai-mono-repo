# Root Standards for iAm Monorepo

**Last Updated**: 2025-11-06
**Status**: Active

## Purpose

This document defines the core standards that apply to ALL code in the iAm monorepo. These standards are designed to:
- Maximize AI agent comprehension
- Ensure consistency across the codebase
- Minimize tokens needed for context
- Enable predictable code patterns

## File Naming Conventions

### General Rules
- Use **kebab-case** for directories: `user-authentication/`
- Use **camelCase** for TypeScript files: `userAuthentication.service.ts`
- Use **PascalCase** for classes: `UserAuthenticationService`
- Use descriptive, explicit names (avoid abbreviations)

### File Type Suffixes

```
✅ Correct                           ❌ Incorrect
userAuthentication.service.ts       auth.ts
user.entity.ts                       user.ts
user.repository.ts                   userRepo.ts
loginInput.validator.ts              login.ts
userAuthentication.service.test.ts  userAuthentication.spec.ts
```

### Test Files
- Unit tests: `*.unit.test.ts`
- Integration tests: `*.integration.test.ts`
- E2E tests: `*.e2e.test.ts`

## TypeScript Standards

### Strict Mode
```typescript
// tsconfig.json - ALWAYS use strict mode
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "noUncheckedIndexedAccess": true
  }
}
```

### Type Annotations
```typescript
// ✅ Always annotate function return types
export function calculateTotal(items: Item[]): number {
  return items.reduce((sum, item) => sum + item.price, 0);
}

// ❌ Don't rely on inference for public APIs
export function calculateTotal(items: Item[]) {
  return items.reduce((sum, item) => sum + item.price, 0);
}
```

### Type Safety
```typescript
// ✅ Use discriminated unions for variants
type Result<T> =
  | { success: true; data: T }
  | { success: false; error: Error };

// ✅ Use branded types for IDs
type UserId = string & { __brand: 'UserId' };

// ❌ Avoid 'any' - use 'unknown' if truly needed
function process(data: unknown): void {
  // ... validate data first
}
```

### Imports
```typescript
// ✅ Use explicit imports from source
import { UserService } from '@iam/auth';
import type { User } from '@iam/shared-types';

// ✅ Group imports: external, internal, relative
import { z } from 'zod';
import express from 'express';

import { UserService } from '@iam/auth';
import { logger } from '@iam/shared-utils';

import { config } from './config';
import { helper } from './helper';

// ❌ Don't use deep imports
import { UserService } from '@iam/auth/src/services/userService';
```

## Code Organization

### File Structure
Every file follows this structure:
```typescript
// 1. Imports (grouped)
import { external } from 'external-package';
import { internal } from '@iam/package';
import { local } from './local';

// 2. Types and Interfaces
export interface UserData {
  id: string;
  email: string;
}

// 3. Constants
const MAX_RETRIES = 3;

// 4. Main Implementation
export class UserService {
  // ...
}

// 5. Helper functions (if needed)
function helper() {
  // ...
}
```

### Function Size
- **Target**: 20 lines or fewer per function
- **Maximum**: 50 lines (consider breaking up if larger)
- **Single Responsibility**: Each function does ONE thing

### Class Organization
```typescript
export class UserService {
  // 1. Private properties
  private readonly repository: UserRepository;

  // 2. Constructor
  constructor(repository: UserRepository) {
    this.repository = repository;
  }

  // 3. Public methods
  public async createUser(data: CreateUserInput): Promise<User> {
    // ...
  }

  // 4. Private methods
  private validateEmail(email: string): boolean {
    // ...
  }
}
```

## Documentation Standards

### When to Document

**DO Document**:
- Complex algorithms or business logic
- Non-obvious decisions or trade-offs
- Public APIs and interfaces
- Edge cases and gotchas

**DON'T Document**:
- Obvious code (e.g., `// Get user by ID`)
- Implementation details that are clear from code
- What the code does (use descriptive names instead)

### Documentation Style
```typescript
/**
 * Authenticates a user with email and password.
 *
 * Uses bcrypt for password comparison with 10 rounds of salting.
 * Rate limited to 5 attempts per 15 minutes per IP.
 *
 * @param email - User's email address
 * @param password - Plain text password
 * @returns JWT access token and refresh token
 * @throws AuthenticationError if credentials invalid
 * @throws RateLimitError if too many attempts
 */
export async function authenticateUser(
  email: string,
  password: string
): Promise<AuthTokens> {
  // Implementation
}
```

## Error Handling

### Custom Errors
```typescript
// ✅ Create domain-specific errors
export class AuthenticationError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly statusCode: number = 401
  ) {
    super(message);
    this.name = 'AuthenticationError';
  }
}

// Usage
throw new AuthenticationError('Invalid credentials', 'INVALID_CREDENTIALS');
```

### Error Propagation
```typescript
// ✅ Let errors bubble up, catch at boundaries
export async function processUser(userId: string): Promise<void> {
  const user = await userRepository.findById(userId); // Might throw
  await emailService.send(user.email, 'Welcome'); // Might throw
  // Don't catch here, let runtime/API layer handle
}

// ❌ Don't swallow errors
try {
  await processUser(userId);
} catch (error) {
  console.log('Error occurred'); // ❌ Lost context
}
```

## Async/Await

```typescript
// ✅ Always use async/await
export async function fetchUser(id: string): Promise<User> {
  const user = await userRepository.findById(id);
  return user;
}

// ❌ Don't mix callbacks and promises
export function fetchUser(id: string, callback: (user: User) => void): void {
  userRepository.findById(id).then(callback);
}

// ✅ Handle parallel operations
const [user, posts, comments] = await Promise.all([
  fetchUser(userId),
  fetchPosts(userId),
  fetchComments(userId),
]);
```

## Testing Standards

### Test Structure
```typescript
// Use describe/it blocks
describe('UserService', () => {
  describe('createUser', () => {
    it('should create user with valid input', async () => {
      // Arrange
      const input = { email: 'test@example.com', password: 'secret' };
      const mockRepository = createMockRepository();
      const service = new UserService(mockRepository);

      // Act
      const result = await service.createUser(input);

      // Assert
      expect(result.email).toBe(input.email);
      expect(mockRepository.create).toHaveBeenCalledOnce();
    });

    it('should throw error for invalid email', async () => {
      // ...
    });
  });
});
```

### Test Coverage
- **Minimum**: 80% code coverage
- **Target**: 90% for services and business logic
- **Focus**: Test behavior, not implementation

## Environment Variables

```typescript
// ✅ Validate at startup
import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']),
  DATABASE_URL: z.string().url(),
  REDIS_URL: z.string().url(),
  PORT: z.coerce.number().default(3000),
});

export const env = envSchema.parse(process.env);

// ❌ Don't access process.env directly
const dbUrl = process.env.DATABASE_URL; // No validation!
```

## Logging

```typescript
// ✅ Use structured logging
import { logger } from '@iam/shared-utils';

logger.info('User created', {
  userId: user.id,
  email: user.email,
  timestamp: new Date().toISOString(),
});

// ❌ Don't use console.log in production code
console.log('User created:', user.id);
```

## Git Commit Messages

### Format
```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types
- **feat**: New feature
- **fix**: Bug fix
- **docs**: Documentation only
- **style**: Code style changes (formatting)
- **refactor**: Code refactoring
- **test**: Adding or updating tests
- **chore**: Build process or tooling changes

### Examples
```
feat(auth): add password reset functionality

Implement password reset flow with email verification.
Includes rate limiting and token expiration.

Closes #123
```

## Security

### Secrets
- **NEVER** commit secrets or API keys
- Use environment variables
- Use `.env.example` for templates

### Input Validation
```typescript
// ✅ Always validate user input
import { z } from 'zod';

const userInputSchema = z.object({
  email: z.string().email(),
  age: z.number().min(0).max(150),
});

export function processUserInput(input: unknown): void {
  const validated = userInputSchema.parse(input); // Throws if invalid
  // Safe to use validated data
}
```

### SQL Injection
```typescript
// ✅ Use Prisma (parameterized by default)
await prisma.user.findUnique({ where: { email } });

// ❌ Never construct raw SQL with user input
await prisma.$executeRaw`SELECT * FROM users WHERE email = ${email}`;
```

## Performance

### Database Queries
```typescript
// ✅ Use select to limit fields
const user = await prisma.user.findUnique({
  where: { id },
  select: { id: true, email: true, name: true },
});

// ✅ Use indexes for common queries
// In schema.prisma:
model User {
  email String @unique
  @@index([createdAt])
}
```

### Caching
```typescript
// ✅ Cache expensive operations
import { cache } from '@iam/cache';

export async function getUser(id: string): Promise<User> {
  const cached = await cache.get(`user:${id}`);
  if (cached) return JSON.parse(cached);

  const user = await userRepository.findById(id);
  await cache.set(`user:${id}`, JSON.stringify(user), 3600);
  return user;
}
```

## AI Development Notes

### For AI Agents

When reading this codebase:
1. **Check SPEC.md** first to understand component purpose
2. **Follow STANDARDS.md** for implementation patterns
3. **Use existing code** as examples for new features
4. **Maintain consistency** - match existing patterns exactly
5. **Ask clarifying questions** if specifications are unclear

### Context Optimization

To minimize tokens:
1. **Read specific files** rather than entire directories
2. **Use grep** to find relevant code quickly
3. **Check tests** to understand expected behavior
4. **Review types** to understand data structures

---

**Questions?** See `docs/guides/` or ask a maintainer.
