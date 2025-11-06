# Domain Package Standards

**Last Updated**: 2025-11-06
**Applies To**: `packages/domains/*`

## Purpose

Domain packages contain business logic organized by vertical slice. Each domain is self-contained and represents a distinct business capability.

## Directory Structure

```
packages/domains/[domain-name]/
├── SPEC.md                         # Domain specification
├── README.md                       # Usage examples
├── package.json                    # Package configuration
├── tsconfig.json                   # TypeScript config
├── project.json                    # NX project config
├── src/
│   ├── entities/                   # Domain entities
│   │   ├── user.entity.ts
│   │   └── STANDARDS.md
│   ├── services/                   # Business logic
│   │   ├── userAuthentication.service.ts
│   │   └── STANDARDS.md
│   ├── repositories/               # Data access layer
│   │   ├── user.repository.ts
│   │   └── STANDARDS.md
│   ├── procedures/                 # tRPC procedures
│   │   ├── login.procedure.ts
│   │   ├── register.procedure.ts
│   │   └── STANDARDS.md
│   ├── validators/                 # Zod schemas
│   │   ├── loginInput.validator.ts
│   │   ├── registerInput.validator.ts
│   │   └── STANDARDS.md
│   ├── types/                      # Domain-specific types
│   │   └── index.ts
│   ├── errors/                     # Domain-specific errors
│   │   └── AuthenticationError.ts
│   ├── utils/                      # Domain utilities (rare)
│   │   └── helper.ts
│   └── index.ts                    # Public API
└── tests/
    ├── unit/
    │   └── userAuthentication.service.unit.test.ts
    ├── integration/
    │   └── login.integration.test.ts
    └── fixtures/
        └── userData.ts
```

## SPEC.md Template

Every domain MUST have a SPEC.md:

```markdown
# [Domain Name] Domain Specification

## Purpose
What business capability does this domain handle?

## Boundaries

### In Scope
- Feature A
- Feature B

### Out of Scope
- Feature X (handled by Y domain)
- Feature Z (not applicable)

## Dependencies

### Platform
- @iam/database (Prisma)
- @iam/cache (Redis)

### Shared
- @iam/shared-types
- @iam/shared-utils

## Public API

### Entities
- User
- Session

### Services
- UserAuthenticationService
- UserRegistrationService

### tRPC Procedures
- auth.login
- auth.register
- auth.logout
- auth.refreshToken

## Data Models

### Database Tables
- users
- sessions

### Cache Keys
- user:{userId}
- session:{sessionId}

## Events

### Emitted
- user.created
- user.authenticated
- user.logout

### Consumed
- (none)

## Integration Points

### External Services
- Email service (for verification)
- SMS service (for 2FA)

### Other Domains
- (Should be minimal)

## Configuration

### Environment Variables
- JWT_SECRET
- JWT_EXPIRY
- REFRESH_TOKEN_EXPIRY

## Security Considerations
- Passwords hashed with bcrypt (10 rounds)
- JWTs signed with RS256
- Rate limiting on login attempts
```

## Layer Standards

### 1. Entities (`entities/`)

Entities represent core domain objects.

```typescript
// user.entity.ts

/**
 * Core user entity representing an authenticated user in the system.
 */
export interface User {
  /** Unique user identifier (UUID v4) */
  id: string;

  /** User's email address (unique, validated) */
  email: string;

  /** User's display name */
  name: string;

  /** Hashed password (bcrypt, never exposed) */
  passwordHash: string;

  /** Account creation timestamp */
  createdAt: Date;

  /** Last update timestamp */
  updatedAt: Date;

  /** Whether email is verified */
  emailVerified: boolean;
}

/**
 * User without sensitive data (for API responses)
 */
export type PublicUser = Omit<User, 'passwordHash'>;

/**
 * User creation input
 */
export interface CreateUserInput {
  email: string;
  name: string;
  password: string;
}
```

**Rules**:
- Use **interfaces** for data structures
- Use **types** for derived/computed types
- Document all properties
- Never expose sensitive data in public types
- Keep entities pure (no business logic)

### 2. Services (`services/`)

Services contain business logic.

```typescript
// userAuthentication.service.ts
import type { User, PublicUser } from '../entities/user.entity';
import type { UserRepository } from '../repositories/user.repository';
import { AuthenticationError } from '../errors/AuthenticationError';
import { logger } from '@iam/shared-utils';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthenticatedUser {
  user: PublicUser;
  tokens: AuthTokens;
}

/**
 * Service handling user authentication operations.
 *
 * Responsibilities:
 * - Authenticate users with email/password
 * - Generate JWT tokens
 * - Validate and refresh tokens
 */
export class UserAuthenticationService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly jwtSecret: string,
    private readonly accessTokenExpiry: string = '15m',
    private readonly refreshTokenExpiry: string = '7d'
  ) {}

  /**
   * Authenticates a user with email and password.
   *
   * @param email - User's email address
   * @param password - Plain text password
   * @returns Authenticated user with tokens
   * @throws AuthenticationError if credentials invalid
   */
  public async authenticate(
    email: string,
    password: string
  ): Promise<AuthenticatedUser> {
    // Find user
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      logger.warn('Authentication failed: user not found', { email });
      throw new AuthenticationError('Invalid credentials', 'INVALID_CREDENTIALS');
    }

    // Verify password
    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      logger.warn('Authentication failed: invalid password', { email });
      throw new AuthenticationError('Invalid credentials', 'INVALID_CREDENTIALS');
    }

    // Generate tokens
    const tokens = this.generateTokens(user.id);

    // Log success
    logger.info('User authenticated successfully', { userId: user.id });

    // Return public user (no passwordHash)
    const { passwordHash: _, ...publicUser } = user;
    return { user: publicUser, tokens };
  }

  /**
   * Generates access and refresh tokens for a user.
   */
  private generateTokens(userId: string): AuthTokens {
    const accessToken = jwt.sign(
      { userId, type: 'access' },
      this.jwtSecret,
      { expiresIn: this.accessTokenExpiry }
    );

    const refreshToken = jwt.sign(
      { userId, type: 'refresh' },
      this.jwtSecret,
      { expiresIn: this.refreshTokenExpiry }
    );

    return { accessToken, refreshToken };
  }
}
```

**Rules**:
- One service per major business capability
- Use **constructor injection** for dependencies
- Return **domain entities**, not database models
- Use **descriptive method names** (authenticate, not auth)
- **Log important operations**
- **Don't leak sensitive data**
- Services should be **stateless**

### 3. Repositories (`repositories/`)

Repositories handle data access.

```typescript
// user.repository.ts
import type { User, CreateUserInput } from '../entities/user.entity';
import { prisma } from '@iam/database';
import { NotFoundError } from '../errors/NotFoundError';

/**
 * Repository for user data access.
 *
 * Abstracts database operations for User entity.
 */
export class UserRepository {
  /**
   * Finds a user by ID.
   *
   * @param id - User ID
   * @returns User if found
   * @throws NotFoundError if user doesn't exist
   */
  public async findById(id: string): Promise<User> {
    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundError('User', id);
    }

    return this.mapToEntity(user);
  }

  /**
   * Finds a user by email.
   *
   * @param email - User email
   * @returns User if found, null otherwise
   */
  public async findByEmail(email: string): Promise<User | null> {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    return user ? this.mapToEntity(user) : null;
  }

  /**
   * Creates a new user.
   *
   * @param input - User creation data
   * @returns Created user
   */
  public async create(input: CreateUserInput & { passwordHash: string }): Promise<User> {
    const user = await prisma.user.create({
      data: {
        email: input.email,
        name: input.name,
        passwordHash: input.passwordHash,
      },
    });

    return this.mapToEntity(user);
  }

  /**
   * Maps Prisma model to domain entity.
   */
  private mapToEntity(model: any): User {
    return {
      id: model.id,
      email: model.email,
      name: model.name,
      passwordHash: model.passwordHash,
      createdAt: model.createdAt,
      updatedAt: model.updatedAt,
      emailVerified: model.emailVerified,
    };
  }
}
```

**Rules**:
- One repository per aggregate root (entity)
- Return **domain entities**, not Prisma models
- Use **mapper functions** (mapToEntity)
- Handle **not found** cases explicitly
- Keep repositories **focused** (no business logic)
- Use **select** to limit fields when possible

### 4. Procedures (`procedures/`)

tRPC procedures expose domain functionality.

```typescript
// login.procedure.ts
import { z } from 'zod';
import { publicProcedure } from '@iam/api-context';
import { TRPCError } from '@trpc/server';
import { UserAuthenticationService } from '../services/userAuthentication.service';
import { loginInputValidator } from '../validators/loginInput.validator';
import { authTokensSchema, publicUserSchema } from '../validators/schemas';
import { AuthenticationError } from '../errors/AuthenticationError';

/**
 * Login procedure - authenticates a user with email and password.
 *
 * Rate limited to 5 attempts per 15 minutes per IP.
 */
export const loginProcedure = publicProcedure
  .input(loginInputValidator)
  .output(
    z.object({
      user: publicUserSchema,
      tokens: authTokensSchema,
    })
  )
  .mutation(async ({ input, ctx }) => {
    try {
      const authService = new UserAuthenticationService(
        ctx.userRepository,
        ctx.config.jwtSecret
      );

      const result = await authService.authenticate(input.email, input.password);

      return result;
    } catch (error) {
      if (error instanceof AuthenticationError) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: error.message,
          cause: error,
        });
      }

      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Authentication failed',
        cause: error,
      });
    }
  });
```

**Rules**:
- One procedure per API operation
- Use **validators** for input/output
- Map domain errors to **tRPC errors**
- Don't put business logic in procedures
- Use **descriptive names**
- Document rate limits and auth requirements

### 5. Validators (`validators/`)

Zod schemas for validation.

```typescript
// loginInput.validator.ts
import { z } from 'zod';

/**
 * Validation schema for login input.
 */
export const loginInputValidator = z.object({
  email: z
    .string()
    .email('Invalid email address')
    .toLowerCase()
    .trim(),

  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(100, 'Password too long'),
});

export type LoginInput = z.infer<typeof loginInputValidator>;
```

**Rules**:
- One validator per input/output type
- Use **descriptive error messages**
- Export **inferred types**
- Keep validators **pure** (no side effects)
- Use transforms (toLowerCase, trim) for normalization

## Package.json Template

```json
{
  "name": "@iam/auth",
  "version": "0.1.0",
  "private": true,
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest",
    "test:unit": "vitest run --testPathPattern=unit",
    "test:integration": "vitest run --testPathPattern=integration",
    "typecheck": "tsc --noEmit",
    "lint": "eslint ."
  },
  "dependencies": {
    "@iam/database": "workspace:*",
    "@iam/shared-types": "workspace:*",
    "@iam/shared-utils": "workspace:*",
    "@trpc/server": "^11.0.0",
    "bcrypt": "^5.1.1",
    "jsonwebtoken": "^9.0.2",
    "zod": "^3.23.0"
  },
  "devDependencies": {
    "@types/bcrypt": "^5.0.2",
    "@types/jsonwebtoken": "^9.0.7",
    "vitest": "^2.1.8"
  }
}
```

## Public API (index.ts)

```typescript
// index.ts - Export public API only

// Entities
export type { User, PublicUser, CreateUserInput } from './entities/user.entity';

// Services
export { UserAuthenticationService } from './services/userAuthentication.service';
export type { AuthTokens, AuthenticatedUser } from './services/userAuthentication.service';

// Procedures (for router)
export { loginProcedure } from './procedures/login.procedure';
export { registerProcedure } from './procedures/register.procedure';
export { logoutProcedure } from './procedures/logout.procedure';

// Validators (for reuse)
export { loginInputValidator } from './validators/loginInput.validator';
export type { LoginInput } from './validators/loginInput.validator';

// Errors
export { AuthenticationError } from './errors/AuthenticationError';

// DO NOT export:
// - Repositories (internal only)
// - Private helpers
// - Implementation details
```

## Dependencies

### Allowed Dependencies

```
Domain Package Can Depend On:
├── @iam/platform/*      ✅ (database, cache, etc.)
├── @iam/shared/*        ✅ (types, utils, config)
├── External packages    ✅ (zod, bcrypt, etc.)
├── @iam/domain/*        ⚠️ (discouraged, requires approval)
└── @iam/runtime/*       ❌ (NEVER)
```

### Adding Dependencies

Before adding a new dependency, ask:
1. Is this needed in the domain, or should it be in platform/shared?
2. Does this increase bundle size significantly?
3. Is this package well-maintained?
4. Are there security vulnerabilities?

## Testing

```typescript
// tests/unit/userAuthentication.service.unit.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { UserAuthenticationService } from '../../src/services/userAuthentication.service';
import { UserRepository } from '../../src/repositories/user.repository';
import { AuthenticationError } from '../../src/errors/AuthenticationError';
import { mockUser } from '../fixtures/userData';

describe('UserAuthenticationService', () => {
  let service: UserAuthenticationService;
  let mockRepository: UserRepository;

  beforeEach(() => {
    mockRepository = {
      findByEmail: vi.fn(),
    } as any;

    service = new UserAuthenticationService(
      mockRepository,
      'test-secret'
    );
  });

  describe('authenticate', () => {
    it('should authenticate user with valid credentials', async () => {
      // Arrange
      const email = 'test@example.com';
      const password = 'password123';
      mockRepository.findByEmail = vi.fn().resolvedValue(mockUser);

      // Act
      const result = await service.authenticate(email, password);

      // Assert
      expect(result.user.email).toBe(email);
      expect(result.tokens.accessToken).toBeDefined();
      expect(mockRepository.findByEmail).toHaveBeenCalledWith(email);
    });

    it('should throw AuthenticationError for invalid email', async () => {
      // Arrange
      mockRepository.findByEmail = vi.fn().resolvedValue(null);

      // Act & Assert
      await expect(
        service.authenticate('wrong@example.com', 'password')
      ).rejects.toThrow(AuthenticationError);
    });
  });
});
```

---

**Next**: See runtime standards for how to compose domain procedures into APIs.
